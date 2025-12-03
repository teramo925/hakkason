"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Smile, Frown, Meh, X, Thermometer, ArrowDown, ArrowUp } from 'lucide-react';

type Log = {
  id: string;
  date: string; // "YYYY/MM/DD" or locale string
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
  const [currentDate, setCurrentDate] = useState(new Date()); // 表示中の年月
  const [selectedLog, setSelectedLog] = useState<Log | null>(null); // 詳細表示中のログ

  // データ読み込み
  useEffect(() => {
    const saved = localStorage.getItem('my_logs');
    if (saved) {
      setLogs(JSON.parse(saved));
    }
  }, []);

  // 評価更新処理
  const handleRate = (id: string, rating: 'good' | 'ok' | 'bad') => {
    const newLogs = logs.map(log => 
      log.id === id ? { ...log, rating } : log
    );
    setLogs(newLogs);
    localStorage.setItem('my_logs', JSON.stringify(newLogs));
    
    // 選択中のログも更新して表示を反映
    if (selectedLog && selectedLog.id === id) {
      setSelectedLog({ ...selectedLog, rating });
    }
  };

  // --- カレンダー生成ロジック ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  
  // 月の初日と末日
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // カレンダーの日付配列を作る
  const calendarDays = [];
  // 月初の空白埋め
  for (let i = 0; i < firstDay.getDay(); i++) {
    calendarDays.push(null);
  }
  // 日付埋め
  for (let i = 1; i <= lastDay.getDate(); i++) {
    calendarDays.push(new Date(year, month, i));
  }

  // 前月・次月移動
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 指定した日付のログを探す
  const getLogForDate = (date: Date) => {
    return logs.find(log => {
      // 日付文字列の形式が環境によって違う可能性があるため、簡易的に比較
      const logDate = new Date(log.timestamp || log.date);
      return logDate.getDate() === date.getDate() &&
             logDate.getMonth() === date.getMonth() &&
             logDate.getFullYear() === date.getFullYear();
    });
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

      {/* カレンダー操作バー */}
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

      {/* カレンダー本体 */}
      <div className="bg-white rounded-b-2xl shadow-sm p-4 pb-8 min-h-[400px]">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-4 text-center">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
            <div key={day} className={`text-xs font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
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
                
                {/* ログがある場合の表示 */}
                {log && (
                  <>
                    <div 
                      className="mt-1 text-xl"
                      style={{ color: log.itemColor || '#666' }}
                    >
                      🧥
                    </div>
                    {/* 評価済みバッジ */}
                    {log.rating && (
                      <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 詳細モーダル（ログ選択時に表示） */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            
            {/* モーダルヘッダー */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-400 font-bold flex items-center gap-2">
                  <Calendar size={14} /> {selectedLog.date}
                </p>
                <h3 className="text-xl font-bold text-gray-800">{selectedLog.itemName}</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* 気温情報 */}
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

            {/* 評価エリア */}
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

            {/* グラフ（データがある場合のみ簡易表示） */}
            {selectedLog.chartData && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={14} className="text-gray-400"/>
                  <span className="text-xs font-bold text-gray-500">当日の気温推移</span>
                </div>
                {/* 簡易的なグラフ表示（ResultPageのロジック簡易版） */}
                <div className="h-24 w-full flex items-end gap-1">
                  {selectedLog.chartData.map((d: any, i: number) => {
                    // 高さ計算
                    const min = selectedLog.minTemp;
                    const max = selectedLog.maxTemp;
                    const h = ((d.temp - min) / (max - min || 1)) * 60 + 20; // 20px~80px
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative">
                        {/* ツールチップ的な表示 */}
                        <div className="absolute -top-6 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] px-1 rounded transition-opacity pointer-events-none">
                          {d.temp}℃
                        </div>
                        <div 
                          className={`w-full rounded-t ${d.temp === min ? 'bg-blue-400' : d.temp === max ? 'bg-red-400' : 'bg-gray-300'}`}
                          style={{ height: `${h}%` }}
                        ></div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{selectedLog.conditions?.startTime}</span>
                  <span>{selectedLog.conditions?.endTime}</span>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

    </main>
  );
}