"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Search, Clock, Car, Train, Footprints } from 'lucide-react';
import AnalogClockSlider from '../../components/AnalogClockSlider';

// ==========================================
// ロジック（計算式）
// ==========================================

const TARGET_TEMPS: Record<number, number> = {
  1: 3, 2: 7, 3: 12, 4: 16, 5: 18, 6: 7, 7: 12, 8: 22,
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

function getBestOuter(items: Item[], minTemp: number, windSpeed: number, transport: string) {
  if (items.length === 0) return null;
  let bestItem = items[0];
  let maxScore = -9999;

  items.forEach((item) => {
    let target = TARGET_TEMPS[item.categoryId] || 15;
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

// ==========================================
// 検索画面コンポーネント
// ==========================================

export default function SearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [transport, setTransport] = useState('train');

  const handleSearch = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current_weather=true&timezone=auto`
        );
        const data = await res.json();

        // 時間帯の抽出ロジック
        const startHour = parseInt(startTime.split(':')[0]); 
        const endHour = parseInt(endTime.split(':')[0]);
        const safeEndHour = endHour >= startHour ? endHour : 23;

        // 指定時間帯の気温配列を作成（グラフ用）
        const hourlyTemps = data.hourly.temperature_2m.slice(0, 24);
        const targetTemps = hourlyTemps.slice(startHour, safeEndHour + 1);
        
        // グラフ描画用に「時間」と「気温」のペアデータを作る
        const chartData = targetTemps.map((temp: number, index: number) => ({
          hour: startHour + index,
          temp: temp
        }));

        const minTemp = Math.min(...targetTemps);
        const maxTemp = Math.max(...targetTemps);
        const windSpeed = data.current_weather.windspeed;

        // ベストアイテム算出
        const items = JSON.parse(localStorage.getItem('my_items') || '[]');
        const suggestion = getBestOuter(items, minTemp, windSpeed, transport);
        
        // ▼▼ 変更点：結果を保存してページ移動 ▼▼
        const resultData = {
          suggestion,
          weather: { minTemp, maxTemp, windSpeed },
          chartData, // グラフ用データ
          conditions: { startTime, endTime, transport }
        };

        // 一時保存 (Session Storage)
        sessionStorage.setItem('search_result', JSON.stringify(resultData));
        
        // 結果ページへ移動
        router.push('/result');

      } catch (error) {
        console.error(error);
        alert('エラーが発生しました');
        setLoading(false);
      }
    }, () => {
      alert('位置情報が必要です');
      setLoading(false);
    });
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
          
        {/* 場所 */}
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 flex items-center gap-2">
            <MapPin size={16} /> 場所
          </label>
          <div className="flex gap-2">
            <button className="flex-1 py-3 bg-blue-50 text-blue-700 font-bold rounded-lg border-2 border-blue-200 flex items-center justify-center gap-2">
              現在地
            </button>
            <button className="flex-1 py-3 bg-gray-50 text-gray-400 font-bold rounded-lg" disabled>
              旅行 (未)
            </button>
          </div>
        </div>

        {/* 時間 */}
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-4 flex items-center justify-center gap-2">
            <Clock size={18} /> 外出時間を設定
          </label>
          <AnalogClockSlider 
            startTime={startTime} 
            endTime={endTime}
            onChange={(newStart, newEnd) => {
              setStartTime(newStart);
              setEndTime(newEnd);
            }}
          />
        </div>

        {/* 移動手段 */}
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">移動手段</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'walk', label: '徒歩', icon: <Footprints size={18} /> },
              { id: 'train', label: '電車', icon: <Train size={18} /> },
              { id: 'car', label: '車', icon: <Car size={18} /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTransport(t.id)}
                className={`py-3 rounded-lg flex flex-col items-center gap-1 text-xs font-bold border-2 transition-all
                  ${transport === t.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-transparent bg-gray-50 text-gray-500'}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          {loading ? '計算中...' : (
            <>
              <Search size={20} /> コーディネートを検索
            </>
          )}
        </button>
      </div>
    </main>
  );
}