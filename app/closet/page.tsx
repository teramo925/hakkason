"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Home, Edit, Shirt, X, Weight, Wind, Layers } from 'lucide-react';
// 自作アイコン読み込み
import { IconDown, IconLong, IconShort, IconLight } from '../../components/ClothIcons';

const renderCategoryIcon = (id: number, color: string) => {
  const props = { size: 28, color: color, stroke: "white" };
  switch (id) {
    case 1: return <IconDown {...props} />;
    case 2: case 3: case 4: case 5: return <IconShort {...props} />;
    case 6: case 7: return <IconLong {...props} />;
    case 8: return <IconLight {...props} />;
    default: return <Shirt size={28} color={color} />;
  }
};

// 詳細表示用にサイズ大バージョン
const renderLargeIcon = (id: number, color: string) => {
  const props = { size: 80, color: color, stroke: "white" };
  switch (id) {
    case 1: return <IconDown {...props} />;
    case 2: case 3: case 4: case 5: return <IconShort {...props} />;
    case 6: case 7: return <IconLong {...props} />;
    case 8: return <IconLight {...props} />;
    default: return <Shirt size={80} color={color} />;
  }
};

type Item = {
  id: string;
  categoryId: number;
  name: string;
  thickness: string;
  weight: string;
  windproof: string;
  color?: string;
  image?: string;
};

export default function ClosetPage() {
  const [items, setItems] = useState<Item[]>([]);
  // ▼ 詳細表示用のステート
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('my_items');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24 relative">
      
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
            <div 
              key={item.id} 
              // ▼ カード全体をクリック可能に
              onClick={() => setSelectedItem(item)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-95 transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-50 shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    renderCategoryIcon(item.categoryId, item.color || '#333')
                  )}
                </div>
                
                <div>
                  <h2 className="font-bold text-gray-800">{item.name}</h2>
                  <div className="flex gap-2 mt-1">
                    {/* 簡易タグ表示 */}
                    {item.thickness === 'thick' && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded border border-red-100">厚手</span>}
                    {item.thickness === 'thin' && <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded border border-blue-100">薄手</span>}
                  </div>
                </div>
              </div>

              {/* 編集ボタンだけは独立して押せるように（e.stopPropagation） */}
              <div className="flex items-center gap-1">
                <Link href={`/closet/edit?id=${item.id}`} onClick={(e) => e.stopPropagation()}>
                  <button className="text-gray-300 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors">
                    <Edit size={18} />
                  </button>
                </Link>
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

      {/* ▼▼▼ 詳細表示モーダル ▼▼▼ */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setSelectedItem(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in relative" onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <X size={20} />
            </button>

            {/* アイコン・画像表示 */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50 flex items-center justify-center shadow-inner">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                ) : (
                  renderLargeIcon(selectedItem.categoryId, selectedItem.color || '#333')
                )}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{selectedItem.name}</h2>

            {/* スペックグリッド */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center gap-1">
                <Layers size={20} className="text-gray-400" />
                <span className="text-[10px] text-gray-400">分厚さ</span>
                <span className="font-bold text-sm">
                  {selectedItem.thickness === 'thick' ? '厚め' : selectedItem.thickness === 'thin' ? '薄め' : '普通'}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center gap-1">
                <Weight size={20} className="text-gray-400" />
                <span className="text-[10px] text-gray-400">重さ</span>
                <span className="font-bold text-sm">
                  {selectedItem.weight === 'heavy' ? '重い' : selectedItem.weight === 'light' ? '軽い' : '普通'}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center gap-1">
                <Wind size={20} className="text-gray-400" />
                <span className="text-[10px] text-gray-400">風通し</span>
                <span className="font-bold text-sm">
                  {selectedItem.windproof === 'bad' ? '防風' : selectedItem.windproof === 'good' ? '良い' : '普通'}
                </span>
              </div>
            </div>

            <Link href={`/closet/edit?id=${selectedItem.id}`} className="block w-full">
              <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <Edit size={18} /> 情報を編集する
              </button>
            </Link>

          </div>
        </div>
      )}

    </main>
  );
}