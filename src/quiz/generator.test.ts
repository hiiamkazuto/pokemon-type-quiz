import { describe, expect, it } from 'vitest';
import { 効果のタイプを集める, 問題を生成する, 問題を作る } from './generator';
import { 効果を参照する } from './chart';
import { 全タイプ, type 問題 } from './types';
import { 乱数生成器 } from './testHelpers';

describe('問題を作る（指定したお題×効果での構成）', () => {
  it('正解は相性表の該当タイプの集合と一致する（みず×ばつぐん=でんき・くさ）', () => {
    const 問題 = 問題を作る('みず', 2, 乱数生成器(1));
    expect(new Set(問題.正解)).toEqual(new Set(['でんき', 'くさ']));
  });

  it('正解が複数のときは該当の集合と一致する（エスパー×いまひとつ=かくとう・エスパー）', () => {
    const 問題 = 問題を作る('エスパー', 0.5, 乱数生成器(2));
    expect(new Set(問題.正解)).toEqual(new Set(['かくとう', 'エスパー']));
    expect(問題.正解).toHaveLength(2);
  });

  it('該当が6個以上ある組合せでは正解が5個に制限される（はがね×いまひとつは該当10）', () => {
    expect(効果のタイプを集める('はがね', 0.5)).toHaveLength(10);
    const 問題 = 問題を作る('はがね', 0.5, 乱数生成器(3));
    expect(問題.正解).toHaveLength(5);
  });

  it('選択肢は必ず6個で、正解以外はお題にこうかありのタイプ', () => {
    const 問題 = 問題を作る('はがね', 0.5, 乱数生成器(4));
    expect(問題.選択肢).toHaveLength(6);
    const こうかあり = 効果のタイプを集める('はがね', 1);
    const 埋め = 問題.選択肢.filter((t) => !問題.正解.includes(t));
    expect(埋め).toHaveLength(1);
    for (const t of 埋め) expect(こうかあり).toContain(t);
  });

  it('正解とこうかありの埋めは重複しない', () => {
    const 問題 = 問題を作る('みず', 0.5, 乱数生成器(5));
    expect(new Set(問題.選択肢).size).toBe(6);
    for (const t of 問題.正解) expect(効果を参照する(t, 問題.お題)).toBe(問題.効果);
  });
});

describe('問題を生成する（ランダム選定・直前重複排除）', () => {
  const 乱数 = 乱数生成器(42);
  const 件数 = 500;
  const 生成: 問題[] = [];
  for (let i = 0; i < 件数; i++) 生成.push(問題を生成する(生成[i - 1], 乱数));

  it('選択肢は必ず6個・重複なし', () => {
    for (const 問題 of 生成) {
      expect(問題.選択肢).toHaveLength(6);
      expect(new Set(問題.選択肢).size).toBe(6);
    }
  });

  it('正解は1個以上5個以下で、すべて選択肢に含まれる', () => {
    for (const 問題 of 生成) {
      expect(問題.正解.length).toBeGreaterThanOrEqual(1);
      expect(問題.正解.length).toBeLessThanOrEqual(5);
      for (const t of 問題.正解) expect(問題.選択肢).toContain(t);
    }
  });

  it('正解の各タイプはお題×効果に該当する', () => {
    for (const 問題 of 生成) {
      for (const t of 問題.正解) {
        expect(効果を参照する(t, 問題.お題)).toBe(問題.効果);
      }
    }
  });

  it('選択肢のうち正解以外はすべてお題にこうかあり', () => {
    for (const 問題 of 生成) {
      const 埋め = 問題.選択肢.filter((t) => !問題.正解.includes(t));
      for (const t of 埋め) expect(効果を参照する(t, 問題.お題)).toBe(1);
    }
  });

  it('該当が6個以上ある組合せでは正解が5個に制限される', () => {
    for (const 問題 of 生成) {
      const 該当 = 効果のタイプを集める(問題.お題, 問題.効果);
      if (該当.length >= 6) expect(問題.正解).toHaveLength(5);
    }
  });

  it('直前の問題とお題×効果が重複しない', () => {
    for (let i = 1; i < 件数; i++) {
      const 前 = 生成[i - 1];
      const 次 = 生成[i];
      const 重複 = 前.お題 === 次.お題 && 前.効果 === 次.効果;
      expect(重複).toBe(false);
    }
  });

  it('お題は18タイプすべてから、効果は3種すべてから出る', () => {
    const お題 = new Set(生成.map((q) => q.お題));
    const 効果 = new Set(生成.map((q) => q.効果));
    expect(new Set(お題)).toEqual(new Set(全タイプ));
    expect([...効果].sort()).toEqual([0, 0.5, 2]);
  });

  it('該当タイプが存在しないお題×効果の組合せは出ない', () => {
    for (const 問題 of 生成) {
      expect(効果のタイプを集める(問題.お題, 問題.効果).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('正解＋こうかありで6個に届かないお題×効果は出題対象外（はがね×こうかなし）', () => {
    // はがねにこうかなしはどくのみ。こうかありは4個で埋めに足りないため出題できない
    expect(効果のタイプを集める('はがね', 0)).toEqual(['どく']);
    expect(効果のタイプを集める('はがね', 1)).toHaveLength(4);
    for (const 問題 of 生成) {
      expect(問題.お題 === 'はがね' && 問題.効果 === 0).toBe(false);
    }
  });
});
