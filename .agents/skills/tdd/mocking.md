# モックを使用するタイミング

モック化は**システムの境界**でのみ行います：

- 外部API（決済、メール送信など）
- データベース（場合による — テスト用DBの使用を優先）
- 時間や乱数
- ファイルシステム（場合による）

モック化してはいけない対象：

- 自作のクラスやモジュール
- 内部の協力オブジェクト
- 自身でコントロール可能なあらゆるもの

## モックしやすい設計

システム境界では、モック化しやすいインターフェースを設計します：

**1. 依存性の注入を利用する**

外部依存オブジェクトは内部で生成するのではなく、外部から引数として渡します：

```typescript
// モック化しやすい
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// モック化しにくい
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. 汎用フェッチャーよりもSDK形式のインターフェースを優先する**

条件分岐を含む単一の汎用関数を作るのではなく、個別の外部操作ごとに専用の関数を作成します：

```typescript
// 良い例: 各関数を個別にモック化可能
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// 悪い例: モックの内部で条件分岐ロジックが必要になる
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

SDK形式のインターフェースがもたらす利点：
- 各モックが特定のデータ構造を1つだけ返す
- テストのセットアップに条件分岐ロジックが不要
- テストがどのエンドポイントを利用しているかが一目でわかる
- エンドポイントごとの型安全性の確保
