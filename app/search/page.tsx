"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Search, Clock, Car, Train, Footprints, Plane, ThermometerSun, User } from 'lucide-react';
import AnalogClockSlider from '../../components/AnalogClockSlider';

// ==========================================
// データ・ロジック定義
// ==========================================

const CATEGORY_DATA: Record<number, { min: number; max: number; name: string; rainStrong: boolean }> = {
  1: { min: -10, max: 8,  name: '真冬用ダウン', rainStrong: false },
  2: { min: 5,   max: 12, name: '厚手ブルゾン', rainStrong: true },
  3: { min: 8,   max: 15, name: '防風ジャケット', rainStrong: true },
  4: { min: 12,  max: 20, name: '薄手ブルゾン', rainStrong: true },
  5: { min: 15,  max: 22, name: 'ジャケット', rainStrong: false },
  6: { min: 2,   max: 10, name: '冬用コート', rainStrong: false },
  7: { min: 10,  max: 18, name: '春秋コート', rainStrong: true },
  8: { min: 18,  max: 25, name: 'カーディガン', rainStrong: false },
};

type Item = {
  id: string;
  categoryId: number;
  name: string;
  thickness: string;
  weight: string;
  windproof: string;
  color?: string;
};

type Log = {
  id: string;
  itemName: string;
  minTemp: number;
  rating: 'good' | 'ok' | 'bad' | null;
};

type UserType = 'cold_sensitive' | 'normal' | 'heat_sensitive';

function getBestOuter(
  items: Item[], 
  minTemp: number, 
  maxTemp: number, 
  windSpeed: number, 
  transport: string, 
  weatherCode: number, 
  logs: Log[],
  userType: UserType
) {
  if (items.length === 0) return null;
  let bestItem = items[0];
  let maxScore = -9999;

  const isRainy = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 99);
  const isSnowy = (weatherCode >= 71 && weatherCode <= 77);
  const isSunny = (weatherCode === 0 || weatherCode === 1);
  const isBadWeather = isRainy || isSnowy;

  const currentMonth = new Date().getMonth() + 1;
  const isAutumnWinter = currentMonth >= 10 || currentMonth <= 2;

  let effectiveTemp = minTemp;
  effectiveTemp -= Math.max(0, windSpeed - 1);
  if (isSunny) effectiveTemp += 2;
  
  if (userType === 'cold_sensitive') effectiveTemp -= 3;
  if (userType === 'heat_sensitive') effectiveTemp += 3;

  if (isAutumnWinter) effectiveTemp -= 1;

  items.forEach((item) => {
    const cat = CATEGORY_DATA[item.categoryId];
    let rangeMin = cat ? cat.min : 15;
    let rangeMax = cat ? cat.max : 20;

    if (item.thickness === 'thick') { rangeMin -= 3; rangeMax -= 2; }
    if (item.thickness === 'thin')  { rangeMin += 3; rangeMax += 3; }

    let baseScore = 100;

    if (effectiveTemp >= rangeMin && effectiveTemp <= rangeMax) {
      baseScore = 100;
    } else if (effectiveTemp < rangeMin) {
      baseScore = 100 - (rangeMin - effectiveTemp) * 15; 
    } else {
      baseScore = 100 - (effectiveTemp - rangeMax) * 8;
    }

    if (maxTemp > rangeMax + 7) {
      baseScore -= 20;
    }

    if (windSpeed >= 5) {
      if (item.windproof === 'bad') baseScore += 20;
      if (item.windproof === 'good') baseScore -= 15;
    }

    if (transport === 'walk') {
      if (item.weight === 'light') baseScore += 10;
      if (item.weight === 'heavy') baseScore -= 10;
    }
    if (transport === 'car') {
      if ([1, 2, 4].includes(item.categoryId)) baseScore += 10; 
      if ([6, 7].includes(item.categoryId)) baseScore -= 5;
    }

    if (isBadWeather) {
      if (cat.rainStrong) baseScore += 15;
      else baseScore -= 30;
    }

    let fbScore = 0;
    let fbCount = 0;
    logs.forEach(log => {
      if (log.itemName === item.name && Math.abs(log.minTemp - minTemp) < 4) {
        if (log.rating === 'good') fbScore += 100;
        if (log.rating === 'ok')   fbScore += 70;
        if (log.rating === 'bad')  fbScore += 0;
        fbCount++;
      }
    });

    let finalScore = baseScore;
    if (fbCount > 0) {
      finalScore = (baseScore * 0.5) + ((fbScore / fbCount) * 0.5);
    }

    if (finalScore > maxScore) {
      maxScore = finalScore;
      bestItem = item;
    }
  });

  return { item: bestItem, score: maxScore };
}

function getIdealCategory(minTemp: number, userType: UserType) {
  let targetTemp = minTemp;
  if (userType === 'cold_sensitive') targetTemp -= 3;
  if (userType === 'heat_sensitive') targetTemp += 3;

  let bestCatId = 8;
  let minDiff = 999;
  
  Object.entries(CATEGORY_DATA).forEach(([idStr, data]) => {
    const id = parseInt(idStr);
    const mid = (data.min + data.max) / 2;
    const diff = Math.abs(mid - targetTemp);
    if (diff < minDiff) {
      minDiff = diff;
      bestCatId = id;
    }
  });
  return bestCatId;
}

// ==========================================
// 画面コンポーネント
// ==========================================

export default function SearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [transport, setTransport] = useState('train');
  const [searchMode, setSearchMode] = useState<'current' | 'travel'>('current');
  const [locationQuery, setLocationQuery] = useState('');
  const [userType, setUserType] = useState<UserType>('normal');

  // ▼▼▼ 追加：起動時に前回の設定を読み込む ▼▼▼
  useEffect(() => {
    const savedUserType = localStorage.getItem('user_type') as UserType;
    if (savedUserType) {
      setUserType(savedUserType);
    }
  }, []);
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  const handleSearch = async () => {
    setLoading(true);

    try {
      let lat: number;
      let lon: number;
      let locationName: string;

      if (searchMode === 'current') {
        const position: any = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        locationName = "現在地";
      } else {
        if (!locationQuery) {
          alert('行き先を入力してください');
          setLoading(false);
          return;
        }
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`
        );
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) {
          alert('場所が見つかりませんでした。');
          setLoading(false);
          return;
        }
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
        locationName = locationQuery; 
      }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&current_weather=true&timezone=auto`
      );
      const data = await res.json();

      const startHour = parseInt(startTime.split(':')[0]); 
      const endHour = parseInt(endTime.split(':')[0]);
      const safeEndHour = endHour >= startHour ? endHour : 23;

      const hourlyTemps = data.hourly.temperature_2m.slice(0, 24);
      const targetTemps = hourlyTemps.slice(startHour, safeEndHour + 1);
      
      const chartData = targetTemps.map((temp: number, index: number) => ({
        hour: startHour + index,
        temp: temp
      }));

      const minTemp = Math.min(...targetTemps);
      const maxTemp = Math.max(...targetTemps);
      const windSpeed = data.current_weather.windspeed;
      const weatherCode = data.current_weather.weathercode;

      const items = JSON.parse(localStorage.getItem('my_items') || '[]');
      const logs = JSON.parse(localStorage.getItem('my_logs') || '[]');

      let suggestion = null;
      if (items.length > 0) {
        suggestion = getBestOuter(items, minTemp, maxTemp, windSpeed, transport, weatherCode, logs, userType);
      } 
      
      if (!suggestion || suggestion.score < 50) {
        const effectiveMin = minTemp - Math.max(0, windSpeed - 1);
        const idealId = getIdealCategory(effectiveMin, userType);
        const idealName = CATEGORY_DATA[idealId].name;
        
        suggestion = {
          item: {
            id: 'dummy',
            name: `推奨: ${idealName}`,
            categoryId: idealId,
            thickness: 'normal',
            weight: 'normal',
            windproof: 'normal',
            color: '#cccccc',
            image: null,
            isRecommendation: true
          },
          score: 100
        };
      }

      const resultData = {
        suggestion,
        weather: { minTemp, maxTemp, windSpeed, weatherCode },
        chartData,
        conditions: { startTime, endTime, transport, locationName, userType }
      };

      sessionStorage.setItem('search_result', JSON.stringify(resultData));
      router.push('/result');

    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">何を着ていく？</h1>
      </div>

      <div className="max-w-md mx-auto space-y-8 bg-white p-6 rounded-2xl shadow-sm">
          
        {/* 場所選択 */}
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
            <MapPin size={16} /> 場所・行き先
          </label>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setSearchMode('current')} className={`flex-1 py-3 font-bold rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${searchMode === 'current' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-100 text-gray-400'}`}>
              <MapPin size={18} /> 現在地
            </button>
            <button onClick={() => setSearchMode('travel')} className={`flex-1 py-3 font-bold rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${searchMode === 'travel' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-gray-100 text-gray-400'}`}>
              <Plane size={18} /> 旅行・遠出
            </button>
          </div>
          {searchMode === 'travel' && (
            <div className="animate-fade-in">
              <input type="text" placeholder="行き先を入力 (例: USJ、金閣寺)" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-bold text-gray-800 placeholder-gray-400"/>
            </div>
          )}
        </div>

        {/* 時間 */}
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-4 flex items-center justify-center gap-2">
            <Clock size={18} /> 外出時間を設定
          </label>
          <AnalogClockSlider startTime={startTime} endTime={endTime} onChange={(newStart, newEnd) => { setStartTime(newStart); setEndTime(newEnd); }} />
        </div>

        {/* 体質選択 */}
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 flex items-center gap-2">
            <User size={16} /> 体質・好み
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cold_sensitive', label: '寒がり', icon: '🥶' },
              { id: 'normal', label: '普通', icon: '🙂' },
              { id: 'heat_sensitive', label: '暑がり', icon: '🥵' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setUserType(type.id as UserType);
                  // ▼▼▼ ここで保存！ ▼▼▼
                  localStorage.setItem('user_type', type.id);
                }}
                className={`py-3 rounded-lg flex flex-col items-center gap-1 text-xs font-bold border-2 transition-all
                  ${userType === type.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-transparent bg-gray-50 text-gray-500'}`}
              >
                <span className="text-lg">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 移動手段 */}
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">移動手段</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ id: 'walk', label: '徒歩', icon: <Footprints size={18} /> }, { id: 'train', label: '電車', icon: <Train size={18} /> }, { id: 'car', label: '車', icon: <Car size={18} /> }].map((t) => (
              <button key={t.id} onClick={() => setTransport(t.id)} className={`py-3 rounded-lg flex flex-col items-center gap-1 text-xs font-bold border-2 transition-all ${transport === t.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent bg-gray-50 text-gray-500'}`}>{t.icon}{t.label}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSearch} disabled={loading} className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 transform active:scale-95 ${searchMode === 'travel' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {loading ? '計算中...' : (<><Search size={20} /> {searchMode === 'travel' ? '現地のコーデを検索' : 'コーディネートを検索'}</>)}
        </button>
      </div>
    </main>
  );
}