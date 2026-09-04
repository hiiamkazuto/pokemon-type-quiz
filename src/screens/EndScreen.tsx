type Props = {
  onBackToTitle: () => void;
};

/** 終了画面: 挨拶のみ。endlessモードのため実績値は表示しない */
export default function EndScreen({ onBackToTitle }: Props) {
  return (
    <section className="screen end-screen">
      <h1>おつかれさまでした！</h1>
      <button type="button" className="btn-sub" onClick={onBackToTitle}>
        タイトルへもどる
      </button>
    </section>
  );
}
