---
title: "QueryIterator | Go | v2"
slug: /go/go/v2-Vector-QueryIterator
sidebar_label: "QueryIterator"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、コレクションから一致するエンティティをバッチ単位で取得するクエリイテレーターを作成します。結果セットが大きく、一度にすべてをメモリに読み込むべきでない場合に使用します。 | Go | v2"
type: docx
token: AGM3dTL6Vorr6XxS3IjcBAbBnVg
sidebar_position: 14
keywords: 
  - 次元削減
  - hnsw アルゴリズム
  - ベクトル類似検索
  - 近似最近傍探索
  - zilliz
  - Zilliz Cloud
  - クラウド
  - QueryIterator
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# QueryIterator

この操作では、コレクションから一致するエンティティをバッチ単位で取得するクエリイテレーターを作成します。結果セットが大きく、一度にすべてをメモリに読み込むべきでない場合に使用します。

```go
func (c *Client) QueryIterator(ctx context.Context, option QueryIteratorOption, callOptions ...grpc.CallOption) (QueryIterator, error)
```

## リクエスト構文\{#request-syntax}

QueryIterator() のリクエストを作成します。

```go
client.QueryIterator(ctx, milvusclient.NewQueryIteratorOption(collectionName).
    WithBatchSize(batchSize).
    WithPartitions(partitionNames...).
    WithFilter(expr).
    WithOutputFields(fieldNames...).
    WithConsistencyLevel(consistencyLevel).
    WithIteratorLimit(limit),
)
```

**パラメーター：**

- **collectionName** (*string*) -

    **[必須]**

    クエリ対象のコレクションの名前です。

**ビルダーメソッド：**

- `NewQueryIteratorOption(collectionName string)`

    指定したコレクションの新しいクエリイテレーターオプションを作成します。

- `WithBatchSize(batchSize int)`

    反復バッチごとに返すエンティティの数です。デフォルト：`1000`。

- `WithPartitions(partitionNames ...string)`

    クエリ対象のパーティションです。指定しない場合は、すべてのパーティションがクエリされます。

- `WithNamespace(namespace string)`

    クエリイテレーターのスコープをコレクションの名前空間に限定します。

- `WithFilter(expr string)`

    エンティティをフィルタリングするブール式です。式に一致するエンティティのみが返されます。

- `WithOutputFields(fieldNames ...string)`

    返されるエンティティに含めるフィールドです。指定しない場合は、プライマリキーフィールドのみが返されます。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`

    クエリの整合性レベルです。デフォルト：`Bounded`。

- `WithIteratorLimit(limit int64)`

    反復処理するエンティティの最大合計数です。負の値は無制限を意味します。デフォルト：`Unlimited`（-1）。

**戻り値の型：**

&ast;*QueryIterator, error*

**戻り値：**

*QueryIterator, error* QueryIterator インターフェースは、クエリ結果へのページ単位のアクセスを提供します。`io.EOF` が返されるまで `Next()` を繰り返し呼び出します。

**パラメーター：**

- **result** (&ast;*QueryIterator*) -

    QueryIterator() によって返される &ast;QueryIterator 値です。

**エラーハンドリング：**

- **error**

    操作が失敗します。指定したコレクションが存在しない場合、パラメーターが無効な場合、またはサーバーに到達できない場合です。

## 例\{#example}

QueryIterator() の使用例を示します。

```go
import (
    "context"
    "fmt"
    "io"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

iter, err := client.QueryIterator(ctx,
    milvusclient.NewQueryIteratorOption("my_collection").
        WithBatchSize(500).
        WithFilter("age > 18").
        WithOutputFields("name", "age"),
)
if err != nil {
    log.Fatal(err)
}

for {
    rs, err := iter.Next(ctx)
    if err == io.EOF {
        break
    }
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Got %d results\n", rs.Len())
}
```
