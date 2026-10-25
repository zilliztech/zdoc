---
title: "ReleasePartitions | Go | v2"
slug: /go/go/v2-Management-ReleasePartitions
sidebar_label: "ReleasePartitions"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、メモリにロードされた1つ以上のパーティションを解放します。 | Go | v2"
type: docx
token: YIQXdQUHwovep5xVGz2cgusdnXe
sidebar_position: 24
keywords: 
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - スパースベクトル
  - zilliz
  - zilliz cloud
  - cloud
  - ReleasePartitions
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ReleasePartitions

この操作は、メモリにロードされた1つ以上のパーティションを解放します。

```go
func (c *Client) ReleasePartitions(ctx context.Context, option ReleasePartitionsOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

ReleasePartitions() のリクエストを作成します。

```go
option := milvusclient.NewReleasePartitionsOptions(collectionName, partitionNames...)

err := client.ReleasePartitions(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    対象のコレクションの名前です。

- **partitionNames** (*...string*) -

    **[REQUIRED]**

    パーティションの名前です。

**BUILDER METHODS:**

- `NewReleasePartitionsOptions(collectionName string, partitionNames ...string)`

    パーティションを解放するためのオプションを作成します。`collectionName` はコレクションを指定し、`partitionNames` は解放するパーティションを列挙します。

**RETURN TYPE:**

*error*

**RETURNS:**

パーティションが解放された後に nil を返します。操作に失敗した場合はエラーを返します。

**ERROR HANDLING:**

- **error**

    操作が失敗します。リクエストの構築または RPC が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

ReleasePartitions() の使用方法を示します。

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

err = cli.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("books", "chunk_1", "chunk_2"))
if err != nil {
	// handle error
}
```
