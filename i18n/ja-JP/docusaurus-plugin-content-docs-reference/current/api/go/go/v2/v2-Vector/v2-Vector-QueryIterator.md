---
title: "QueryIterator() | Go | v2"
slug: /go/go/v2-Vector-QueryIterator
sidebar_label: "QueryIterator()"
beta: false
added_since: v2.6.x
last_modified: v2.6.2
deprecate_since: false
notebook: false
description: "この操作は、collection から一致するエンティティをバッチ単位で取得するクエリイテレータを作成します。一度にメモリへすべて読み込むべきではない大規模な結果セットに使用してください。 | Go | v2"
type: docx
token: GLdddi5uboT02bxj6cdc1FG2nvd
sidebar_position: 14
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - QueryIterator()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# QueryIterator()

この操作は、collection から一致するエンティティをバッチ単位で取得するクエリイテレータを作成します。一度にメモリへすべて読み込むべきではない大規模な結果セットに使用してください。

```go
func (c *Client) QueryIterator(ctx context.Context, option QueryIteratorOption, callOptions ...grpc.CallOption) (QueryIterator, error)
```

## Request Syntax\{#request-syntax}

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

**OPTION METHODS:**

- `NewQueryIteratorOption(collectionName string)` -

    **[必須]**

    指定した collection の新しいクエリイテレータオプションを作成します。

- `WithBatchSize(batchSize int)` -

    反復ごとの各バッチで返すエンティティ数です。デフォルト: `1000`。

- `WithPartitions(partitionNames ...string)` -

    クエリ対象の partition です。指定しない場合は、すべての partition がクエリされます。

- `WithFilter(expr string)` -

    エンティティをフィルタリングするためのブール式です。式に一致するエンティティのみが返されます。

- `WithOutputFields(fieldNames ...string)` -

    返されるエンティティに含めるフィールドです。指定しない場合は、主キー フィールドのみが返されます。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)` -

    クエリの整合性レベルです。デフォルト: `Bounded`。

- `WithIteratorLimit(limit int64)` -

    反復処理するエンティティの合計最大数です。負の値は無制限を意味します。デフォルト: `Unlimited` (-1)。

**RETURNS:**

*QueryIterator, error*

QueryIterator インターフェースは、クエリ結果へのページネーション付きアクセスを提供します。`io.EOF` が返されるまで `Next()` を繰り返し呼び出してください。

**EXCEPTIONS:**

- **error** - 指定した collection が存在しない、パラメータが無効、またはサーバーに到達できません。

## Example\{#example}

```go
import (
    "context"
    "fmt"
    "io"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
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

## QueryIterator\{#queryiterator}

`QueryIterator()` メソッドによって返される QueryIterator インターフェースです。これには 1 つのメソッドがあります。

- `Next(ctx context.Context)` -

    次のクエリ結果バッチを `ResultSet` として返します。すべての結果が消費されると、エラーとして `io.EOF` を返します。
