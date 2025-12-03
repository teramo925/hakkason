"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Check, Trash2, Camera } from 'lucide-react';
// ▼ 自作アイコンを読み込み
import { IconDown, IconLong, IconShort, IconLight } from '../../../components/ClothIcons';

// ▼ アイコン選択ロジック（登録画面と同じもの）
const getCategoryIcon = (id: number, color: string, isSelected: boolean) => {
  const props = { 
    size: 24, 
    color: isSelected ? color : '#9ca3af', // 選択中は指定色、未選択はグレー
    stroke: 'white' 
  };
  switch (id) {
    case 1: return <IconDown {...props} />;
    case 2: case 3: case 4: case 5: return <IconShort {...props} />;
    case 6: case 7: return <IconLong {...props} />;
    case 8: return <IconLight {...props} />;
    default: return null;
  }
};

const CATEGORIES = [
  { id: 1, name: '真冬用ダウン', desc: '一番暖かい' },
  { id: 2, name: '厚手ブルゾン', desc: 'MA-1/ボア' },
  { id: 3, name: '防風ジャケット', desc: 'レザー/登山' },
  { id: 4, name: '薄手ブルゾン', desc: 'マンパ/秋春' },
  { id: 5, name: 'ジャケット', desc: '仕事/きれいめ' },
  { id: 6, name: '冬用コート', desc: 'ウール/厚手' },
  { id: 7, name: '春秋コート', desc: 'トレンチ等' },
  { id: 8, name: 'カーディガン', desc: '室内/重ね着' },
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

// 画像圧縮関数（簡易版）
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
    };
    reader.onerror = (error) => reject(error);
  });
};

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
  const [image, setImage] = useState<string | null>(null);

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
      setImage(item.image || null);
    } else {
      alert('データが見つかりませんでした');
      router.push('/closet');
    }
    setLoading(false);
  }, [itemId, router]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        setImage(compressed);
      } catch (err) {
        alert('画像エラー');
      }
    }
  };

  const handleUpdate = () => {
    if (!selectedCat) return;
    const savedItems = JSON.parse(localStorage.getItem('my_items') || '[]');
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
          image,
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
        
        {/* 写真 */}
        <section className="flex justify-center">
          <label className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white cursor-pointer overflow-hidden">
            {image ? (
              <img src={image} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 flex flex-col items-center gap-1"><Camera size={24} /><span className="text-[10px]">変更</span></div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
        </section>

        {/* カテゴリー（新しいアイコン反映） */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">種類</h2>
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
                  <div className={`p-2 rounded-full ${isSelected ? 'bg-blue-50' : 'bg-gray-100'}`}>
                    {/* ここで新しいアイコンを表示 */}
                    {getCategoryIcon(cat.id, color, isSelected)}
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

        {/* 色 */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3">色</h2>
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm">
            {COLORS.map((c) => (
              <button
                key={c.code}
                onClick={() => setColor(c.code)}
                className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: c.code }}
              >
                {color === c.code && <Check size={14} className={['#ffffff', '#f5f5dc', '#e5e7eb'].includes(c.code) ? 'text-black' : 'text-white'} />}
              </button>
            ))}
          </div>
        </section>

        {/* スペック */}
        <section className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">名前</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-lg border-none bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">分厚さ</label>
            <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              {['thick:厚め', 'normal:普通', 'thin:薄め'].map((opt) => {
                const [val, label] = opt.split(':');
                return <button key={val} onClick={() => setThickness(val)} className={`py-2 text-sm rounded-md ${thickness === val ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}>{label}</button>
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">重さ</label>
            <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              {['heavy:重い', 'normal:普通', 'light:軽い'].map((opt) => {
                const [val, label] = opt.split(':');
                return <button key={val} onClick={() => setWeight(val)} className={`py-2 text-sm rounded-md ${weight === val ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}>{label}</button>
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">風通し</label>
            <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              {['good:良い', 'normal:普通', 'bad:悪い(防風)'].map((opt) => {
                const [val, label] = opt.split(':');
                return <button key={val} onClick={() => setWindproof(val)} className={`py-2 text-sm rounded-md ${windproof === val ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}>{label}</button>
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100">
        <button onClick={handleUpdate} className="w-full max-w-md mx-auto bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
          <Save size={20} /> 更新する
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