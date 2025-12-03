"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shirt, Search, History, ArrowRight, MapPin, Cloud, Sun, CloudRain, Snowflake, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

export default function Home() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  // 天気情報の型を拡張（最高・最低気温、天気名を追加）
  const [weather, setWeather] = useState<{ temp: number; min: number; max: number; code: number; desc: string } | null>(null);
  const [locationName, setLocationName] = useState<string>('位置情報取得中...');
  const [loading, setLoading] = useState(true);

  // 天気コードを日本語に変換する関数
  const getWeatherDesc = (code: number) => {
    if (code === 0) return '快晴';
    if (code === 1) return '晴れ';
    if (code === 2) return '一部曇り';
    if (code === 3) return '曇り';
    if (code <= 48) return '霧';
    if (code <= 55) return '霧雨';
    if (code <= 67) return '雨';
    if (code <= 77) return '雪';
    if (code <= 82) return 'にわか雨';
    if (code <= 86) return '雪';
    if (code <= 99) return '雷雨';
    return '不明';
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName('位置情報オフ');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geoData = await geoRes.json();
        const city = geoData.address.city || geoData.address.ward || geoData.address.town || geoData.address.village || '現在地';
        setLocationName(city);

        // API修正：daily（最高・最低気温）も取得する
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const weatherData = await weatherRes.json();
        
        setWeather({
          temp: weatherData.current_weather.temperature,
          code: weatherData.current_weather.weathercode,
          desc: getWeatherDesc(weatherData.current_weather.weathercode), // 日本語天気
          max: weatherData.daily.temperature_2m_max[0], // 今日の最高
          min: weatherData.daily.temperature_2m_min[0]  // 今日の最低
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
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun size={48} className="text-orange-400 drop-shadow-lg" />;
    if (code <= 3) return <Cloud size={48} className="text-gray-400 drop-shadow-lg" />;
    if (code <= 67 || (code >= 80 && code <= 99)) return <CloudRain size={48} className="text-blue-400 drop-shadow-lg" />;
    if (code >= 71 && code <= 77) return <Snowflake size={48} className="text-cyan-300 drop-shadow-lg" />;
    return <Cloud size={48} className="text-gray-400" />;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 text-gray-800 flex flex-col items-center relative p-6 font-sans">
      
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

      <header className="w-full max-w-md flex justify-between items-end mb-8 mt-4 z-10">
        <div>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Outer Cast</p>
          <h1 className="text-xl font-bold text-slate-800">{date}</h1>
        </div>
        <div className="text-right">
          <p className="text-3xl font-light tracking-tighter text-slate-800">{time}</p>
        </div>
      </header>

      {/* 天気予報カード */}
      <div className="w-full max-w-md mb-8 z-10">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <MapPin size={16} />
              <span className="text-sm font-bold tracking-wide truncate max-w-[150px]">
                {locationName}
              </span>
            </div>
            
            {/* 気温表示 */}
            <div className="flex items-end gap-1 mb-2">
              {loading ? (
                <Loader2 className="animate-spin text-slate-400" />
              ) : (
                <>
                  <span className="text-5xl font-bold text-slate-800 tracking-tighter">
                    {weather ? weather.temp : '--'}
                  </span>
                  <span className="text-xl text-slate-500 mb-1">°C</span>
                </>
              )}
            </div>

            {/* 最高・最低気温 */}
            {!loading && weather && (
              <div className="flex gap-3 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-0.5 text-red-400"><ArrowUp size={12}/> {weather.max}°</span>
                <span className="flex items-center gap-0.5 text-blue-400"><ArrowDown size={12}/> {weather.min}°</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center pr-2">
            {loading ? <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div> : weather && getWeatherIcon(weather.code)}
            {/* 天気名を表示 */}
            <span className="text-sm text-slate-600 font-bold mt-2 tracking-wide">
              {weather ? weather.desc : '--'}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-5 z-10 pb-10 flex-1 justify-center">
        <Link href="/search" className="group w-full">
          <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-8 shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <div className="bg-white/10 w-fit p-3 rounded-2xl backdrop-blur-md mb-4 border border-white/10">
                  <Search size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Coordinate</h2>
                <p className="text-slate-400 text-xs">今日の最適アウターを探す</p>
              </div>
              <div className="bg-white text-slate-900 p-3 rounded-full group-hover:bg-blue-400 group-hover:text-white transition-colors">
                <ArrowRight size={24} />
              </div>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/closet" className="group w-full">
            <div className="h-full bg-white/70 border border-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md">
              <div className="bg-orange-100 w-fit p-3 rounded-xl mb-3">
                <Shirt size={24} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">My Closet</h3>
                <p className="text-slate-400 text-[10px]">アイテム管理</p>
              </div>
            </div>
          </Link>

          <Link href="/history" className="group w-full">
            <div className="h-full bg-white/70 border border-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md">
              <div className="bg-blue-100 w-fit p-3 rounded-xl mb-3">
                <History size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">History</h3>
                <p className="text-slate-400 text-[10px]">記録・ログ</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      <footer className="mt-auto py-4 text-center">
        <p className="text-[10px] text-slate-400 tracking-widest">OUTER CAST ver.1.0</p>
      </footer>
    </main>
  );
}