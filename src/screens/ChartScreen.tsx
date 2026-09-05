import { useState } from 'react';
import { 全タイプ, type タイプ } from '../quiz/types';
import { 効果を参照する } from '../quiz/chart';
import { タイプ色 } from '../quiz/palette';
import { 効果記号, 効果ラベル } from '../quiz/labels';

type Props = {
  onBackToTitle: () => void;
};

/** 相性表画面: 行＝こうげき側・列＝まもる側の18×18マトリクス。公式相性表と同型（左バンド＝こうげき側・上バンド＝まもり側）。セルタップで行＋列ハイライト */
export default function ChartScreen({ onBackToTitle }: Props) {
  const [選択攻, set選択攻] = useState<タイプ | null>(null);
  const [選択守, set選択守] = useState<タイプ | null>(null);
  const 十字 = 選択攻 !== null && 選択守 !== null;
  const 選択効果 = 十字 ? 効果を参照する(選択攻, 選択守) : null;

  return (
    <section className="screen chart-screen">
      <div className="screen-head">
        <h1>相性表</h1>
        <button type="button" className="btn-sub" onClick={onBackToTitle}>
          もどる
        </button>
      </div>
      <div className="chart-wrap">
        <div className="chart-leftband">こうげき側のタイプ</div>
        <div className="chart-scroll">
          <p className="chart-topband" aria-hidden>
            まもり側のタイプ
          </p>
          <table className="chart-matrix">
            <thead>
              <tr>
                <th className="chart-corner" aria-hidden>
                  <span className="chart-corner-slash" />
                </th>
              {全タイプ.map((守) => (
                <th key={守} scope="col" className="chart-colhead" style={{ background: タイプ色[守] }}>
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
                  className="chart-rowhead"
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
                  const 効果 = 効果を参照する(攻, 守);
                  const 選択セル = 十字 && 攻 === 選択攻 && 守 === 選択守;
                  return (
                    <td
                      key={守}
                      className={[
                        効果 === 2 ? 'fx-super' : 効果 === 0.5 ? 'fx-weak' : 効果 === 0 ? 'fx-none' : 'fx-plain',
                        十字 && 守 === 選択守 ? 'pinned-col' : '',
                        選択セル ? 'pinned-cross' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        if (選択セル) {
                          set選択攻(null);
                          set選択守(null);
                        } else {
                          set選択攻(攻);
                          set選択守(守);
                        }
                      }}
                    >
                      {効果 === 1 ? '' : 効果記号[効果]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {十字 && 選択効果 !== null && (
        <p className="chart-read" role="status">
          <span className="badge" style={{ background: タイプ色[選択攻] }}>
            {選択攻}
          </span>
          <span className="chart-read-arrow">→</span>
          <span className="badge" style={{ background: タイプ色[選択守] }}>
            {選択守}
          </span>
          <span>{選択効果 === 1 ? 'こうかあり' : `${効果記号[選択効果]}${効果ラベル[選択効果]}`}</span>
        </p>
      )}

      <p className="chart-legend">
        ◎ばつぐん △いまひとつ ×こうかなし（空欄＝こうかあり）
        <br />
        セルをタップすると、こうげき側・まもる側の組合せがハイライトされます
      </p>
    </section>
  );
}
