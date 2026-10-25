---
title: "TruncateCollection | Go | v2"
slug: /go/go/v2-Collection-TruncateCollection
sidebar_label: "TruncateCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスキーマを保持したまま、コレクションからすべてのデータを削除します。 | Go | v2"
type: docx
token: CNcvdxPmgo6P3nx6t1tcW4R6nXf
sidebar_position: 25
keywords: 
  - 類似性検索
  - マルチモーダル RAG
  - LLM のハルシネーション
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - cloud
  - TruncateCollection
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# TruncateCollection

この操作は、コレクションのスキーマを保持したまま、コレクションからすべてのデータを削除します。

```go
func (c *Client) TruncateCollection(ctx context.Context, option TruncateCollectionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

TruncateCollection() のリクエストを作成します。

```go
option := milvusclient.NewTruncateCollectionOption(collectionName)

err := client.TruncateCollection(ctx, option)
```

**パラメーター:**

- **name** (*string*) -

    **[必須]**

    作成するコレクションの名前です。

**ビルダーメソッド:**

- `NewTruncateCollectionOption(name string)`

    コレクションを Truncate するためのオプションを作成します。`name` は Truncate するコレクションを指定します。

**戻り値の型:**

*error*

**戻り値:**

コレクションの Truncate が完了すると nil を返します。操作が失敗した場合はエラーを返します。

**エラーハンドリング:**

- **error**

    操作が失敗します。リクエストの構築または RPC が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

TruncateCollection() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.TruncateCollection(ctx, milvusclient.NewTruncateCollectionOption("books"))
if err != nil {
	// handle error
}
```
