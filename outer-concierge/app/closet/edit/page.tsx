"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Check, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: 'ダウン・中綿', icon: '☃️' },
  { id: 2, name: 'ミリタリー', icon: '🪖' },
  { id: 3, name: 'レザー', icon: '🏍️' },
  { id: 4, name: 'マウンテンPK', icon: '⛰️' },
  { id: 5, name: 'ジャケット', icon: '👔' },
  { id: 6, name: 'チェスター', icon: '🕴️' },
  { id: 7, name: 'トレンチ/P', icon: '🧥' },
  { id: 8, name: 'ライトアウター', icon: '🧶' },
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

function EditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [thickness, setThickness] = useState('normal');
  const [weight, setWeight] = useState('normal');
  const [windproof, setWindproof] = useState('normal');
  const [color, setColor] = useState('#000000');

  // データ読み込み
  useEffect(() => {
    if (!itemId) return;
    const savedItems = JSON.parse(localStorage.getItem('my_items') || '[]');
    const item = savedItems.find((i: any) => i.id === itemId);
    
    if (item) {
      setSelectedCat(item.categoryId);
      setName(item.name);
      setThickness(item.thickness);
      setWeight(item.weight);
      setWindproof(item.windproof);
      setColor(item.color || '#000000');
    } else {
      alert('データが見つかりませんでした');
      router.push('/closet');
    }
    setLoading(false);
  }, [itemId, router]);

  const handleUpdate = () => {
    if (!selectedCat) return;

    const savedItems = JSON.parse(localStorage.getItem('my_items') || '[]');
    // IDが一致するものを探して上書き
    const newItems = savedItems.map((item: any) => {
      if (item.id === itemId) {
        return {
          ...item,
          categoryId: selectedCat,
          name: name || CATEGORIES.find(c => c.id === selectedCat)?.name,
          thickness,
          weight,
          windproof,
          color,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    localStorage.setItem('my_items', JSON.stringify(newItems));
    router.push('/closet');
  };

  const handleDelete = () => {
    if(!confirm('本当に削除しますか？')) return;
    const savedItems = JSON.parse(localStorage.getItem('my_items') || '[]');
    const newItems = savedItems.filter((i: any) => i.id !== itemId);
    localStorage.setItem('my_items', JSON.stringify(newItems));
    router.push('/closet');
  };

  if (loading) return <div className="p-10 text-center">読み込み中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/closet" className="p-2 bg-white rounded-full shadow-sm">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">アウター編集</h1>
        </div>
        <button onClick={handleDelete} className="text-red-500 bg-red-50 p-2 rounded-full">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-8">
        {/* カテゴリー */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">カテゴリー</h2>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border-2
                  ${selectedCat === cat.id 
                    ? 'bg-white border-blue-500 shadow-md transform scale-105' 
                    : 'bg-white border-transparent shadow-sm text-gray-400'}`}
                style={{ color: selectedCat === cat.id ? color : '' }}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[10px] font-bold">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 色 */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">色</h2>
          <div className="flex flex-wrap gap-2 bg-white p-4 rounded-xl shadow-sm">
            {COLORS.map((c) => (
              <button
                key={c.code}
                onClick={() => setColor(c.code)}
                className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-transform hover:scale-110 relative`}
                style={{ backgroundColor: c.code }}
                title={c.name}
              >
                {/* 白っぽい色の時はチェックマークを黒くする */}
                {color === c.code && (
                  <Check size={14} className={['#ffffff', '#f5f5dc', '#e5e7eb'].includes(c.code) ? 'text-black' : 'text-white'} />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* スペック詳細 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">名前</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">分厚さ</label>
            <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              {['thick:厚め', 'normal:普通', 'thin:薄め'].map((opt) => {
                const [val, label] = opt.split(':');
                return (
                  <button key={val} onClick={() => setThickness(val)} className={`py-2 text-sm rounded-md transition-all ${thickness === val ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">重さ</label>
            <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              {['heavy:重い', 'normal:普通', 'light:軽い'].map((opt) => {
                const [val, label] = opt.split(':');
                return (
                  <button key={val} onClick={() => setWeight(val)} className={`py-2 text-sm rounded-md transition-all ${weight === val ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">風通し</label>
            <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              {['good:良い', 'normal:普通', 'bad:悪い(防風)'].map((opt) => {
                const [val, label] = opt.split(':');
                return (
                  <button key={val} onClick={() => setWindproof(val)} className={`py-2 text-sm rounded-md transition-all ${windproof === val ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100">
        <button 
          onClick={handleUpdate}
          className="w-full max-w-md mx-auto bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
        >
          <Save size={20} />
          更新する
        </button>
      </div>
    </main>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditForm />
    </Suspense>
  );
}