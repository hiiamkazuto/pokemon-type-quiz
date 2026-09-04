type Props = {
  onStart: () => void;
};

/** タイトル画面: アプリ名と遊び方の概要、クイズ画面への入り口 */
export default function TitleScreen({ onStart }: Props) {
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
    </section>
  );
}
