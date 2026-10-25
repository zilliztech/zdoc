---
title: "DropPartition | Go | v2"
slug: /go/go/v2-Partition-DropPartition
sidebar_label: "DropPartition"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、パーティションとそのすべてのデータを完全に削除します。 | Go | v2"
type: docx
token: FYzrd2bUkosyWexZwKpcWp8znLC
sidebar_position: 2
keywords: 
  - 画像検索
  - LLMs
  - 機械学習
  - RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - DropPartition
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropPartition

この操作では、パーティションとそのすべてのデータを完全に削除します。

```go
func (c *Client) DropPartition(ctx context.Context, opt DropPartitionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropPartition() のリクエストを作成します。

```go
option := milvusclient.NewDropPartitionOption(collectionName, partitionName)

err := client.DropPartition(ctx, option)
```

**パラメーター:**

- **collectionName**（*string*） -

    対象コレクションの名前です。

- **partitionName**（*string*） -

    削除するパーティションの名前です。

**ビルダーメソッド:**

- `NewDropPartitionOption(collectionName string, partitionName string)`

    DropPartition() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DropPartition() の使用方法を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

err = cli.DropPartition(ctx, milvusclient.NewDropPartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}
```
