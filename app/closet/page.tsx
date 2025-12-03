"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Home, Trash2, Edit, Shirt, X, Flame, Umbrella, Weight, Wind, Layers } from 'lucide-react';
// ▼ 自作アイコン読み込み（パスが正しいか確認！）
import { IconDown, IconLong, IconShort, IconLight } from '../../components/ClothIcons';

// ==========================================
// データ・ヘルパー定義 (Edit/Addと同期させる)
// ==========================================

const CATEGORIES = [
  { id: 1, name: '真冬用ダウン' }, { id: 2, name: '厚手ブルゾン' }, { id: 3, name: '防風ジャケット' },
  { id: 4, name: '薄手ブルゾン' }, { id: 5, name: 'ジャケット' }, { id: 6, name: '冬用コート' },
  { id: 7, name: '春秋コート' }, { id: 8, name: 'カーディガン' },
];

const COLORS = [
  { code: '#000000', name: 'ブラック' }, { code: '#374151', name: 'チャコール' }, { code: '#9ca3af', name: 'グレー' },
  { code: '#e5e7eb', name: 'ライトグレー' }, { code: '#ffffff', name: 'ホワイト' }, { code: '#f5f5dc', name: 'ベージュ' },
  { code: '#d4b483', name: 'キャメル' }, { code: '#451a03', name: 'ブラウン' }, { code: '#556b2f', name: 'オリーブ' },
  { code: '#3f6212', name: 'カーキ' }, { code: '#1e3a8a', name: 'ネイビー' }, { code: '#2563eb', name: 'ブルー' },
  { code: '#60a5fa', name: '水色' }, { code: '#7c3aed', name: 'パープル' }, { code: '#dc2626', name: 'レッド' },
  { code: '#9f1239', name: 'ワイン' }, { code: '#ec4899', name: 'ピンク' }, { code: '#f59e0b', name: 'イエロー' },
];

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
  // ★追加
  warmth?: number;
  hasHood?: boolean;
};

// ==========================================
// メインコンポーネント
// ==========================================

export default function ClosetPage() {
  // ★初期状態は null に設定。読み込み完了まで待つ
  const [items, setItems] = useState<Item[] | null>(null); 
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // 初回ロード時にデータを取得
  useEffect(() => {
    const saved = localStorage.getItem('my_items');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems([]); // データがなければ空配列
    }
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('このアウターを削除しますか？')) return;
    const newItems = items ? items.filter(item => item.id !== id) : [];
    setItems(newItems);
    localStorage.setItem('my_items', JSON.stringify(newItems));
    // 詳細モーダルが開いていたら閉じる
    if (selectedItem && selectedItem.id === id) setSelectedItem(null); 
  };

  const getSpecLabel = (type: string, value: string) => {
    if (type === 'thickness') {
      if (value === 'thick') return '厚手';
      if (value === 'thin') return '薄手';
      return null;
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

  if (items === null) {
    // データを読み込んでいる間
    return <div className="p-10 text-center text-gray-500">読み込み中...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24 relative">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-gray-600"><Home size={20} /></Link>
          <h1 className="text-xl font-bold text-gray-800">My Closet</h1>
        </div>
        <span className="text-sm text-gray-500 font-bold">{items.length} 着</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="bg-gray-100 p-6 rounded-full"><Shirt size={40} /></div>
          <p>まだアウターがありません</p>
          <p className="text-sm">右下のボタンから登録しよう！</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => {
            const catName = CATEGORIES.find(c => c.id === item.categoryId)?.name || '不明';
            const colorName = COLORS.find(c => c.code === item.color)?.name || '';

            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      renderCategoryIcon(item.categoryId, item.color || '#333')
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mb-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{catName}</span>
                      {colorName && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background: item.color}}></span>{colorName}</span>}
                    </div>
                    <h2 className="font-bold text-gray-800 text-base truncate mb-2">{item.name}</h2>
                    
                    <div className="flex flex-wrap gap-1">
                      {/* ★ 新しいスペックも表示（互換性のために ? をつけておく） */}
                      {item.warmth && item.warmth >= 4 && <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 font-medium">激暖Lv.{item.warmth}</span>}
                      {item.hasHood && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-medium"><Umbrella size={10} className="inline-block mr-1"/>フード</span>}
                      {getSpecLabel('thickness', item.thickness || 'normal') && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-medium">{getSpecLabel('thickness', item.thickness || 'normal')}</span>}
                      {getSpecLabel('weight', item.weight || 'normal') && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-medium">{getSpecLabel('weight', item.weight || 'normal')}</span>}
                    </div>
                  </div>
                </div>

                {/* 編集ボタン */}
                <div className="flex flex-col gap-2 ml-2">
                  <Link href={`/closet/edit?id=${item.id}`} onClick={(e) => e.stopPropagation()}>
                    <button className="text-gray-300 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors"><Edit size={18} /></button>
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

      {/* 詳細表示モーダル */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setSelectedItem(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
            
            {/* 詳細情報 */}
            <div className="flex justify-center mb-6">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-gray-100 bg-gray-50 flex items-center justify-center shadow-inner">
                {selectedItem.image ? <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" /> : renderLargeIcon(selectedItem.categoryId, selectedItem.color || '#333')}
              </div>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{CATEGORIES.find(c => c.id === selectedItem.categoryId)?.name}</span>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">{selectedItem.name}</h2>
              {selectedItem.hasHood && <span className="text-xs font-bold text-blue-500 flex items-center justify-center gap-1"><Umbrella size={12}/>フード付き</span>}
            </div>
            
            {/* スペックグリッド */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] text-gray-400 mb-1">分厚さ</span>
                <span className="font-bold text-sm">{selectedItem.thickness === 'thick' ? '厚手' : selectedItem.thickness === 'thin' ? '薄手' : '普通'}</span>
              </div>
              <div className="bg-orange-50 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] text-orange-400 mb-1 font-bold flex items-center gap-1"><Flame size={12}/> 保温性</span>
                <span className="font-bold text-sm text-orange-600">Lv.{selectedItem.warmth || 3}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] text-gray-400 mb-1">風通し</span>
                <span className="font-bold text-sm">{selectedItem.windproof === 'bad' ? '防風' : selectedItem.windproof === 'good' ? '通気性' : '普通'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={`/closet/edit?id=${selectedItem.id}`} className="flex-1" onClick={(e) => setSelectedItem(null)}>
                <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Edit size={18} /> 編集</button>
              </Link>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(e, selectedItem.id); setSelectedItem(null); }} className="p-3 border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-50"><Trash2 size={20} /></button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}