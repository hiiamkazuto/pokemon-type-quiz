import type { 問題, タイプ } from '../quiz/types';
import { タイプ色 } from '../quiz/palette';
import { 効果ラベル, 効果記号 } from '../quiz/labels';

type Props = {
  状態: { 問題: 問題; 選択中: タイプ[]; 答え合わせ済: boolean };
  onToggle: (t: タイプ) => void;
  onQuit: () => void;
};

/** クイズ画面: お題バッジ・効果チップ・選択肢ボタン。終了画面への「やめる」を持つ */
export default function QuizScreen({ 状態, onToggle, onQuit }: Props) {
  const q = 状態.問題;
  const 選択中 = 状態.選択中;

  return (
    <section className="screen quiz-screen">
      <div className="screen-head">
        <h1>ポケモンタイプ相性クイズ</h1>
        <button type="button" className="btn-sub" onClick={onQuit}>
          やめる
        </button>
      </div>

      <div className="question-head">
        <div className="field">
          <div className="field-label">お題（守る側）</div>
          <span className="badge" style={{ background: タイプ色[q.お題] }}>
            {q.お題}
          </span>
        </div>
        <div className="field">
          <div className="field-label">攻める側の効果</div>
          <span className="effect-chip">
            <span className="mark">{効果記号[q.効果]}</span>
            {効果ラベル[q.効果]}
          </span>
        </div>
      </div>

      <div className="options">
        {q.選択肢.map((t) => (
          <button
            key={t}
            type="button"
            className={`opt${選択中.includes(t) ? ' selected' : ''}`}
            style={{ background: タイプ色[t] }}
            onClick={() => onToggle(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="actions">
        <button type="button" className="btn-primary" disabled={選択中.length === 0}>
          答え合わせ
        </button>
      </div>
    </section>
  );
}
