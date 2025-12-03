"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Smile, Frown, Meh, X, Thermometer, ArrowDown, ArrowUp } from 'lucide-react';

type Log = {
  id: string;
  date: string;
  timestamp?: number;
  itemName: string;
  itemColor?: string;
  minTemp: number;
  maxTemp: number;
  rating: 'good' | 'ok' | 'bad' | null;
  chartData?: any[]; // グラフデータ
  conditions?: any;
};

export default function HistoryPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('my_logs');
    if (saved) {
      setLogs(JSON.parse(saved));
    }
  }, []);

  const handleRate = (id: string, rating: 'good' | 'ok' | 'bad') => {
    const newLogs = logs.map(log => 
      log.id === id ? { ...log, rating } : log
    );
    setLogs(newLogs);
    localStorage.setItem('my_logs', JSON.stringify(newLogs));
    
    if (selectedLog && selectedLog.id === id) {
      setSelectedLog({ ...selectedLog, rating });
    }
  };

  // --- カレンダーロジック ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const calendarDays = [];
  for (let i = 0; i < firstDay.getDay(); i++) calendarDays.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) calendarDays.push(new Date(year, month, i));

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getLogForDate = (date: Date) => {
    return logs.find(log => {
      const logDate = new Date(log.timestamp || log.date);
      return logDate.getDate() === date.getDate() &&
             logDate.getMonth() === date.getMonth() &&
             logDate.getFullYear() === date.getFullYear();
    });
  };

  // --- グラフ描画用ヘルパー関数 ---
  const renderGraph = (chartData: any[], minTemp: number, maxTemp: number) => {
    const STEP_X = 50; 
    const GRAPH_HEIGHT = 100;
    const PADDING_Y = 20;
    const width = chartData.length * STEP_X + 40;

    const range = maxTemp - minTemp || 1;
    const getX = (i: number) => i * STEP_X + 20;
    const getY = (temp: number) => {
      const ratio = (temp - minTemp) / range;
      return (GRAPH_HEIGHT - PADDING_Y) - (ratio * (GRAPH_HEIGHT - PADDING_Y * 2));
    };

    const linePoints = chartData.map((d: any, i: number) => `${getX(i)},${getY(d.temp)}`).join(' ');
    const areaPoints = `${getX(0)},${GRAPH_HEIGHT} ${linePoints} ${getX(chartData.length - 1)},${GRAPH_HEIGHT}`;

    return (
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div style={{ width: `${width}px`, height: `${GRAPH_HEIGHT}px` }} className="relative">
          <svg width="100%" height="100%">
            <defs>
              <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#histGradient)" />
            <polyline points={linePoints} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {chartData.map((d: any, i: number) => {
              const x = getX(i);
              const y = getY(d.temp);
              const isMin = d.temp === minTemp;
              const isMax = d.temp === maxTemp;
              return (
                <g key={i}>
                  <line x1={x} y1={y} x2={x} y2={GRAPH_HEIGHT} stroke="#f1f5f9" strokeDasharray="4 4" />
                  <circle cx={x} cy={y} r={isMin || isMax ? 4 : 3} fill={isMin ? "#3b82f6" : isMax ? "#ef4444" : "white"} stroke={isMax ? "#ef4444" : "#3b82f6"} strokeWidth="2" />
                  <text x={x} y={y - 8} textAnchor="middle" className={`text-[10px] font-bold ${isMax ? 'fill-red-500' : 'fill-gray-600'}`}>{d.temp}</text>
                  <text x={x} y={GRAPH_HEIGHT - 2} textAnchor="middle" className="text-[10px] fill-gray-400">{d.hour}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 relative">
      
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">記録カレンダー</h1>
        </div>
      </div>

      {/* カレンダー操作 */}
      <div className="bg-white rounded-t-2xl p-4 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">
          {year}年 {month + 1}月
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="bg-white rounded-b-2xl shadow-sm p-4 pb-8 min-h-[400px]">
        <div className="grid grid-cols-7 mb-4 text-center">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
            <div key={day} className={`text-xs font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, i) => {
            if (!date) return <div key={i}></div>;
            const log = getLogForDate(date);
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <button
                key={i}
                onClick={() => log && setSelectedLog(log)}
                disabled={!log}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-start pt-2 relative transition-all
                  ${log ? 'bg-blue-50 border-blue-100 hover:bg-blue-100 cursor-pointer' : 'bg-transparent text-gray-300'}
                  ${isToday ? 'ring-2 ring-blue-400' : ''}
                `}
              >
                <span className={`text-xs font-bold ${log ? 'text-gray-700' : ''}`}>
                  {date.getDate()}
                </span>
                {log && (
                  <>
                    <div className="mt-1 text-xl" style={{ color: log.itemColor || '#666' }}>🧥</div>
                    {log.rating && <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-green-500"></div>}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-400 font-bold flex items-center gap-2">
                  <Calendar size={14} /> {selectedLog.date}
                </p>
                <h3 className="text-xl font-bold text-gray-800">{selectedLog.itemName}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-blue-50 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs text-blue-400 font-bold flex items-center gap-1"><ArrowDown size={12}/> 最低</span>
                <span className="text-xl font-bold text-blue-700">{selectedLog.minTemp}℃</span>
              </div>
              <div className="flex-1 bg-red-50 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs text-red-400 font-bold flex items-center gap-1"><ArrowUp size={12}/> 最高</span>
                <span className="text-xl font-bold text-red-700">{selectedLog.maxTemp}℃</span>
              </div>
            </div>

            {/* 折れ線グラフ表示エリア */}
            {selectedLog.chartData && selectedLog.chartData.length > 0 && (
              <div className="bg-white border border-gray-100 p-4 rounded-xl mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={14} className="text-gray-400"/>
                  <span className="text-xs font-bold text-gray-500">当日の気温推移</span>
                </div>
                {renderGraph(selectedLog.chartData, selectedLog.minTemp, selectedLog.maxTemp)}
              </div>
            )}

            <div className="mb-8">
              <p className="text-xs text-center text-gray-400 mb-3 font-bold">この日の着心地は？</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => handleRate(selectedLog.id, 'bad')} className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedLog.rating === 'bad' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-100 text-gray-400'}`}>
                  <Frown size={24} /> <span className="text-xs font-bold">寒い</span>
                </button>
                <button onClick={() => handleRate(selectedLog.id, 'ok')} className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedLog.rating === 'ok' ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-100 text-gray-400'}`}>
                  <Meh size={24} /> <span className="text-xs font-bold">普通</span>
                </button>
                <button onClick={() => handleRate(selectedLog.id, 'good')} className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedLog.rating === 'good' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-gray-100 text-gray-400'}`}>
                  <Smile size={24} /> <span className="text-xs font-bold">暑い</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}