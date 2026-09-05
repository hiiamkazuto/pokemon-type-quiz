import type { 問題, タイプ } from '../quiz/types';
import type { 操作 } from '../quiz/transition';
import { 完全一致する } from '../quiz/judge';
import { タイプ色 } from '../quiz/palette';
import { 効果ラベル, 効果記号, 効果文言 } from '../quiz/labels';

type Props = {
  状態: { 問題: 問題; 選択中: タイプ[]; 答え合わせ済: boolean };
  on操作: (操作: 操作) => void;
};


/** クイズ画面: お題センターヒーロー・効果ピル・3列選択肢。答え合わせ後に該当を明かし、「次の問題」で続行、「やめる」で終了画面へ */
export default function QuizScreen({ 状態, on操作 }: Props) {
  const 問題 = 状態.問題;
  const 選択中 = 状態.選択中;
  const 完全一致 = 状態.答え合わせ済 && 完全一致する(選択中, 問題.正解);
  const 効果クラス =
    問題.効果 === 2 ? 'fx-super' : 問題.効果 === 0.5 ? 'fx-weak' : 'fx-none';

  return (
    <section className="screen quiz-screen">
      <div className="screen-head">
        <h1>ポケモンタイプ相性クイズ</h1>
        <button type="button" className="btn-sub" onClick={() => on操作({ 種類: 'やめる' })}>
          やめる
        </button>
      </div>

      <p className="quiz-step">こうげきする側のタイプを選ぼう</p>
      <div className="quiz-hero">
        <span className="badge quiz-hero-badge" style={{ background: タイプ色[問題.お題] }}>
          {問題.お題}
        </span>
        <p className="quiz-hero-effect">
          をこうげきして
          <span className={`effect-pill ${効果クラス}`}>
            <span className="effect-mark">{効果記号[問題.効果]}</span>
            {効果ラベル[問題.効果]}
          </span>
          のタイプは？
        </p>
      </div>
      <p className="quiz-sub">当てはまるものをすべて選ぼう（複数可）</p>

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
            aria-pressed={選択中.includes(t)}
            disabled={状態.答え合わせ済}
            onClick={() => on操作({ 種類: '選択を切り替え', タイプ: t })}
          >
            {t}
            {選択中.includes(t) && (
              <span className="checkbadge" aria-hidden>
                ✓
              </span>
            )}
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
      {選択中.length === 0 && !状態.答え合わせ済 && (
        <p className="quiz-hint">1つ以上選ぶと答え合わせできます</p>
      )}

      {状態.答え合わせ済 && (
        <div className={`feedback ${完全一致 ? 'ok' : 'ng'}`}>
          <div className="feedback-msg">{完全一致 ? '⭕ 正解！' : '❌ はずれ…'}</div>
          <div>
            <span className="badge feedback-odai" style={{ background: タイプ色[問題.お題] }}>
              {問題.お題}
            </span>
            に対して
            <span className={`effect-pill effect-sm ${効果クラス}`}>
              <span className="effect-mark">{効果記号[問題.効果]}</span>
              {効果ラベル[問題.効果]}
            </span>
            のこうげき側：
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
