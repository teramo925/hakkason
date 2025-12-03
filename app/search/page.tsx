"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Search, Clock, Car, Train, Footprints, Plane } from 'lucide-react';
import AnalogClockSlider from '../../components/AnalogClockSlider';

// ==========================================
// データ・ロジック定義
// ==========================================

// カテゴリーごとの基準気温と名前
const CATEGORY_DATA: Record<number, { temp: number; name: string }> = {
  1: { temp: 3, name: '真冬用ダウン' },
  2: { temp: 7, name: '厚手ブルゾン' },
  3: { temp: 12, name: '防風ジャケット' },
  4: { temp: 16, name: '薄手ブルゾン' },
  5: { temp: 18, name: 'ジャケット' },
  6: { temp: 7, name: '冬用コート' },
  7: { temp: 12, name: '春秋コート' },
  8: { temp: 22, name: 'カーディガン' },
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

// ① 手持ちからベストを選ぶ関数
function getBestOuter(items: Item[], minTemp: number, windSpeed: number, transport: string) {
  if (items.length === 0) return null;
  let bestItem = items[0];
  let maxScore = -9999;

  items.forEach((item) => {
    const catData = CATEGORY_DATA[item.categoryId];
    let target = catData ? catData.temp : 15;
    
    if (item.thickness === 'thick') target -= 3;
    if (item.thickness === 'thin') target += 5;

    let score = 100 - Math.abs(target - minTemp) * 5;

    if (windSpeed >= 5 && item.windproof === 'bad') score += 15;
    if (windSpeed >= 5 && item.windproof === 'good') score -= 10;

    if (transport === 'walk' && item.weight === 'light') score += 10;
    if (transport === 'walk' && item.weight === 'heavy') score -= 5;
    if (transport === 'car' && [1, 2, 4].includes(item.categoryId)) score += 5; 
    if (transport === 'car' && [6, 7].includes(item.categoryId)) score -= 5;

    if (score > maxScore) {
      maxScore = score;
      bestItem = item;
    }
  });

  return { item: bestItem, score: maxScore };
}

// ② 【追加】気温から「理想のカテゴリー」を見つける関数
function getIdealCategory(minTemp: number) {
  let bestCatId = 8; // デフォルトはカーディガン
  let minDiff = 999;

  // 全カテゴリーの中で、一番気温が近いものを探す
  Object.entries(CATEGORY_DATA).forEach(([idStr, data]) => {
    const id = parseInt(idStr);
    const diff = Math.abs(data.temp - minTemp);
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
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=1&language=ja&format=json`
        );
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
          alert('場所が見つかりませんでした。「東京」「大阪」などの都市名で試してください。');
          setLoading(false);
          return;
        }

        lat = geoData.results[0].latitude;
        lon = geoData.results[0].longitude;
        locationName = geoData.results[0].name;
      }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&current_weather=true&timezone=auto`
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

      // ▼▼▼ 修正点：手持ちがない場合でも提案を作る ▼▼▼
      const items = JSON.parse(localStorage.getItem('my_items') || '[]');
      let suggestion;

      if (items.length > 0) {
        // A. 手持ちがある場合：いつものロジック
        suggestion = getBestOuter(items, minTemp, windSpeed, transport);
      } 
      
      // B. 手持ちがない（またはマッチしなかった）場合：理想のアウターを提案
      if (!suggestion) {
        const idealId = getIdealCategory(minTemp);
        const idealName = CATEGORY_DATA[idealId].name;
        
        // 架空のアイテムデータを作成
        suggestion = {
          item: {
            id: 'dummy',
            name: `推奨: ${idealName}`, // 「推奨: ダウン」のように表示
            categoryId: idealId,
            thickness: 'normal',
            weight: 'normal',
            windproof: 'normal',
            color: '#cccccc', // グレーで表示
            isRecommendation: true // ※これは「持っていない」印として使えます
          },
          score: 100
        };
      }
      // ▲▲▲ ここまで ▲▲▲

      const resultData = {
        suggestion,
        weather: { minTemp, maxTemp, windSpeed },
        chartData,
        conditions: { startTime, endTime, transport, locationName }
      };

      sessionStorage.setItem('search_result', JSON.stringify(resultData));
      router.push('/result');

    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。通信環境を確認してください。');
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
              <input type="text" placeholder="行き先を入力 (例: 京都、札幌)" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-bold text-gray-800 placeholder-gray-400"/>
              <p className="text-xs text-gray-400 mt-2 ml-1">※県名や主要な都市名を入力してください</p>
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