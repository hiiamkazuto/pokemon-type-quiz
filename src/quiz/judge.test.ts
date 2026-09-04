import { describe, expect, it } from 'vitest';
import { 完全一致する } from './judge';
import type { タイプ } from './types';

describe('答え合わせ（完全一致）', () => {
  const 該当: タイプ[] = ['でんき', 'くさ'];

  it('選んだ集合が該当と完全に等しければ一致（順不同でも等しい）', () => {
    expect(完全一致する(['でんき', 'くさ'], 該当)).toBe(true);
    expect(完全一致する(['くさ', 'でんき'], 該当)).toBe(true);
  });

  it('該当が一部のみだと不一致', () => {
    expect(完全一致する(['でんき'], 該当)).toBe(false);
  });

  it('過剰選択は不一致', () => {
    expect(完全一致する(['でんき', 'くさ', 'ほのお'], 該当)).toBe(false);
  });

  it('欠落は不一致', () => {
    expect(完全一致する(['くさ'], 該当)).toBe(false);
  });

  it('同じ個数でも内容が違えば不一致', () => {
    expect(完全一致する(['でんき', 'ほのお'], 該当)).toBe(false);
  });

  it('空どうしは一致とみなす', () => {
    expect(完全一致する([], [])).toBe(true);
  });
});
