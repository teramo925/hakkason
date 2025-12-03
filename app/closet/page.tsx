"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
// ▼ Edit（編集アイコン）を追加
import { Plus, Home, Trash2, Shirt, Edit } from 'lucide-react';

const CATEGORY_ICONS: Record<number, string> = {
  1: '☃️', 2: '🪖', 3: '🏍️', 4: '⛰️',
  5: '👔', 6: '🕴️', 7: '🧥', 8: '🧶',
};

type Item = {
  id: string;
  categoryId: number;
  name: string;
  thickness: string;
  weight: string;
  windproof: string;
  color?: string; // 色情報
};

export default function ClosetPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('my_items');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('このアウターを削除しますか？')) return;
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    localStorage.setItem('my_items', JSON.stringify(newItems));
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-gray-600">
            <Home size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">My Closet</h1>
        </div>
        <span className="text-sm text-gray-500 font-bold">{items.length} 着</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="bg-gray-100 p-6 rounded-full">
            <Shirt size={40} />
          </div>
          <p>まだアウターがありません</p>
          <p className="text-sm">右下のボタンから登録しよう！</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* アイコン（登録した色を反映） */}
                <div 
                  className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl border border-gray-100"
                  style={{ color: item.color || '#333' }}
                >
                  {CATEGORY_ICONS[item.categoryId] || '🧥'}
                </div>
                
                {/* 詳細情報 */}
                <div>
                  <h2 className="font-bold text-gray-800">{item.name}</h2>
                  <div className="flex gap-2 mt-1">
                    {item.thickness === 'thick' && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded border border-red-100">厚手</span>}
                    {item.thickness === 'thin' && <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded border border-blue-100">薄手</span>}
                    {item.windproof === 'bad' && <span className="text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded">防風</span>}
                  </div>
                </div>
              </div>

              {/* 操作ボタンエリア */}
              <div className="flex items-center gap-1">
                {/* ▼▼▼ 追加した編集ボタン ▼▼▼ */}
                <Link href={`/closet/edit?id=${item.id}`}>
                  <button className="text-gray-300 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors">
                    <Edit size={18} />
                  </button>
                </Link>
                {/* ▲▲▲ ここまで ▲▲▲ */}
                
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新規登録ボタン */}
      <Link href="/closet/add">
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all">
          <Plus size={28} />
        </div>
      </Link>

    </main>
  );
}