---
title: "ReleasePartitions() | Go | v2"
slug: /go/go/v2-Management-ReleasePartitions
sidebar_label: "ReleasePartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のパーティションをメモリから解放します。 | Go | v2"
type: docx
token: BcAVdlDIioMUXTxqyZkcXfqznKd
sidebar_position: 25
keywords: 
  - Zilliz ベクトル データベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - ReleasePartitions()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ReleasePartitions()

この操作は、特定のパーティションをメモリから解放します。

```go
func (c *Client) ReleasePartitions(ctx context.Context, option ReleasePartitionsOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewReleasePartitionsOption(collectionName, partitionNames)

err := client.ReleasePartitions(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

- **partitionNames** (*...string*)

    パーティションの名前。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil、失敗した場合は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

err = cli.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("quick_setup", "partitionA"))
if err != nil {
	// handle error
}
```
