import Link from 'next/link';
import { Shirt, Search, History, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center relative p-6">
      
      {/* ヘッダーエリア：ロゴとログイン */}
      <header className="w-full flex justify-between items-center mb-12 mt-4 max-w-md">
        <h1 className="text-xl font-bold text-gray-800 leading-tight">
          Outer<br/>Concierge
        </h1>
        <button className="flex flex-col items-center text-gray-400 hover:text-gray-600 text-xs gap-1">
          <LogIn size={20} />
          <span>Login</span>
        </button>
      </header>

      {/* メインエリア：3つのボタン */}
      <div className="w-full max-w-md flex flex-col gap-6 flex-1 justify-center pb-20">
        
        {/* ① 提案機能 (一番目立たせる) */}
        <Link href="/search" className="group w-full">
          <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-8 shadow-lg transition-all transform hover:scale-[1.02] flex flex-col items-center gap-4 text-center cursor-pointer w-full">
            <Search size={48} className="mb-2" />
            <div>
              <h2 className="text-2xl font-bold">何を着ていく？</h2>
              <p className="text-blue-100 text-sm mt-1">気温に合わせてベストな一着を提案</p>
            </div>
          </div>
        </Link>

        {/* ② 登録機能 */}
        <Link href="/closet" className="w-full">
          <div className="bg-white hover:bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl p-6 shadow-sm transition-all flex items-center gap-4 cursor-pointer w-full">
            <div className="bg-gray-100 p-3 rounded-full">
              <Shirt size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold">アウター登録</h3>
              <p className="text-gray-400 text-xs">手持ちのアイテムを管理</p>
            </div>
          </div>
        </Link>

        {/* ③ 履歴機能 */}
        <Link href="/history" className="w-full">
          <div className="bg-white hover:bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl p-6 shadow-sm transition-all flex items-center gap-4 cursor-pointer w-full">
            <div className="bg-gray-100 p-3 rounded-full">
              <History size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold">これまでの記録</h3>
              <p className="text-gray-400 text-xs">着用ログと評価を確認</p>
            </div>
          </div>
        </Link>

      </div>
    </main>
  );
}