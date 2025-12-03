import React from 'react';

// 共通のプロパティ
type IconProps = {
  size?: number;
  color?: string; // 塗りつぶしの色
  stroke?: string; // 線の色
};

// ① ダウン（モコモコ・丈短め）
export const IconDown = ({ size = 24, color = "currentColor", stroke = "white" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6C4 4 6 3 8 3H16C18 3 20 4 20 6V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V6Z" fill={color} stroke={color} strokeWidth="2"/>
    {/* 横線でダウンのモコモコ感を表現 */}
    <path d="M4 10H20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 15H20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 3V22" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ② コート（丈長め）
export const IconLong = ({ size = 24, color = "currentColor", stroke = "white" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5C5 3 7 2 9 2H15C17 2 19 3 19 5V22H5V5Z" fill={color} stroke={color} strokeWidth="2"/>
    {/* 襟元のVライン */}
    <path d="M9 2L12 8L15 2" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* 前合わせ */}
    <path d="M12 8V22" stroke={stroke} strokeWidth="1.5"/>
  </svg>
);

// ③ ジャケット・ブルゾン（丈短め）
export const IconShort = ({ size = 24, color = "currentColor", stroke = "white" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6C4 4.5 5.5 3 7 3H17C18.5 3 20 4.5 20 6V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V6Z" fill={color} stroke={color} strokeWidth="2"/>
    {/* 襟とジッパー */}
    <path d="M12 3V21" stroke={stroke} strokeWidth="1.5"/>
    <path d="M8 3L12 8L16 3" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* 袖のリブイメージ */}
    <path d="M4 16H6" stroke={stroke} strokeWidth="1.5"/>
    <path d="M18 16H20" stroke={stroke} strokeWidth="1.5"/>
  </svg>
);

// ④ カーディガン（薄手・軽い）
export const IconLight = ({ size = 24, color = "currentColor", stroke = "white" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 6C5 4 7 3 9 3H15C17 3 19 4 19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6Z" fill={color} stroke={color} strokeWidth="2"/>
    {/* 深いVネック */}
    <path d="M8 3L12 11L16 3" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 11V22" stroke={stroke} strokeWidth="1.5"/>
    {/* ボタン */}
    <circle cx="14" cy="14" r="1" fill={stroke}/>
    <circle cx="14" cy="18" r="1" fill={stroke}/>
  </svg>
);