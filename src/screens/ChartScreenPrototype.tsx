// PROTOTYPE（使い捨て・テストなし）: 新規「相性表画面」の3バリアントを `?variant=` で切り替え検証する。
// 前提: GLOSSARY未コミット定義「タイトル画面からのみ入り、もどってタイトル画面へ戻る」に従い、
// 「もどる」ボタンはスタブ（遷移なし）・状態はメモリのみ。本番反映時は書き直して取り込むこと。
import { useState } from 'react';
import { 全タイプ, type タイプ } from '../quiz/types';
import { 効果を参照する, type 倍率 } from '../quiz/chart';
import { タイプ色 } from '../quiz/palette';
import { 効果記号, 効果ラベル } from '../quiz/labels';
import PrototypeSwitcher from '../components/PrototypeSwitcher';
import './ChartScreenPrototype.css';

const VARIANTS = [
  { key: 'A', 名前: 'フルマトリクス表' },
  { key: 'B', 名前: 'お題から調べる' },
  { key: 'C', 名前: '効果から探す' },
];

function variantキー(): string | null {
  const v = new URLSearchParams(window.location.search).get('variant');
  return VARIANTS.some((x) => x.key === v) ? v! : null;
}

function URLを変える(key: string | null) {
  const url = new URL(window.location.href);
  if (key === null) url.searchParams.delete('variant');
  else url.searchParams.set('variant', key);
  window.history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function バッジ({ t }: { t: タイプ }) {
  return (
    <span className="badge chart-proto-badge" style={{ background: タイプ色[t] }}>
      {t}
    </span>
  );
}

/** A: 18×18フルマトリクス。行=攻める側・列=守る側。セルをタップすると行＋列をハイライトして組合せを読み上げる */
function VariantA() {
  const [選択攻, set選択攻] = useState<タイプ | null>(null);
  const [選択守, set選択守] = useState<タイプ | null>(null);
  const 十字 = 選択攻 !== null && 選択守 !== null;
  const 選択効果 = 十字 ? 効果を参照する(選択攻, 選択守) : null;
  return (
    <section className="screen chart-proto">
      <h1>相性表</h1>
      <p className="chart-proto-note">行＝こうげき側 ／ 列＝まもる側</p>
      <div className="chart-proto-scroll">
        <table className="chart-proto-matrix">
          <thead>
            <tr>
              <th className="chart-proto-corner" title="行＝こうげき側／列＝まもる側">
                <span className="chart-proto-corner-inner">
                  <span className="corner-def">守</span>
                  <span className="corner-atk">攻</span>
                </span>
              </th>
              {全タイプ.map((守) => (
                <th key={守} scope="col" className="chart-proto-colhead" style={{ background: タイプ色[守] }}>
                  {守}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {全タイプ.map((攻) => (
              <tr key={攻} className={攻 === 選択攻 ? 'pinned' : ''}>
                <th
                  scope="row"
                  className="chart-proto-rowhead"
                  style={{ background: タイプ色[攻] }}
                  aria-pressed={攻 === 選択攻}
                  onClick={() => {
                    set選択攻(選択攻 === 攻 ? null : 攻);
                    set選択守(null);
                  }}
                >
                  {攻}
                </th>
                {全タイプ.map((守) => {
                  const b = 効果を参照する(攻, 守);
                  const is選択セル = 十字 && 攻 === 選択攻 && 守 === 選択守;
                  return (
                    <td
                      key={守}
                      className={[
                        b === 1 ? 'is-plain' : b === 2 ? 'is-super' : b === 0.5 ? 'is-weak' : 'is-none',
                        十字 && 守 === 選択守 ? 'pinned-col' : '',
                        is選択セル ? 'pinned-cross' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        if (is選択セル) {
                          set選択攻(null);
                          set選択守(null);
                        } else {
                          set選択攻(攻);
                          set選択守(守);
                        }
                      }}
                    >
                      {b === 1 ? '' : 効果記号[b as 2 | 0.5 | 0]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {十字 && 選択効果 !== null && (
        <p className="chart-proto-read">
          <バッジ t={選択攻} />
          <span className="chart-proto-arrow">→</span>
          <バッジ t={選択守} />
          <span>
            {選択効果 === 1 ? 'こうかあり' : `${効果記号[選択効果]}${効果ラベル[選択効果]}`}
          </span>
        </p>
      )}
      <p className="chart-proto-legend">
        ◎ばつぐん △いまひとつ ×こうかなし（空欄＝こうかあり）
        <br />
        セルをタップすると、こうげき側・まもる側の組合せがハイライトされます
      </p>
      <button type="button" className="btn-sub" onClick={() => URLを変える(null)}>
        もどる
      </button>
    </section>
  );
}

const 効果順: 倍率[] = [2, 0.5, 0, 1];

/** B: 守る側（お題）を1つ選ぶ→攻める側を効果別4グループに分類表示。クイズのお題視点 */
function VariantB() {
  const [守る側, set守る側] = useState<タイプ>('エスパー');
  return (
    <section className="screen chart-proto">
      <h1>相性表</h1>
      <p className="chart-proto-note">まもる側を選ぶと、こうげき側が効果別にわかる</p>
      <div className="chart-proto-picker">
        {全タイプ.map((t) => (
          <button
            key={t}
            type="button"
            className={t === 守る側 ? 'picked' : ''}
            style={{ background: タイプ色[t] }}
            aria-pressed={t === 守る側}
            onClick={() => set守る側(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="chart-proto-current">
        <バッジ t={守る側} />
        <span>をこうげきすると…</span>
      </div>
      {効果順.map((b) => (
        <div key={b} className="chart-proto-group">
          <h2>
            {b === 1 ? '― こうかあり' : `${効果記号[b as 2 | 0.5 | 0]}${効果ラベル[b as 2 | 0.5 | 0]}`}
          </h2>
          <div className="chart-proto-badges">
            {全タイプ.filter((攻) => 効果を参照する(攻, 守る側) === b).map((攻) => (
              <バッジ key={攻} t={攻} />
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="btn-sub" onClick={() => URLを変える(null)}>
        もどる
      </button>
    </section>
  );
}

/** C: 効果タブ（◎△×）→その効果になる攻め→守りペアを一覧。図鑑引き・逆引き視点 */
function VariantC() {
  const [効果, set効果] = useState<2 | 0.5 | 0>(2);
  const 行ごと = 全タイプ.map((攻) => ({
    攻,
    守り: 全タイプ.filter((守) => 効果を参照する(攻, 守) === 効果),
  })).filter((r) => r.守り.length > 0);
  const 件数 = 行ごと.reduce((n, r) => n + r.守り.length, 0);
  return (
    <section className="screen chart-proto">
      <h1>相性表</h1>
      <div className="chart-proto-tabs" role="tablist">
        {([2, 0.5, 0] as const).map((b) => (
          <button
            key={b}
            type="button"
            role="tab"
            aria-selected={b === 効果}
            className={b === 効果 ? 'picked' : ''}
            onClick={() => set効果(b)}
          >
            {効果記号[b]}
            {効果ラベル[b]}
          </button>
        ))}
      </div>
      <p className="chart-proto-note">
        {効果記号[効果]}
        {効果ラベル[効果]}になる組み合わせ（全{件数}通り）
      </p>
      <ul className="chart-proto-pairs">
        {行ごと.map((r) => (
          <li key={r.攻}>
            <バッジ t={r.攻} />
            <span className="chart-proto-arrow">→</span>
            <span className="chart-proto-badges">
              {r.守り.map((守) => (
                <バッジ key={守} t={守} />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-sub" onClick={() => URLを変える(null)}>
        もどる
      </button>
    </section>
  );
}

/** タイトル画面もどき: 本番タイトル画面＋相性表ボタン追加の見えを検証するスタブ */
function ProtoTitle() {
  return (
    <section className="screen title-screen">
      <p className="logo">ポケモンタイプ相性クイズ</p>
      <p className="howto">
        守る側のお題に対して、当てはまる攻める側のタイプをすべて選んで「答え合わせ」。
        <br />
        正解は複数あることがあります（完全一致で正解）。
      </p>
      <button type="button" className="btn-primary" onClick={() => {}}>
        ▶ スタート
      </button>
      <button type="button" className="btn-sub chart-proto-titlebtn" onClick={() => URLを変える('A')}>
        相性表をみる
      </button>
    </section>
  );
}

export default function ChartScreenPrototype() {
  const [, force] = useState(0);
  const key = variantキー();
  // PrototypeSwitcher の履歴書き換えに追従するための最小限の再描画
  if (typeof window !== 'undefined' && !(window as unknown as { __protoPop?: boolean }).__protoPop) {
    (window as unknown as { __protoPop?: boolean }).__protoPop = true;
    window.addEventListener('popstate', () => force((n) => n + 1));
  }
  return (
    <div className="chart-proto-root">
      {key === null ? (
        <>
          <p className="chart-proto-stamp">PROTOTYPE — タイトル画面に相性表ボタンを追加した想定</p>
          <ProtoTitle />
        </>
      ) : (
        <>
          <p className="chart-proto-stamp">PROTOTYPE — {VARIANTS.find((v) => v.key === key)?.名前}</p>
          {key === 'A' && <VariantA />}
          {key === 'B' && <VariantB />}
          {key === 'C' && <VariantC />}
          <p className="chart-proto-state">状態: variant={key}（メモリのみ・永続化なし・テストなし）</p>
          <PrototypeSwitcher variants={VARIANTS} current={key} />
        </>
      )}
    </div>
  );
}
