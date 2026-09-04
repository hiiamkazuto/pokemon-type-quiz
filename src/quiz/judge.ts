import type { タイプ } from './types';

/** 選んだ選択肢の集合が、該当タイプの集合と完全一致するか。順不同は等しく扱い、該当が一部のみ・選択の不足・過剰選択はすべて不一致 */
export function 完全一致する(選んだ: タイプ[], 該当: タイプ[]): boolean {
  if (選んだ.length !== 該当.length) return false;
  return 選んだ.every((t) => 該当.includes(t));
}
