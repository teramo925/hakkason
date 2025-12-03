"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Check } from 'lucide-react';

// カテゴリー定義
const CATEGORIES = [
  { id: 1, name: 'ダウン・中綿', icon: '☃️', temp: 3 },
  { id: 2, name: 'ミリタリー', icon: '🪖', temp: 7 },
  { id: 3, name: 'レザー', icon: '🏍️', temp: 12 },
  { id: 4, name: 'マウンテンPK', icon: '⛰️', temp: 16 },
  { id: 5, name: 'ジャケット', icon: '👔', temp: 18 },
  { id: 6, name: 'チェスター', icon: '🕴️', temp: 7 },
  { id: 7, name: 'トレンチ/P', icon: '🧥', temp: 12 },
  { id: 8, name: 'ライトアウター', icon: '🧶', temp: 22 },
];

// ▼ リニューアルしたカラーパレット（18色）
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

export default function AddItemPage() {
  const router = useRouter();
  
  // 入力ステート
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [thickness, setThickness] = useState('normal'); // thick, normal, thin
  const [weight, setWeight] = useState('normal');       // heavy, normal, light
  const [windproof, setWindproof] = useState('normal'); // bad(防風), normal, good
  const [color, setColor] = useState('#000000');        // 初期値は黒

  // 保存処理
  const handleSave = () => {
    if (!selectedCat) {
      alert('カテゴリーを選んでください');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      categoryId: selectedCat,
      name: name || CATEGORIES.find(c => c.id === selectedCat)?.name,
      thickness,
      weight,
      windproof,
      color, // 色情報も保存
      createdAt: new Date().toISOString(),
    };

    // Local Storageに保存
    const savedItems = JSON.parse(localStorage.getItem('my_items') || '[]');
    savedItems.push(newItem);
    localStorage.setItem('my_items', JSON.stringify(savedItems));

    router.push('/closet');
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/closet" className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">アウター登録</h1>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-8">
        
        {/* ① カテゴリー選択 */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">1. カテゴリー</h2>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border-2
                  ${selectedCat === cat.id 
                    ? 'bg-white border-blue-500 shadow-md transform scale-105' 
                    : 'bg-white border-transparent shadow-sm text-gray-400'}`}
                // 選択時はアイコンをその色にする
                style={{ color: selectedCat === cat.id ? color : '' }}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[10px] font-bold">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ② 色の選択 */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">2. 色</h2>
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm">
            {COLORS.map((c) => (
              <button
                key={c.code}
                onClick={() => setColor(c.code)}
                className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: c.code }}
                title={c.name}
              >
                {/* 選択中のチェックマーク（背景が白っぽい色は黒、それ以外は白） */}
                {color === c.code && (
                  <Check 
                    size={14} 
                    className={['#ffffff', '#f5f5dc', '#e5e7eb'].includes(c.code) ? 'text-black' : 'text-white'} 
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ③ 詳細スペック */}
        <section className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
          
          {/* 名前 */}
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">名前（任意）</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：勝負ダウン"
              className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 分厚さ */}
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">分厚さ</label>
            <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              {['thick:厚め', 'normal:普通', 'thin:薄め'].map((opt) => {
                const [val, label] = opt.split(':');
                return (
                  <button
                    key={val}
                    onClick={() => setThickness(val)}
                    className={`py-2 text-sm rounded-md transition-all ${thickness === val ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">※厚め=-3℃ / 薄め=+5℃ 補正</p>
          </div>

          {/* 重さ */}
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">重さ</label>
            <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              {['heavy:重い', 'normal:普通', 'light:軽い'].map((opt) => {
                const [val, label] = opt.split(':');
                return (
                  <button
                    key={val}
                    onClick={() => setWeight(val)}
                    className={`py-2 text-sm rounded-md transition-all ${weight === val ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 風通し */}
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">風通し</label>
            <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              {['good:良い', 'normal:普通', 'bad:悪い(防風)'].map((opt) => {
                const [val, label] = opt.split(':');
                return (
                  <button
                    key={val}
                    onClick={() => setWindproof(val)}
                    className={`py-2 text-sm rounded-md transition-all ${windproof === val ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

        </section>
      </div>

      {/* 登録ボタン（下部固定） */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100">
        <button 
          onClick={handleSave}
          className="w-full max-w-md mx-auto bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
        >
          <Save size={20} />
          登録する
        </button>
      </div>

    </main>
  );
}