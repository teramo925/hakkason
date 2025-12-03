"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Home, Trash2, Edit, Shirt, X, Tag } from 'lucide-react';
import { IconDown, IconLong, IconShort, IconLight } from '../../components/ClothIcons';

// ▼ カテゴリー定義（名前を表示するために追加）
const CATEGORIES = [
  { id: 1, name: '真冬用ダウン' },
  { id: 2, name: '厚手ブルゾン' },
  { id: 3, name: '防風ジャケット' },
  { id: 4, name: '薄手ブルゾン' },
  { id: 5, name: 'ジャケット' },
  { id: 6, name: '冬用コート' },
  { id: 7, name: '春秋コート' },
  { id: 8, name: 'カーディガン' },
];

// ▼ 色定義（名前を表示するために追加）
const COLORS = [
  { code: '#000000', name: 'ブラック' },
  { code: '#374151', name: 'チャコール' },
  { code: '#9ca3af', name: 'グレー' },
  { code: '#e5e7eb', name: 'ライトグレー' },
  { code: '#ffffff', name: 'ホワイト' },
  { code: '#f5f5dc', name: 'ベージュ' },
  { code: '#d4b483', name: 'キャメル' },
  { code: '#451a03', name: 'ブラウン' },
  { code: '#556b2f', name: 'オリーブ' },
  { code: '#3f6212', name: 'カーキ' },
  { code: '#1e3a8a', name: 'ネイビー' },
  { code: '#2563eb', name: 'ブルー' },
  { code: '#60a5fa', name: '水色' },
  { code: '#7c3aed', name: 'パープル' },
  { code: '#dc2626', name: 'レッド' },
  { code: '#9f1239', name: 'ワイン' },
  { code: '#ec4899', name: 'ピンク' },
  { code: '#f59e0b', name: 'イエロー' },
];

// アイコン選択ロジック
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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('my_items');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // 削除処理
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // カードクリックが反応しないようにする
    if (!confirm('このアウターを削除しますか？')) return;
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    localStorage.setItem('my_items', JSON.stringify(newItems));
  };

  // スペックを日本語に変換するヘルパー
  const getSpecLabel = (type: string, value: string) => {
    if (type === 'thickness') {
      if (value === 'thick') return '厚手';
      if (value === 'thin') return '薄手';
      return null; // 普通は表示しない
    }
    if (type === 'weight') {
      if (value === 'heavy') return '重め';
      if (value === 'light') return '軽量';
      return null;
    }
    if (type === 'windproof') {
      if (value === 'bad') return '防風';
      if (value === 'good') return '通気性';
      return null;
    }
  };

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
        <div className="grid gap-3">
          {items.map((item) => {
            // カテゴリー名と色名を取得
            const catName = CATEGORIES.find(c => c.id === item.categoryId)?.name || '不明';
            const colorName = COLORS.find(c => c.code === item.color)?.name || '';

            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex items-start gap-4 w-full">
                  {/* 画像・アイコンエリア */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      renderCategoryIcon(item.categoryId, item.color || '#333')
                    )}
                  </div>
                  
                  {/* 詳細情報エリア */}
                  <div className="flex-1 min-w-0">
                    {/* カテゴリと色（小さく表示） */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mb-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{catName}</span>
                      {colorName && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background: item.color}}></span>{colorName}</span>}
                    </div>

                    {/* 名前（大きく表示） */}
                    <h2 className="font-bold text-gray-800 text-base truncate mb-2">{item.name}</h2>
                    
                    {/* スペックタグ一覧 */}
                    <div className="flex flex-wrap gap-1">
                      {getSpecLabel('thickness', item.thickness) && 
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-medium">
                          {getSpecLabel('thickness', item.thickness)}
                        </span>
                      }
                      {getSpecLabel('weight', item.weight) && 
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 font-medium">
                          {getSpecLabel('weight', item.weight)}
                        </span>
                      }
                      {getSpecLabel('windproof', item.windproof) && 
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-medium">
                          {getSpecLabel('windproof', item.windproof)}
                        </span>
                      }
                      {/* 何も特徴がない場合 */}
                      {item.thickness === 'normal' && item.weight === 'normal' && item.windproof === 'normal' && (
                        <span className="text-[10px] text-gray-300">標準スペック</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 編集ボタン（リストの端に配置） */}
                <div className="flex flex-col gap-2 ml-2">
                  <Link href={`/closet/edit?id=${item.id}`} onClick={(e) => e.stopPropagation()}>
                    <button className="text-gray-300 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors">
                      <Edit size={18} />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 新規登録ボタン */}
      <Link href="/closet/add">
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all">
          <Plus size={28} />
        </div>
      </Link>

      {/* 詳細表示モーダル（これまで通り） */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setSelectedItem(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <X size={20} />
            </button>
            <div className="flex justify-center mb-6">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-gray-100 bg-gray-50 flex items-center justify-center shadow-inner">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                ) : (
                  renderLargeIcon(selectedItem.categoryId, selectedItem.color || '#333')
                )}
              </div>
            </div>
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {CATEGORIES.find(c => c.id === selectedItem.categoryId)?.name}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">{selectedItem.name}</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] text-gray-400 mb-1">分厚さ</span>
                <span className="font-bold text-sm">
                  {selectedItem.thickness === 'thick' ? '厚手' : selectedItem.thickness === 'thin' ? '薄手' : '普通'}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] text-gray-400 mb-1">重さ</span>
                <span className="font-bold text-sm">
                  {selectedItem.weight === 'heavy' ? '重め' : selectedItem.weight === 'light' ? '軽量' : '普通'}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] text-gray-400 mb-1">機能</span>
                <span className="font-bold text-sm">
                  {selectedItem.windproof === 'bad' ? '防風' : selectedItem.windproof === 'good' ? '通気性' : 'なし'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/closet/edit?id=${selectedItem.id}`} className="flex-1">
                <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                  <Edit size={18} /> 編集
                </button>
              </Link>
              <button 
                onClick={(e) => { handleDelete(e, selectedItem.id); setSelectedItem(null); }}
                className="p-3 border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}