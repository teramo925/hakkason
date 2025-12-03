"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Check, Camera, Snowflake, Shield, Zap, Mountain, Briefcase, Landmark, Umbrella, Feather, Shirt, Flame } from 'lucide-react';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getCategoryIcon = (id: number) => {
  switch (id) {
    case 1: return <Snowflake size={24} />;
    case 2: return <Shield size={24} />;
    case 3: return <Zap size={24} />;
    case 4: return <Mountain size={24} />;
    case 5: return <Briefcase size={24} />;
    case 6: return <Landmark size={24} />;
    case 7: return <Umbrella size={24} />;
    case 8: return <Feather size={24} />;
    default: return <Shirt size={24} />;
  }
};

const CATEGORIES = [
  { id: 1, name: 'ダウン・中綿', desc: '真冬・極寒' },
  { id: 2, name: '厚手ブルゾン', desc: 'MA-1/ボア' },
  { id: 3, name: '防風ジャケット', desc: 'レザー/登山' },
  { id: 4, name: '薄手ブルゾン', desc: 'マンパ/秋春' },
  { id: 5, name: 'ジャケット', desc: '仕事/きれいめ' },
  { id: 6, name: '冬用コート', desc: 'ウール/厚手' },
  { id: 7, name: '春秋コート', desc: 'トレンチ等' },
  { id: 8, name: 'カーディガン', desc: '室内/重ね着' },
];

const COLORS = [
  { code: '#000000', name: 'ブラック' }, { code: '#374151', name: 'チャコール' }, { code: '#9ca3af', name: 'グレー' },
  { code: '#e5e7eb', name: 'ライトグレー' }, { code: '#ffffff', name: 'ホワイト' }, { code: '#f5f5dc', name: 'ベージュ' },
  { code: '#d4b483', name: 'キャメル' }, { code: '#451a03', name: 'ブラウン' }, { code: '#556b2f', name: 'オリーブ' },
  { code: '#3f6212', name: 'カーキ' }, { code: '#1e3a8a', name: 'ネイビー' }, { code: '#2563eb', name: 'ブルー' },
  { code: '#60a5fa', name: '水色' }, { code: '#7c3aed', name: 'パープル' }, { code: '#dc2626', name: 'レッド' },
  { code: '#9f1239', name: 'ワイン' }, { code: '#ec4899', name: 'ピンク' }, { code: '#f59e0b', name: 'イエロー' },
];

export default function AddItemPage() {
  const router = useRouter();
  
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [thickness, setThickness] = useState('normal');
  const [weight, setWeight] = useState('normal');
  const [windproof, setWindproof] = useState('normal');
  const [color, setColor] = useState('#000000');
  const [image, setImage] = useState<string | null>(null);
  
  // ▼▼▼ 新しいパラメータ ▼▼▼
  const [warmth, setWarmth] = useState(3); // 1-5 (3=普通)
  const [hasHood, setHasHood] = useState(false); // フード有無

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        setImage(compressed);
      } catch (err) { alert('画像エラー'); }
    }
  };

  const handleSave = () => {
    if (!selectedCat) { alert('カテゴリーを選んでください'); return; }

    const newItem = {
      id: Date.now().toString(),
      categoryId: selectedCat,
      name: name || CATEGORIES.find(c => c.id === selectedCat)?.name,
      thickness,
      weight,
      windproof,
      color,
      image,
      warmth,   // 保存
      hasHood,  // 保存
      createdAt: new Date().toISOString(),
    };

    try {
      const savedItems = JSON.parse(localStorage.getItem('my_items') || '[]');
      savedItems.push(newItem);
      localStorage.setItem('my_items', JSON.stringify(savedItems));
      router.push('/closet');
    } catch (e) { alert('容量オーバーです！'); }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/closet" className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">アウター登録</h1>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-8">
        <section className="flex justify-center">
          <label className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white cursor-pointer overflow-hidden hover:bg-gray-50 transition-colors shadow-sm">
            {image ? <img src={image} alt="preview" className="w-full h-full object-cover" /> : <div className="text-gray-400 flex flex-col items-center gap-1"><Camera size={24} /><span className="text-[10px] font-bold">写真</span></div>}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">カテゴリー（必須）</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`p-3 rounded-xl flex items-center gap-3 transition-all border-2 text-left ${selectedCat === cat.id ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-white border-transparent shadow-sm'}`}>
                <div className={`p-2 rounded-full ${selectedCat === cat.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>{getCategoryIcon(cat.id)}</div>
                <div><span className="block text-sm font-bold text-gray-800">{cat.name}</span><span className="block text-[10px] text-gray-400">{cat.desc}</span></div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">色</h2>
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm">
            {COLORS.map((c) => (
              <button key={c.code} onClick={() => setColor(c.code)} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-transform hover:scale-110" style={{ backgroundColor: c.code }}>
                {color === c.code && <Check size={14} className={['#ffffff', '#f5f5dc', '#e5e7eb'].includes(c.code) ? 'text-black' : 'text-white'} />}
              </button>
            ))}
          </div>
        </section>

        {/* ▼▼▼ 追加：性能スペック入力 ▼▼▼ */}
        <section className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">名前</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：勝負ダウン" className="w-full p-3 bg-gray-50 rounded-lg border-none bg-gray-100" />
          </div>

          {/* 保温レベル（スライダー） */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-bold text-gray-500 flex items-center gap-1"><Flame size={16} className="text-orange-500"/> 保温性 (Warmth)</label>
              <span className="text-xl font-bold text-orange-500">Lv.{warmth}</span>
            </div>
            <input 
              type="range" min="1" max="5" step="1" 
              value={warmth} 
              onChange={(e) => setWarmth(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>薄い</span>
              <span>普通</span>
              <span>超極暖</span>
            </div>
          </div>

          {/* フード有無 */}
          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-bold text-gray-500">フードはありますか？</label>
            <button 
              onClick={() => setHasHood(!hasHood)}
              className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${hasHood ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${hasHood ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* その他のスペック（簡略化して配置） */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">重さ</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['heavy:重', 'normal:普', 'light:軽'].map(o => {
                  const [val, label] = o.split(':');
                  return <button key={val} onClick={() => setWeight(val)} className={`flex-1 py-1 text-xs rounded ${weight === val ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}>{label}</button>
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">風通し</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['good:良', 'normal:普', 'bad:防風'].map(o => {
                  const [val, label] = o.split(':');
                  return <button key={val} onClick={() => setWindproof(val)} className={`flex-1 py-1 text-xs rounded ${windproof === val ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}>{label}</button>
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100">
        <button onClick={handleSave} className="w-full max-w-md mx-auto bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"><Save size={20} /> 登録する</button>
      </div>
    </main>
  );
}