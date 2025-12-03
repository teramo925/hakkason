"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Search, Clock, Car, Train, Footprints, Plane, User } from 'lucide-react';
import AnalogClockSlider from '../../components/AnalogClockSlider';

// ==========================================
// データ・ロジック定義
// ==========================================

// ▼▼▼ 修正：根拠に基づいたリアルな適温範囲（都市部仕様） ▼▼▼
const CATEGORY_DATA: Record<number, { min: number; max: number; name: string; rainStrong: boolean }> = {
  // 1. 真冬用ダウン: 【5℃以下】
  // 根拠: 5℃を下回ると本格的な防寒が必要。逆に6℃以上で電車に乗ると蒸れる。
  1: { min: -30, max: 5,  name: '真冬用ダウン', rainStrong: false },
  
  // 2. 厚手ブルゾン: 【5℃〜10℃】
  // 根拠: MA-1やボアなど。風を通さないので10℃以下で活躍。12℃超えると暑い。
  2: { min: 3,   max: 11, name: '厚手ブルゾン', rainStrong: true },
  
  // 6. 冬用コート: 【5℃〜11℃】
  // 根拠: ウールコートなど。前が開くのでダウンより調整しやすいが、12℃超えると重く感じる。
  6: { min: 4,   max: 12, name: '冬用コート', rainStrong: false },
  
  // 3. 防風ジャケット: 【10℃〜15℃】
  // 根拠: レザーや厚手マンパ。北風が冷たい春・秋（10-15℃）に最適。
  3: { min: 8,   max: 16, name: '防風ジャケット', rainStrong: true },
  
  // 7. 春秋コート: 【12℃〜17℃】
  // 根拠: トレンチなど。10℃以下だとインナーで工夫しないと寒い。18℃超えると邪魔。
  7: { min: 11,  max: 18, name: '春秋コート', rainStrong: true },
  
  // 4. 薄手ブルゾン: 【15℃〜20℃】
  // 根拠: ナイロンJKTなど。日中20℃近くまで上がる日の朝晩用。
  4: { min: 14,  max: 21, name: '薄手ブルゾン', rainStrong: true },
  
  // 5. ジャケット: 【16℃〜22℃】
  // 根拠: テーラードなど。15℃以下だと寒い。23℃超えるとシャツ1枚でいい。
  5: { min: 16,  max: 23, name: 'ジャケット', rainStrong: false },
  
  // 8. カーディガン: 【18℃〜25℃】
  // 根拠: 20℃前後の「シャツだと肌寒い」時や、夏の冷房対策。
  8: { min: 18,  max: 26, name: 'カーディガン', rainStrong: false },
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

    const itemWarmth = item.warmth || 3; 
    const diffLv = itemWarmth - 3; 
    const minShift = diffLv * 3.0;
    const maxShift = diffLv * 1.5;

    rangeMin -= minShift;
    rangeMax -= maxShift;

    if (!item.warmth) {
        if (item.thickness === 'thick') { rangeMin -= 3; rangeMax -= 1; }
        if (item.thickness === 'thin')  { rangeMin += 3; rangeMax += 2; }
    }

    let totalPenalty = 0;

    hourlyTemps.forEach(temp => {
      let effectiveTemp = temp;
      effectiveTemp -= Math.max(0, windSpeed - 1);
      
      if (temp <= 12 && humidity >= 60) {
        effectiveTemp -= (humidity - 60) / 10 * 0.4;
      }
      
      if (transport === 'walk') effectiveTemp += 3.5;
      if (isSunny) effectiveTemp += 2.0;
      
      if (userType === 'cold_sensitive') effectiveTemp -= 3;
      if (userType === 'heat_sensitive') effectiveTemp += 3;
      if (isAutumnWinter) effectiveTemp -= 1;

      if (effectiveTemp < rangeMin) {
        const diff = rangeMin - effectiveTemp;
        totalPenalty += (diff * diff) * 2.5; 
      } else if (effectiveTemp > rangeMax) {
        const diff = effectiveTemp - rangeMax;
        let heatFactor = 1.2;
        if (transport === 'train' || transport === 'walk') heatFactor = 2.5; 
        totalPenalty += diff * heatFactor;
      }
    });

    if (windSpeed >= 5) {
      if (item.windproof === 'bad') totalPenalty -= 20;
      if (item.windproof === 'good') totalPenalty += 40;
      if (item.hasHood) totalPenalty -= 15;
    }

    if (transport === 'walk') {
      if (item.weight === 'heavy') totalPenalty += 50;
      if (item.weight === 'light') totalPenalty -= 25;
    }
    if (transport === 'car') {
      if ([1, 6, 7].includes(item.categoryId)) totalPenalty += 20;
    }

    if (isBadWeather) {
      if (!item.hasHood) totalPenalty += 50;
      if (!cat.rainStrong) totalPenalty += 90;
    }

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

  const minRawTemp = Math.min(...hourlyTemps);
  let minEffective = minRawTemp - Math.max(0, windSpeed - 1);
  if (isSunny) minEffective += 2;
  if (userType === 'cold_sensitive') minEffective -= 3;
  if (userType === 'heat_sensitive') minEffective += 3;

  let outerBonus = 0;
  if (bestItem.categoryId === 1) outerBonus += 10;
  if (bestItem.categoryId === 2) outerBonus += 6;
  if (bestItem.categoryId === 6) outerBonus += 6;
  if (bestItem.warmth) outerBonus += (bestItem.warmth - 3) * 2;

  const innerJudgeTemp = minEffective + outerBonus;

  let innerSuggestion = "Tシャツ / カットソー";
  if (innerJudgeTemp < 3) innerSuggestion = "ヒートテック + 厚手ニット";
  else if (innerJudgeTemp < 8) innerSuggestion = "ニット / スウェット";
  else if (innerJudgeTemp < 15) innerSuggestion = "シャツ / 薄手ニット";
  else if (innerJudgeTemp < 22) innerSuggestion = "ロンT / シャツ";
  else innerSuggestion = "Tシャツ / 肌着";

  let adviceText = "一日中快適に過ごせそうです。";
  const advices = [];
  
  if (outerBonus >= 6 && Math.max(...hourlyTemps) > 13) advices.push("アウターが暖かいので、インナーは薄めでOK。");
  else if (minEffective < 5 && outerBonus < 3) advices.push("アウターだけでは寒いので、重ね着で防寒を。");

  if (isBadWeather && !bestItem.hasHood) advices.push("雨予報です。傘を忘れずに。");
  else if (isBadWeather && bestItem.hasHood) advices.push("フード付きなので多少の雨なら安心。");
  
  if (windSpeed >= 5) advices.push("風が強いので体感は寒いです。");
  if (Math.max(...hourlyTemps) - Math.min(...hourlyTemps) > 10) advices.push("寒暖差が激しいので脱ぎ着で調整を。");
  
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
      
      if (!suggestion || suggestion.score < 75) {
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