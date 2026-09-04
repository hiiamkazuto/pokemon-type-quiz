import { useState } from 'react';
import type { 画面状態, タイプ } from './quiz/types';
import { 固定問題 } from './quiz/fixedProblem';
import TitleScreen from './screens/TitleScreen';
import QuizScreen from './screens/QuizScreen';
import EndScreen from './screens/EndScreen';

export default function App() {
  const [画面, set画面] = useState<画面状態>('タイトル画面');

  if (画面 === 'タイトル画面') {
    return (
      <TitleScreen
        onStart={() =>
          set画面({ クイズ画面: { 問題: 固定問題, 選択中: [], 答え合わせ済: false } })
        }
      />
    );
  }

  if (画面 === '終了画面') {
    return <EndScreen onBackToTitle={() => set画面('タイトル画面')} />;
  }

  const クイズ = 画面.クイズ画面;
  return (
    <QuizScreen
      状態={クイズ}
      onToggle={(t: タイプ) =>
        set画面({
          クイズ画面: {
            ...クイズ,
            選択中: クイズ.選択中.includes(t)
              ? クイズ.選択中.filter((x) => x !== t)
              : [...クイズ.選択中, t],
          },
        })
      }
      onQuit={() => set画面('終了画面')}
    />
  );
}
