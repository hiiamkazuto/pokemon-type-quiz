import { useState } from 'react';
import { 遷移する, type 操作 } from './quiz/transition';
import type { 画面状態 } from './quiz/types';
import TitleScreen from './screens/TitleScreen';
import QuizScreen from './screens/QuizScreen';
import EndScreen from './screens/EndScreen';
import ChartScreenPrototype from './screens/ChartScreenPrototype';

// PROTOTYPE分岐（使い捨て・本番反映時に除去）: ?variant=A|B|C で相性表画面プロトタイプを表示
const variantParam = new URLSearchParams(window.location.search).get('variant');
const isPrototype = variantParam === 'A' || variantParam === 'B' || variantParam === 'C';

export default function App() {
  const [画面, set画面] = useState<画面状態>('タイトル画面');
  const 操作する = (操作: 操作) => set画面((現) => 遷移する(現, 操作));

  if (isPrototype) {
    return <ChartScreenPrototype />;
  }

  if (画面 === 'タイトル画面') {
    return <TitleScreen onStart={() => 操作する({ 種類: 'スタート' })} />;
  }

  if (画面 === '終了画面') {
    return <EndScreen onBackToTitle={() => 操作する({ 種類: 'タイトルへもどる' })} />;
  }

  return (
    <QuizScreen 状態={画面.クイズ画面} on操作={操作する} />
  );
}
