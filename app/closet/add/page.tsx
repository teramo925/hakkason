"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// ▼ アイコンのインポート（エラーが出る場合は components のパスを確認、なければ lucide-react のみ使用）
import { ArrowLeft, Save, Check, Camera, Snowflake, Shield, Zap, Mountain, Briefcase, Landmark, Umbrella, Feather, Shirt } from 'lucide-react';

// ==========================================
// ここに「画像の圧縮関数」を直接書きます！
// ==========================================
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; // 幅を300pxに縮小
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

// ==========================================
// ここから設定データ
// ==========================================

// アイコン表示用コンポーネント（Lucideアイコンを使用）
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
  { id: 1, name: '真冬用ダウン', desc: '一番暖かい', temp: 3 },
  { id: 2, name: '厚手ブルゾン', desc: 'MA-1/ボア', temp: 7 },
  { id: 3, name: '防風ジャケット', desc: 'レザー/登山', temp: 12 },
  { id: 4, name: '薄手ブルゾン', desc: 'マンパ/秋春', temp: 16 },
  { id: 5, name: 'ジャケット', desc: '仕事/きれいめ', temp: 18 },
  { id: 6, name: '冬用コート', desc: 'ウール/厚手', temp: 7 },
  { id: 7, name: '春秋コート', desc: 'トレンチ等', temp: 12 },
  { id: 8, name: 'カーディガン', desc: '室内/重ね着', temp: 22 },
];

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

// ==========================================
// 画面コンポーネント
// ==========================================

export default function AddItemPage() {
  const router = useRouter();
  
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [thickness, setThickness] = useState('normal');
  const [weight, setWeight] = useState('normal');
  const [windproof, setWindproof] = useState('normal');
  const [color, setColor] = useState('#000000');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      try {
        const compressed = await compressImage(e.target.files[0]);
        setImage(compressed);
      } catch (err) {
        alert('画像の読み込みに失敗しました');
      } finally {
        setIsProcessing(false);
      }
    }
  };

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
      color,
      image,
      createdAt: new Date().toISOString(),
    };

    try {
      const savedItems = JSON.parse(localStorage.getItem('my_items') || '[]');
      savedItems.push(newItem);
      localStorage.setItem('my_items', JSON.stringify(savedItems));
      router.push('/closet');
    } catch (e) {
      alert('容量オーバーです！画像を減らすか、古いアイテムを削除してください。');
    }
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
        
        {/* ① 写真登録エリア */}
        <section className="flex justify-center">
          <label className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white cursor-pointer overflow-hidden hover:bg-gray-50 transition-colors shadow-sm">
            {image ? (
              <img src={image} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 flex flex-col items-center gap-1">
                <Camera size={24} />
                <span className="text-[10px] font-bold">写真を追加</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs font-bold text-gray-500">...</div>
            )}
          </label>
        </section>

        {/* ② カテゴリー選択 */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">種類を選ぶ（必須）</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`p-3 rounded-xl flex items-center gap-3 transition-all border-2 text-left
                    ${isSelected 
                      ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' 
                      : 'bg-white border-transparent shadow-sm hover:bg-gray-50'}`}
                >
                  <div className={`p-2 rounded-full ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    {getCategoryIcon(cat.id)}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-800">{cat.name}</span>
                    <span className="block text-[10px] text-gray-400">{cat.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ③ 色の選択 */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">色を選ぶ</h2>
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm">
            {COLORS.map((c) => (
              <button
                key={c.code}
                onClick={() => setColor(c.code)}
                className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: c.code }}
              >
                {color === c.code && (
                  <Check size={14} className={['#ffffff', '#f5f5dc', '#e5e7eb'].includes(c.code) ? 'text-black' : 'text-white'} />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ④ スペック詳細 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">名前（任意）</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：いつものダウン"
              className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 分厚さなどのボタン */}
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
          onClick={handleSave}
          className="w-full max-w-md mx-auto bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
        >
          <Save size={20} />
          登録する
        </button>
      </div>
    </main>
  );
}