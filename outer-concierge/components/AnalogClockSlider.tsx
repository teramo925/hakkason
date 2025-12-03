"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

type Props = {
  startTime: string; // "HH:00" 形式
  endTime: string;   // "HH:00" 形式
  onChange: (start: string, end: string) => void;
};

// 時間("HH:00")を角度(0-360)に変換
const timeToAngle = (time: string) => {
  const hour = parseInt(time.split(':')[0], 10);
  return (hour / 24) * 360;
};

// 角度を時間文字("HH:00")に変換
const angleToTime = (angle: number) => {
  // 負の角度を正に
  let normalizedAngle = angle < 0 ? angle + 360 : angle;
  // 0時位置(上が起点)になるように調整
  normalizedAngle = (normalizedAngle + 90) % 360;
  
  let hour = Math.round((normalizedAngle / 360) * 24);
  if (hour === 24) hour = 0;
  return `${hour.toString().padStart(2, '0')}:00`;
};

// 円周上の座標を計算
const getPoint = (angle: number, radius: number, cx: number, cy: number) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
};

export default function AnalogClockSlider({ startTime, endTime, onChange }: Props) {
  const [startAngle, setStartAngle] = useState(timeToAngle(startTime));
  const [endAngle, setEndAngle] = useState(timeToAngle(endTime));
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40; // ハンドルの軌道半径

  // 外部からのprops変更をstateに反映
  useEffect(() => { setStartAngle(timeToAngle(startTime)); }, [startTime]);
  useEffect(() => { setEndAngle(timeToAngle(endTime)); }, [endTime]);

  // マウス位置から角度を計算する関数
  const calculateAngle = useCallback((e: MouseEvent | TouchEvent) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    return angle;
  }, [cx, cy]);

  // ドラッグ処理
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const angle = calculateAngle(e);
    const timeStr = angleToTime(angle);

    if (isDragging === 'start') {
      onChange(timeStr, endTime);
    } else {
      onChange(startTime, timeStr);
    }
  }, [isDragging, calculateAngle, onChange, startTime, endTime]);

  const handleUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleMove, handleUp]);

  // 扇形（塗りつぶし部分）のパスを生成
  const getArcPath = () => {
    const start = getPoint(startAngle, radius, cx, cy);
    const end = getPoint(endAngle, radius, cx, cy);
    // 終了角度が開始角度より小さい場合（日をまたぐ場合）に対応
    let diff = endAngle - startAngle;
    if (diff < 0) diff += 360;
    const largeArcFlag = diff > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  };

  const startPoint = getPoint(startAngle, radius, cx, cy);
  const endPoint = getPoint(endAngle, radius, cx, cy);

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* デジタル表示 */}
      <div className="text-2xl font-bold text-gray-800 mb-4 font-mono bg-white px-6 py-2 rounded-full shadow-sm border">
        {startTime} <span className="text-gray-400 mx-2">〜</span> {endTime}
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg ref={svgRef} width={size} height={size} className="drop-shadow-xl rounded-full bg-white">
          {/* 文字盤の背景 */}
          <circle cx={cx} cy={cy} r={size / 2 - 5} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
          
          {/* 時間の数字と目盛り */}
          {[0, 6, 12, 18].map((hour) => {
            const angle = (hour / 24) * 360;
            const pText = getPoint(angle, radius + 25, cx, cy);
            const pTick1 = getPoint(angle, size / 2 - 10, cx, cy);
            const pTick2 = getPoint(angle, size / 2 - 20, cx, cy);
            return (
              <React.Fragment key={hour}>
                <line x1={pTick1.x} y1={pTick1.y} x2={pTick2.x} y2={pTick2.y} stroke="#cbd5e1" strokeWidth="2" />
                <text x={pText.x} y={pText.y} textAnchor="middle" dominantBaseline="middle" className="text-sm font-bold fill-gray-400">
                  {hour}
                </text>
              </React.Fragment>
            );
          })}

          {/* 扇形（選択範囲） */}
          <path d={getArcPath()} fill="rgba(59, 130, 246, 0.2)" stroke="none" />
          
          {/* 開始ハンドル（緑） */}
          <g transform={`translate(${startPoint.x}, ${startPoint.y})`} style={{ cursor: 'grab' }}
             onMouseDown={() => setIsDragging('start')} onTouchStart={() => setIsDragging('start')}>
            <circle r="14" fill="#22c55e" className="shadow-lg" />
            <circle r="12" fill="white" />
            <circle r="6" fill="#22c55e" />
          </g>

          {/* 終了ハンドル（赤） */}
          <g transform={`translate(${endPoint.x}, ${endPoint.y})`} style={{ cursor: 'grab' }}
             onMouseDown={() => setIsDragging('end')} onTouchStart={() => setIsDragging('end')}>
            <circle r="14" fill="#ef4444" className="shadow-lg" />
            <circle r="12" fill="white" />
            <circle r="6" fill="#ef4444" />
          </g>

          {/* 中心点 */}
          <circle cx={cx} cy={cy} r="4" fill="#64748b" />
        </svg>

        {/* 操作ガイド */}
        <div className="absolute bottom-[-30px] left-0 w-full text-center text-[10px] text-gray-400">
          <span className="text-green-600">● 開始</span> と <span className="text-red-500">● 終了</span> をドラッグして設定
        </div>
      </div>
    </div>
  );
}