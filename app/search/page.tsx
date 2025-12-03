"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Search, Clock, Car, Train, Footprints, Plane, User } from 'lucide-react';
import AnalogClockSlider from '../../components/AnalogClockSlider';

// ==========================================
// データ・ロジック定義
// ==========================================

// ▼▼▼ 修正点①：適温レンジを「少し寒め」にシフト（日本の都市部は歩くと暑いため） ▼▼▼
const CATEGORY_DATA: Record<number, { min: number; max: number; name: string; rainStrong: boolean }> = {
  1: { min: -20, max: 5,  name: '真冬用ダウン', rainStrong: false }, // 5℃超えたら暑い
  2: { min: 3,   max: 10, name: '厚手ブルゾン', rainStrong: true },
  3: { min: 7,   max: 15, name: '防風ジャケット', rainStrong: true },
  4: { min: 12,  max: 20, name: '薄手ブルゾン', rainStrong: true },
  5: { min: 15,  max: 23, name: 'ジャケット', rainStrong: false },
  6: { min: 3,   max: 11, name: '冬用コート', rainStrong: false },   // 3℃くらいからコートで頑張れる
  7: { min: 9,   max: 17, name: '春秋コート', rainStrong: true },
  8: { min: 16,  max: 25, name: 'カーディガン', rainStrong: false },
};

type Item = {
  id: string;
  categoryId: number;
  name: string;
  thickness: string;
  weight: string;
  windproof: string;
  color?: string;
  warmth?: number;
  hasHood?: boolean;
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
  hourlyTemps: number[], 
  windSpeed: number, 
  humidity: number,
  transport: string, 
  weatherCode: number, 
  startHour: number,
  endHour: number,
  logs: Log[],
  userType: UserType
) {
  if (items.length === 0) return null;
  let bestItem = items[0];
  let minTotalPenalty = 999999;

  const isRainy = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 99);
  const isSnowy = (weatherCode >= 71 && weatherCode <= 77);
  const isSunny = (weatherCode === 0 || weatherCode === 1);
  const isBadWeather = isRainy || isSnowy;
  const currentMonth = new Date().getMonth() + 1;
  const isAutumnWinter = currentMonth >= 10 || currentMonth <= 2;

  items.forEach((item) => {
    const cat = CATEGORY_DATA[item.categoryId];
    let rangeMin = cat ? cat.min : 15;
    let rangeMax = cat ? cat.max : 20;

    // 保温レベル補正
    const itemWarmth = item.warmth || 3; 
    const warmthOffset = (itemWarmth - 3) * 2.0; // 影響度を少しマイルドに
    rangeMin -= warmthOffset; 
    rangeMax -= (warmthOffset * 0.5);

    if (!item.warmth) {
        if (item.thickness === 'thick') { rangeMin -= 2; rangeMax -= 1; }
        if (item.thickness === 'thin')  { rangeMin += 2; rangeMax += 2; }
    }

    let totalPenalty = 0;

    hourlyTemps.forEach(temp => {
      let effectiveTemp = temp;
      effectiveTemp -= Math.max(0, windSpeed - 1);
      
      if (temp <= 10 && humidity >= 60) {
        effectiveTemp -= (humidity - 60) / 10 * 0.3; // 湿度影響を少し下げる
      }
      
      // ▼▼▼ 修正点②：移動手段による体感温度変化を強化 ▼▼▼
      if (transport === 'walk') effectiveTemp += 4.0; // 歩きはかなり温まる
      if (isSunny) effectiveTemp += 2.0;
      
      if (userType === 'cold_sensitive') effectiveTemp -= 3;
      if (userType === 'heat_sensitive') effectiveTemp += 3;
      if (isAutumnWinter) effectiveTemp -= 1;

      // ペナルティ計算
      if (effectiveTemp < rangeMin) {
        // 寒い：絶対嫌なのでペナルティ大
        totalPenalty += (rangeMin - effectiveTemp) * 4.0; 
      } else if (effectiveTemp > rangeMax) {
        // 暑い：電車や徒歩ならペナルティを重くする（蒸れるから）
        let heatPenaltyRate = 1.0;
        if (transport === 'train' || transport === 'walk') heatPenaltyRate = 2.5; 
        
        totalPenalty += (effectiveTemp - rangeMax) * heatPenaltyRate;
      }
    });

    // 状況補正
    if (windSpeed >= 5) {
      if (item.windproof === 'bad') totalPenalty -= 20;
      if (item.windproof === 'good') totalPenalty += 30;
      if (item.hasHood) totalPenalty -= 10;
    }

    if (transport === 'walk') {
      if (item.weight === 'heavy') totalPenalty += 50;
      if (item.weight === 'light') totalPenalty -= 20;
    }
    if (transport === 'car') {
      if ([6, 7].includes(item.categoryId)) totalPenalty += 20;
    }

    if (isBadWeather) {
      if (!item.hasHood) totalPenalty += 50;
      if (!cat.rainStrong) totalPenalty += 100;
    }

    // FB補正
    logs.forEach(log => {
      if (log.itemName === item.name && Math.abs(log.minTemp - Math.min(...hourlyTemps)) < 4) {
        if (log.rating === 'good') totalPenalty -= 150;
        if (log.rating === 'bad')  totalPenalty += 150;
      }
    });

    if (totalPenalty < minTotalPenalty) {
      minTotalPenalty = totalPenalty;
      bestItem = item;
    }
  });

  // --- インナー＆アドバイス（引き算ロジック強化） ---
  
  const minRawTemp = Math.min(...hourlyTemps);
  let minEffective = minRawTemp - Math.max(0, windSpeed - 1);
  if (isSunny) minEffective += 2;
  if (userType === 'cold_sensitive') minEffective -= 3;
  if (userType === 'heat_sensitive') minEffective += 3;

  // ▼▼▼ 修正点③：アウターの暖かさボーナスを増量（インナーを薄くするため） ▼▼▼
  let outerBonus = 0;
  if (bestItem.categoryId === 1) outerBonus += 10; // ダウンは+10℃扱い（超暖かい）
  if (bestItem.categoryId === 2) outerBonus += 6;
  if (bestItem.categoryId === 6) outerBonus += 6;
  if (bestItem.warmth) outerBonus += (bestItem.warmth - 3) * 2;

  const innerJudgeTemp = minEffective + outerBonus;

  let innerSuggestion = "Tシャツ / カットソー";
  // 基準を下げて、厚着になりにくくする
  if (innerJudgeTemp < 3) innerSuggestion = "ヒートテック + 厚手ニット"; // 相当寒くないと出ない
  else if (innerJudgeTemp < 8) innerSuggestion = "ニット / スウェット";
  else if (innerJudgeTemp < 15) innerSuggestion = "シャツ / 薄手ニット";
  else if (innerJudgeTemp < 22) innerSuggestion = "ロンT / シャツ";
  else innerSuggestion = "Tシャツ / 肌着";

  let adviceText = "一日中快適に過ごせそうです。";
  const advices = [];
  
  if (outerBonus >= 6 && Math.max(...hourlyTemps) > 12) advices.push("アウターが十分暖かいので、インナーは薄めでOK。");
  else if (minEffective < 5 && outerBonus < 3) advices.push("アウターだけでは寒いので、重ね着で防寒を。");

  if (isBadWeather && !bestItem.hasHood) advices.push("雨予報です。傘を忘れずに。");
  else if (isBadWeather && bestItem.hasHood) advices.push("フード付きなので多少の雨なら安心。");
  
  if (windSpeed >= 5) advices.push("風が強いので体感は寒いです。");
  
  // 寒暖差判定
  if (Math.max(...hourlyTemps) - Math.min(...hourlyTemps) > 10) advices.push("寒暖差が激しいので調整しやすい服装で。");
  
  const hasNight = startHour >= 18 || endHour >= 18 || startHour <= 5;
  if (hasNight) advices.push("帰りは冷え込みます。");

  if (advices.length > 0) adviceText = advices.join(" ");

  const displayScore = Math.max(0, 100 - (minTotalPenalty / (hourlyTemps.length * 5)));

  return { item: bestItem, score: Math.round(displayScore), inner: innerSuggestion, advice: adviceText };
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
    if (diff < minDiff) { minDiff = diff; bestCatId = id; }
  });
  return bestCatId;
}

export default function SearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [transport, setTransport] = useState('train');
  const [searchMode, setSearchMode] = useState<'current' | 'travel'>('current');
  const [locationQuery, setLocationQuery] = useState('');
  const [userType, setUserType] = useState<UserType>('normal');

  useEffect(() => {
    const savedUserType = localStorage.getItem('user_type') as UserType;
    if (savedUserType) setUserType(savedUserType);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let lat: number, lon: number, locationName: string;
      if (searchMode === 'current') {
        const position: any = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
        lat = position.coords.latitude; lon = position.coords.longitude; locationName = "現在地";
      } else {
        if (!locationQuery) { alert('行き先を入力してください'); setLoading(false); return; }
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`);
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) { alert('場所が見つかりませんでした。'); setLoading(false); return; }
        lat = parseFloat(geoData[0].lat); lon = parseFloat(geoData[0].lon); locationName = locationQuery;
      }

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,weathercode&current_weather=true&timezone=auto`);
      const data = await res.json();

      const startHour = parseInt(startTime.split(':')[0]); 
      const endHour = parseInt(endTime.split(':')[0]);
      const safeEndHour = endHour >= startHour ? endHour : 23;
      
      const targetTemps = data.hourly.temperature_2m.slice(startHour, safeEndHour + 1);
      const chartData = targetTemps.map((temp: number, index: number) => ({ hour: startHour + index, temp: temp }));
      const minTemp = Math.min(...targetTemps);
      const maxTemp = Math.max(...targetTemps);
      const windSpeed = data.current_weather.windspeed;
      const weatherCode = data.current_weather.weathercode;
      
      const humidityArr = data.hourly.relativehumidity_2m.slice(startHour, safeEndHour + 1);
      const avgHumidity = humidityArr.reduce((a: number, b: number) => a + b, 0) / humidityArr.length;

      const items = JSON.parse(localStorage.getItem('my_items') || '[]');
      const logs = JSON.parse(localStorage.getItem('my_logs') || '[]');

      let suggestion = null;
      if (items.length > 0) {
        suggestion = getBestOuter(items, targetTemps, windSpeed, avgHumidity, transport, weatherCode, startHour, endHour, logs, userType);
      }
      
      if (!suggestion || suggestion.score < 50) {
        const effectiveMin = minTemp - Math.max(0, windSpeed - 1);
        const idealId = getIdealCategory(effectiveMin, userType);
        const idealName = CATEGORY_DATA[idealId].name;
        suggestion = {
          item: {
            id: 'dummy', name: `推奨: ${idealName}`, categoryId: idealId, thickness: 'normal',
            weight: 'normal', windproof: 'normal', color: '#cccccc', image: null, isRecommendation: true
          },
          score: 100,
          inner: "ニット / スウェット", advice: "手持ちに最適なものがありませんでした。"
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
    } catch (error) { console.error(error); alert('エラーが発生しました。'); setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-800">何を着ていく？</h1>
      </div>
      <div className="max-w-md mx-auto space-y-8 bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><MapPin size={16} /> 場所・行き先</label>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setSearchMode('current')} className={`flex-1 py-3 font-bold rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${searchMode === 'current' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-100 text-gray-400'}`}><MapPin size={18} /> 現在地</button>
            <button onClick={() => setSearchMode('travel')} className={`flex-1 py-3 font-bold rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${searchMode === 'travel' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-gray-100 text-gray-400'}`}><Plane size={18} /> 旅行・遠出</button>
          </div>
          {searchMode === 'travel' && <div className="animate-fade-in"><input type="text" placeholder="行き先を入力 (例: USJ、金閣寺)" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-bold text-gray-800 placeholder-gray-400"/></div>}
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-4 flex items-center justify-center gap-2"><Clock size={18} /> 外出時間を設定</label>
          <AnalogClockSlider startTime={startTime} endTime={endTime} onChange={(newStart, newEnd) => { setStartTime(newStart); setEndTime(newEnd); }} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 flex items-center gap-2"><User size={16} /> 体質・好み</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ id: 'cold_sensitive', label: '寒がり', icon: '🥶' }, { id: 'normal', label: '普通', icon: '🙂' }, { id: 'heat_sensitive', label: '暑がり', icon: '🥵' }].map((type) => (
              <button key={type.id} onClick={() => { setUserType(type.id as UserType); localStorage.setItem('user_type', type.id); }} className={`py-3 rounded-lg flex flex-col items-center gap-1 text-xs font-bold border-2 transition-all ${userType === type.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent bg-gray-50 text-gray-500'}`}><span className="text-lg">{type.icon}</span>{type.label}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">移動手段</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ id: 'walk', label: '徒歩', icon: <Footprints size={18} /> }, { id: 'train', label: '電車', icon: <Train size={18} /> }, { id: 'car', label: '車', icon: <Car size={18} /> }].map((t) => (
              <button key={t.id} onClick={() => setTransport(t.id)} className={`py-3 rounded-lg flex flex-col items-center gap-1 text-xs font-bold border-2 transition-all ${transport === t.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent bg-gray-50 text-gray-500'}`}>{t.icon}{t.label}</button>
            ))}
          </div>
        </div>
        <button onClick={handleSearch} disabled={loading} className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 transform active:scale-95 ${searchMode === 'travel' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? '計算中...' : (<><Search size={20} /> {searchMode === 'travel' ? '現地のコーデを検索' : 'コーディネートを検索'}</>)}</button>
      </div>
    </main>
  );
}