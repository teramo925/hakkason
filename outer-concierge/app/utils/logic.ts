// utils/logic.ts

// マスタデータ：カテゴリーごとの基準気温
const TARGET_TEMPS: Record<number, number> = {
  1: 3,   // ダウン
  2: 7,   // ミリタリー
  3: 12,  // レザー
  4: 16,  // マウンテンPK
  5: 18,  // ジャケット
  6: 7,   // チェスター
  7: 12,  // トレンチ
  8: 22,  // ライトアウター
};

type Item = {
  id: string;
  categoryId: number;
  name: string;
  thickness: string; // thick, normal, thin
  weight: string;
  windproof: string; // bad(防風), normal, good
};

// ベストな一着を選ぶ関数
export function getBestOuter(items: Item[], minTemp: number, windSpeed: number) {
  if (items.length === 0) return null;

  let bestItem = items[0];
  let maxScore = -9999;

  items.forEach((item) => {
    // 1. 基準気温の補正
    let target = TARGET_TEMPS[item.categoryId] || 15;
    
    // 分厚さ補正
    if (item.thickness === 'thick') target -= 3; // 厚手ならより寒い日に対応
    if (item.thickness === 'thin') target += 5;  // 薄手なら暖かい日に対応

    // 2. 基本スコア（気温差が小さいほど高得点）
    // 100点満点から、気温差×5点を引く
    let score = 100 - Math.abs(target - minTemp) * 5;

    // 3. 状況補正（風）
    // 風速5m以上で、防風(bad)なら加点
    if (windSpeed >= 5 && item.windproof === 'bad') {
      score += 15;
    }
    // 風速5m以上で、風通しが良い(good)なら減点
    if (windSpeed >= 5 && item.windproof === 'good') {
      score -= 10;
    }

    // ★最高得点を更新したら、暫定1位にする
    if (score > maxScore) {
      maxScore = score;
      bestItem = item;
    }
  });

  return { item: bestItem, score: maxScore };
}