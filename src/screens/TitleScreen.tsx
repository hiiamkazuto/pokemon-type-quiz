type Props = {
  onStart: () => void;
  onChart: () => void;
};

/** タイトル画面: アプリ名と遊び方の概要、クイズ画面・相性表画面への入り口 */
export default function TitleScreen({ onStart, onChart }: Props) {
  return (
    <section className="screen title-screen">
      <p className="logo">ポケモンタイプ相性クイズ</p>
      <p className="howto">
        守る側のお題に対して、当てはまる攻める側のタイプをすべて選んで「答え合わせ」。
        <br />
        正解は複数あることがあります（完全一致で正解）。
      </p>
      <button type="button" className="btn-primary" onClick={onStart}>
        ▶ スタート
      </button>
      <button type="button" className="btn-sub title-chart-btn" onClick={onChart}>
        相性表をみる
      </button>
    </section>
  );
}
