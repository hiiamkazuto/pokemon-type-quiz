# 良いテストと悪いテスト

## 良いテスト

**結合テスト形式**：内部パーツのモックではなく、本物のインターフェースを通じてテストします。

```typescript
// 良い例: 観察可能な振る舞いをテストしている
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

特徴：

- ユーザーや呼び出し側が関心を持つ振る舞いをテストしている
- 公開APIのみを使用している
- 内部のリファクタリングを行ってもテストが壊れない
- 「どのように」ではなく「何をするか」を記述している
- 1テストにつき論理的なアサーションが1つである

## 悪いテスト

**実装の詳細に依存したテスト**：内部構造と密結合しています。

```typescript
// 悪い例: 実装の詳細をテストしている
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

危険な兆候：

- 内部の協力オブジェクトをモック化している
- プライベートメソッドをテストしている
- 呼び出し回数や呼び出し順序を検証している
- 振る舞いが変わっていないのにリファクタリングでテストが壊れる
- テスト名が「何をするか」ではなく「どのように処理するか」を記述している
- インターフェースではなく外部の手段で直接検証している

```typescript
// 悪い例: インターフェースを迂回して直接検証している
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// 良い例: インターフェースを通じて検証している
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

**トートロジーテスト**：期待値が実装コードの計算ロジックをそのまま反復しているため、構造上必ず合格してしまいます。

```typescript
// 悪い例: コードと同じ計算方法で期待値を再計算している
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  const expected = items.reduce((sum, i) => sum + i.price, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// 良い例: 期待値が独立した既知のリテラル値である
test("calculateTotal sums line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```
