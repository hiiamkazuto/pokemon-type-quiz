import { 効果を参照する, type 倍率 } from './chart';
import { 全タイプ, type 効果, type 問題, type タイプ } from './types';

/** 問われる効果の種類。こうかあり（1倍）は出題対象外 */
const 出題対象効果: readonly 効果[] = [2, 0.5, 0];

/** お題（守る側）に対して、その効果に該当する攻める側のタイプをすべて集める */
export function 効果のタイプを集める(お題: タイプ, 効果値: 倍率): タイプ[] {
  return 全タイプ.filter((t) => 効果を参照する(t, お題) === 効果値);
}

/** 指定したお題×効果で選択肢6個の問題を構成する。該当が6個以上ある場合は5個に制限し、残りをお題にこうかありのタイプで埋める */
export function 問題を作る(お題: タイプ, 効果値: 効果, 乱数: () => number = Math.random): 問題 {
  const 正解 = シャッフル(効果のタイプを集める(お題, 効果値), 乱数).slice(0, 5);
  const 選択肢 = [...正解];
  for (const t of シャッフル(効果のタイプを集める(お題, 1), 乱数)) {
    if (選択肢.length >= 6) break;
    選択肢.push(t);
  }
  return { お題, 効果: 効果値, 正解, 選択肢: シャッフル(選択肢, 乱数) };
}

/** お題×効果の問題が構成できるか。該当が1個以上かつ、正解5個制限後にこうかありのタイプで6個に埋められること */
function 出題できるか(お題: タイプ, 効果値: 効果): boolean {
  const 該当 = 効果のタイプを集める(お題, 効果値);
  if (該当.length === 0) return false;
  const 埋めに必要な数 = 6 - Math.min(該当.length, 5);
  return 効果のタイプを集める(お題, 1).length >= 埋めに必要な数;
}

/** お題・効果をランダムに選んで問題を作る。直前の問題とお題×効果が重複する組合せは取り直す */
export function 問題を生成する(直前?: 問題, 乱数: () => number = Math.random): 問題 {
  while (true) {
    const お題 = 選ぶ(全タイプ, 乱数);
    const 効果値 = 選ぶ(出題対象効果.filter((e) => 出題できるか(お題, e)), 乱数);
    const 問題 = 問題を作る(お題, 効果値, 乱数);
    if (!直前 || 直前.お題 !== 問題.お題 || 直前.効果 !== 問題.効果) return 問題;
  }
}

function 選ぶ<T>(配列: readonly T[], 乱数: () => number): T {
  return 配列[Math.floor(乱数() * 配列.length)];
}

function シャッフル<T>(配列: readonly T[], 乱数: () => number): T[] {
  const 結果 = [...配列];
  for (let i = 結果.length - 1; i > 0; i--) {
    const j = Math.floor(乱数() * (i + 1));
    [結果[i], 結果[j]] = [結果[j], 結果[i]];
  }
  return 結果;
}
