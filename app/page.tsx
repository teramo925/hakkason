"use client";

import Link from 'next/link';
import { Shirt, Search, History, ArrowRight, Sun, Cloud } from 'lucide-react';

export default function Home() {
  return (
    // 全体の背景：淡いグラデーションで高級感を出す
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center relative p-6 font-sans text-gray-800">
      
      {/* 装飾用：背景に浮かぶぼやけた円（今風のアクセント） */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[250px] h-[250px] bg-indigo-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      {/* ヘッダーエリア：シンプルにタイトルのみ */}
      <header className="w-full max-w-md flex flex-col items-start mb-10 mt-6 z-10">
        <p className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">Smart Outer Concierge</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 leading-tight">
          Today's<br />Coordinate.
        </h1>
        <p className="text-gray-400 text-sm mt-3 font-medium">
          気温に合わせて、ベストな一着を。
        </p>
      </header>

      {/* メインエリア */}
      <div className="w-full max-w-md flex flex-col gap-6 z-10 pb-10">
        
        {/* ① 提案機能 (メインカード) */}
        <Link href="/search" className="group w-full">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all duration-300 transform hover:-translate-y-1">
            
            {/* 背景の装飾アイコン */}
            <Sun className="absolute top-4 right-4 text-white opacity-10" size={80} />
            <Cloud className="absolute bottom-[-10px] left-[-10px] text-white opacity-10" size={100} />

            <div className="relative z-10">
              <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-sm mb-6">
                <Search size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">何を着ていく？</h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                天気と気温を分析して<br/>
                あなたに最適なアウターを提案します。
              </p>
              
              <div className="flex items-center gap-2 text-sm font-bold bg-white text-blue-600 px-5 py-3 rounded-full w-fit group-hover:bg-blue-50 transition-colors">
                コーディネートを探す <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </Link>

        {/* サブ機能：横並びのグリッドレイアウト */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* ② 登録機能 */}
          <Link href="/closet" className="group w-full">
            <div className="h-full bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 flex flex-col justify-between">
              <div className="bg-orange-50 w-fit p-3 rounded-xl mb-4 group-hover:bg-orange-100 transition-colors">
                <Shirt size={24} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">My Closet</h3>
                <p className="text-gray-400 text-xs">アウターを登録・管理</p>
              </div>
            </div>
          </Link>

          {/* ③ 履歴機能 */}
          <Link href="/history" className="group w-full">
            <div className="h-full bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 flex flex-col justify-between">
              <div className="bg-green-50 w-fit p-3 rounded-xl mb-4 group-hover:bg-green-100 transition-colors">
                <History size={24} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">History</h3>
                <p className="text-gray-400 text-xs">これまでの着用ログ</p>
              </div>
            </div>
          </Link>

        </div>

      </div>
      
      <footer className="mt-auto py-6 text-center text-gray-300 text-xs">
        © 2025 Smart Outer Concierge
      </footer>
    </main>
  );
}