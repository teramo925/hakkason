"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shirt, Search, History, ArrowRight, MapPin, 
  Cloud, Sun, CloudRain, Snowflake, Loader2, 
  ArrowUp, ArrowDown, RefreshCw, Droplets 
} from 'lucide-react';

export default function Home() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [weather, setWeather] = useState<{ temp: number; min: number; max: number; code: number; desc: string; humidity?: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('---');
  const [loading, setLoading] = useState(false);

  // 天気コードを日本語に
  const getWeatherDesc = (code: number) => {
    if (code === 0) return '快晴';
    if (code === 1) return '晴れ';
    if (code === 2) return '一部曇り';
    if (code === 3) return '曇り';
    if (code <= 48) return '霧';
    if (code <= 67) return '雨';
    if (code <= 77) return '雪';
    if (code <= 82) return 'にわか雨';
    if (code <= 99) return '雷雨';
    return '-';
  };

  // データ取得関数
  const fetchData = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setLocationName('位置情報オフ');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        // 1. 地名 (OpenStreetMap)
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geoData = await geoRes.json();
        const city = geoData.address.city || geoData.address.ward || geoData.address.town || geoData.address.village || '現在地';
        setLocationName(city);

        // 2. 天気 (Open-Meteo)
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&hourly=relativehumidity_2m&timezone=auto`
        );
        const weatherData = await weatherRes.json();
        
        // 現在時刻の湿度を取得
        const currentHour = new Date().getHours();
        const currentHumidity = weatherData.hourly.relativehumidity_2m[currentHour];

        setWeather({
          temp: weatherData.current_weather.temperature,
          code: weatherData.current_weather.weathercode,
          desc: getWeatherDesc(weatherData.current_weather.weathercode),
          max: weatherData.daily.temperature_2m_max[0],
          min: weatherData.daily.temperature_2m_min[0],
          humidity: currentHumidity
        });
      } catch (e) {
        setLocationName('取得エラー');
      } finally {
        setLoading(false);
      }
    }, () => {
      setLocationName('位置情報許可待ち');
      setLoading(false);
    });
  };

  // 初回ロード時と時計
  useEffect(() => {
    fetchData(); // 初回データ取得

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun size={60} className="text-orange-500 drop-shadow-md" />;
    if (code <= 3) return <Cloud size={60} className="text-gray-400 drop-shadow-md" />;
    if (code <= 67 || (code >= 80 && code <= 99)) return <CloudRain size={60} className="text-blue-500 drop-shadow-md" />;
    if (code >= 71 && code <= 77) return <Snowflake size={60} className="text-cyan-400 drop-shadow-md" />;
    return <Cloud size={60} className="text-gray-400" />;
  };

  return (
    // 背景：ホワイトベースで清潔感のあるデザインに変更
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center relative p-6 font-sans">
      
      {/* ヘッダー：更新ボタン付き */}
      <header className="w-full max-w-md flex justify-between items-center mb-6 mt-4 z-10">
        <div>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Outer Cast</p>
          <div className="flex items-baseline gap-2">
            <h1 className="text-4xl font-light tracking-tighter">{time}</h1>
            <span className="text-sm font-bold text-slate-500">{date}</span>
          </div>
        </div>
        <button 
          onClick={fetchData} 
          className="p-3 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all text-slate-400"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* メイン天気カード（大きく変更） */}
      <div className="w-full max-w-md mb-8 z-10">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-white flex flex-col items-center relative overflow-hidden">
          
          {/* 背景装飾 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="relative z-10 w-full">
            <div className="flex justify-between items-start w-full mb-2">
              <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
                <MapPin size={14} />
                <span className="text-xs font-bold truncate max-w-[120px]">{locationName}</span>
              </div>
              <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                {weather ? weather.desc : '--'}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-col">
                <div className="flex items-start">
                  <span className="text-7xl font-bold text-slate-800 tracking-tighter">
                    {weather ? Math.round(weather.temp) : '--'}
                  </span>
                  <span className="text-2xl text-slate-400 mt-2 ml-1">°</span>
                </div>
                {/* 最高・最低気温 */}
                {weather && (
                  <div className="flex gap-4 text-sm font-bold mt-2">
                    <span className="text-red-400 flex items-center gap-1"><ArrowUp size={14}/>{Math.round(weather.max)}°</span>
                    <span className="text-blue-400 flex items-center gap-1"><ArrowDown size={14}/>{Math.round(weather.min)}°</span>
                  </div>
                )}
              </div>
              
              {/* アイコン表示エリア */}
              <div className="flex flex-col items-center gap-2">
                {loading ? <Loader2 className="animate-spin text-slate-300" size={40} /> : weather && getWeatherIcon(weather.code)}
                {weather?.humidity && (
                  <div className="flex items-center gap-1 text-xs text-blue-400 font-bold bg-blue-50 px-2 py-1 rounded-md">
                    <Droplets size={12} /> {weather.humidity}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メニューエリア */}
      <div className="w-full max-w-md flex flex-col gap-4 z-10 pb-10 flex-1">
        
        {/* ① 提案機能 */}
        <Link href="/search" className="group w-full">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between transition-transform active:scale-95">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-4 rounded-2xl">
                <Search size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Coordinate</h2>
                <p className="text-slate-400 text-xs">今日の最適アウターを探す</p>
              </div>
            </div>
            <div className="bg-white text-slate-900 p-3 rounded-full">
              <ArrowRight size={20} />
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          {/* ② 登録機能 */}
          <Link href="/closet" className="group w-full">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex flex-col justify-between h-32 active:scale-95 transition-transform">
              <div className="text-orange-500 bg-orange-50 w-fit p-3 rounded-xl">
                <Shirt size={24} />
              </div>
              <span className="font-bold text-slate-700">My Closet</span>
            </div>
          </Link>

          {/* ③ 履歴機能 */}
          <Link href="/history" className="group w-full">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex flex-col justify-between h-32 active:scale-95 transition-transform">
              <div className="text-blue-500 bg-blue-50 w-fit p-3 rounded-xl">
                <History size={24} />
              </div>
              <span className="font-bold text-slate-700">History</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}