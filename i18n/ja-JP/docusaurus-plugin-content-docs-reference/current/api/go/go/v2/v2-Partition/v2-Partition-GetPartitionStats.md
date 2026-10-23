---
title: "GetPartitionStats | Go | v2"
slug: /go/go/v2-Partition-GetPartitionStats
sidebar_label: "GetPartitionStats"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、パーティションの行数などの統計情報を返します。 | Go | v2"
type: docx
token: A8PWdL2x4oQcVXxq6aNc3AAwnEh
sidebar_position: 3
keywords: 
  - LLM 評価
  - スパースベクトルと密ベクトル
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - GetPartitionStats
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetPartitionStats

この操作は、パーティションの行数などの統計情報を返します。

```go
func (c *Client) GetPartitionStats(ctx context.Context, opt GetPartitionStatsOption, callOptions ...grpc.CallOption) (map[string]string, error)
```

## リクエスト構文\{#request-syntax}

GetPartitionStats() のリクエストを作成します。

```go
option := milvusclient.NewGetPartitionStatsOption(collectionName, partitionName)

result, err := client.GetPartitionStats(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    対象コレクションの名前です。

- **partitionName** (*string*) -

    削除するパーティションの名前です。

**ビルダーメソッド:**

- `NewGetPartitionStatsOption(collectionName string, partitionName string)`

    パーティションの統計情報を取得するためのオプションを作成します。`collectionName` はコレクションを指定し、`partitionName` はパーティションを指定します。

**戻り値の型:**

*map[string]string, error*

**戻り値:**

パーティションの統計情報のキーと値のペアからなるマップです。操作が失敗した場合は、エラーを返します。

**パラメーター:**

- **result** (*map[string]string*) -

    パーティションの統計情報のキーと値のペアです。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

GetPartitionStats() の使用例を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

result, err := cli.GetPartitionStats(ctx, milvusclient.NewGetPartitionStatsOption("books", "chunk_1"))
if err != nil {
	// handle error
}
fmt.Println(result)
```
