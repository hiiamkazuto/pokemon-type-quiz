import type { 問題, タイプ } from '../quiz/types';
import type { 操作 } from '../quiz/transition';
import { 完全一致する } from '../quiz/judge';
import { タイプ色 } from '../quiz/palette';
import { 効果ラベル, 効果記号, 効果文言 } from '../quiz/labels';

type Props = {
  状態: { 問題: 問題; 選択中: タイプ[]; 答え合わせ済: boolean };
  on操作: (操作: 操作) => void;
};


/** クイズ画面: お題バッジ・効果チップ・選択肢ボタン。答え合わせ後に該当を明かし、「次の問題」で続行、「やめる」で終了画面へ */
export default function QuizScreen({ 状態, on操作 }: Props) {
  const 問題 = 状態.問題;
  const 選択中 = 状態.選択中;
  const 完全一致 = 状態.答え合わせ済 && 完全一致する(選択中, 問題.正解);

  return (
    <section className="screen quiz-screen">
      <div className="screen-head">
        <h1>ポケモンタイプ相性クイズ</h1>
        <button type="button" className="btn-sub" onClick={() => on操作({ 種類: 'やめる' })}>
          やめる
        </button>
      </div>

      <div className="question-head">
        <div className="field">
          <div className="field-label">お題（守る側）</div>
          <span className="badge" style={{ background: タイプ色[問題.お題] }}>
            {問題.お題}
          </span>
        </div>
        <div className="field">
          <div className="field-label">攻める側の効果</div>
          <span className="effect-chip">
            <span className="mark">{効果記号[問題.効果]}</span>
            {効果ラベル[問題.効果]}
          </span>
        </div>
      </div>

      <div className="options">
        {問題.選択肢.map((t) => (
          <button
            key={t}
            type="button"
            className={[
              'opt',
              選択中.includes(t) ? 'selected' : '',
              状態.答え合わせ済 && 問題.正解.includes(t) ? 'correct' : '',
              状態.答え合わせ済 && 選択中.includes(t) && !問題.正解.includes(t) ? 'wrongpick' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ background: タイプ色[t] }}
            disabled={状態.答え合わせ済}
            onClick={() => on操作({ 種類: '選択を切り替え', タイプ: t })}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="actions">
        <button
          type="button"
          className="btn-primary"
          disabled={状態.答え合わせ済 || 選択中.length === 0}
          onClick={() => on操作({ 種類: '答え合わせ' })}
        >
          答え合わせ
        </button>
        {状態.答え合わせ済 && (
          <button type="button" className="btn-sub" onClick={() => on操作({ 種類: '次の問題' })}>
            次の問題 →
          </button>
        )}
      </div>

      {状態.答え合わせ済 && (
        <div className={`feedback ${完全一致 ? 'ok' : 'ng'}`}>
          <div className="feedback-msg">{完全一致 ? '⭕ 正解！' : '❌ はずれ…'}</div>
          <div>
            お題 {問題.お題} に対して{効果記号[問題.効果]}
            {効果ラベル[問題.効果]}の攻める側：
          </div>
          <div className="reveal">
            {問題.正解.map((t) => (
              <span key={t} className="badge" style={{ background: タイプ色[t] }}>
                {t}
              </span>
            ))}
          </div>
          <div className="feedback-line">「{効果文言[問題.効果]}」</div>
        </div>
      )}
    </section>
  );
}
