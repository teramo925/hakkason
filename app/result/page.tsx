"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// ▼ Shirtアイコンを追加
import { ArrowLeft, Check, Search, AlertTriangle, Thermometer, ArrowUp, ArrowDown, Snowflake, Shield, Zap, Mountain, Briefcase, Landmark, Umbrella, Feather, Shirt, Lightbulb } from 'lucide-react';

const getCategoryIcon = (id: number) => {
  switch (id) {
    case 1: return <Snowflake size={40} />;
    case 2: return <Shield size={40} />;
    case 3: return <Zap size={40} />;
    case 4: return <Mountain size={40} />;
    case 5: return <Briefcase size={40} />;
    case 6: return <Landmark size={40} />;
    case 7: return <Umbrella size={40} />;
    case 8: return <Feather size={40} />;
    default: return <Shirt size={40} />;
  }
};

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const savedResult = sessionStorage.getItem('search_result');
    if (savedResult) {
      setData(JSON.parse(savedResult));
    } else {
      router.push('/search');
    }
  }, [router]);

  if (!data) return <div className="p-10 text-center">読み込み中...</div>;

  const { suggestion, weather, chartData, conditions } = data;

  const handleDecide = () => {
    const newLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
      itemName: suggestion.item.name,
      itemColor: suggestion.item.color,
      minTemp: weather.minTemp,
      maxTemp: weather.maxTemp,
      chartData: chartData,
      conditions: conditions,
      rating: null
    };
    const savedLogs = JSON.parse(localStorage.getItem('my_logs') || '[]');
    savedLogs.unshift(newLog);
    localStorage.setItem('my_logs', JSON.stringify(savedLogs));
    router.push('/history');
  };

  const STEP_X = 60; 
  const GRAPH_HEIGHT = 150;
  const PADDING_Y = 30;
  const temps = chartData.map((d: any) => d.temp);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;
  const getX = (i: number) => i * STEP_X + 30;
  const getY = (temp: number) => (GRAPH_HEIGHT - PADDING_Y) - (((temp - minT) / range) * (GRAPH_HEIGHT - PADDING_Y * 2));
  const linePoints = chartData.map((d: any, i: number) => `${getX(i)},${getY(d.temp)}`).join(' ');
  const areaPoints = `${getX(0)},${GRAPH_HEIGHT} ${linePoints} ${getX(chartData.length - 1)},${GRAPH_HEIGHT}`;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/search" className="p-2 bg-white rounded-full shadow-sm text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">提案結果</h1>
      </div>

      <div className="max-w-md mx-auto space-y-6 pb-20">

        {/* ① メイン提案カード */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-3xl shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Search size={100} />
          </div>
          <p className="text-gray-400 text-sm font-bold mb-4">BEST CHOICE</p>
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 bg-white flex items-center justify-center shadow-lg">
              {suggestion.item.image ? (
                <img src={suggestion.item.image} alt={suggestion.item.name} className="w-full h-full object-cover" />
              ) : (
                <div style={{ color: suggestion.item.color || '#333' }}>
                  {getCategoryIcon(suggestion.item.categoryId)}
                </div>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">{suggestion.item.name}</h2>

          <div className="flex justify-center items-center gap-8 mb-6 border-t border-b border-white/10 py-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-300 text-xs font-bold mb-1"><ArrowDown size={12} /> 最低</div>
              <p className="text-3xl font-bold">{weather.minTemp}<span className="text-base ml-1">℃</span></p>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-red-300 text-xs font-bold mb-1"><ArrowUp size={12} /> 最高</div>
              <p className="text-3xl font-bold">{weather.maxTemp}<span className="text-base ml-1">℃</span></p>
            </div>
          </div>
          
          {/* ▼▼▼ インナー提案＆アドバイス表示 ▼▼▼ */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-left space-y-3">
             {/* インナー */}
             <div className="flex items-start gap-3">
               <Shirt size={20} className="text-blue-300 mt-0.5 shrink-0" />
               <div>
                 <span className="text-xs text-gray-400 block font-bold">おすすめインナー</span>
                 <p className="text-sm font-bold">{suggestion.inner || '気温に合わせて調整を'}</p>
               </div>
             </div>
             
             {/* アドバイス */}
             <div className="flex items-start gap-3 pt-2 border-t border-white/10">
               <Lightbulb size={20} className="text-yellow-300 mt-0.5 shrink-0" />
               <div>
                 <span className="text-xs text-gray-400 block font-bold">アドバイス</span>
                 <p className="text-sm leading-relaxed">{suggestion.advice || '快適な一日を！'}</p>
               </div>
             </div>
          </div>
          {/* ▲▲▲ ここまで ▲▲▲ */}

        </section>

        {/* ② グラフエリア (変更なし) */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500">気温の推移 ({conditions.startTime} - {conditions.endTime})</h3>
            <Thermometer size={16} className="text-gray-400" />
          </div>
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div style={{ width: `${chartData.length * STEP_X + 60}px`, height: `${GRAPH_HEIGHT}px` }} className="relative">
              <svg width="100%" height="100%">
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={areaPoints} fill="url(#tempGradient)" />
                <polyline points={linePoints} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {chartData.map((d: any, i: number) => {
                  const x = getX(i);
                  const y = getY(d.temp);
                  const isMin = d.temp === weather.minTemp;
                  const isMax = d.temp === weather.maxTemp;
                  return (
                    <g key={i}>
                      <line x1={x} y1={y} x2={x} y2={GRAPH_HEIGHT} stroke="#f1f5f9" strokeDasharray="4 4" />
                      <circle cx={x} cy={y} r={isMin || isMax ? 6 : 4} fill={isMin ? "#3b82f6" : isMax ? "#ef4444" : "white"} stroke={isMax ? "#ef4444" : "#3b82f6"} strokeWidth="2" />
                      <text x={x} y={y - 12} textAnchor="middle" className={`text-xs font-bold ${isMax ? 'fill-red-500' : 'fill-gray-600'}`} fontWeight="bold">{d.temp}℃</text>
                      <text x={x} y={GRAPH_HEIGHT - 5} textAnchor="middle" className="text-xs fill-gray-400">{d.hour}時</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </section>

        {/* ③ 決定ボタン */}
        <button onClick={handleDecide} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2">
          <Check size={24} /> この服で決定！
        </button>

      </div>
    </main>
  );
}
