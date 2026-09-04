export type タイプ = string;

export type 効果 = 2 | 0.5 | 0;

export type 問題 = {
  お題: タイプ;
  効果: 効果;
  正解: タイプ[];
  選択肢: タイプ[];
};

export type 画面状態 =
  | 'タイトル画面'
  | { クイズ画面: { 問題: 問題; 選択中: タイプ[]; 答え合わせ済: boolean } }
  | '終了画面';
