---
title: "DropPartition() | Go | v2"
slug: /go/go/v2-Partition-DropPartition
sidebar_label: "DropPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、パーティションとそのすべてのデータを完全に削除します。 | Go | v2"
type: docx
token: XnbJdLilXobGn1x1Uq6cvhKTnhf
sidebar_position: 2
keywords: 
  - 最近傍探索
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - DropPartition()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropPartition()

この操作は、パーティションとそのすべてのデータを完全に削除します。

```go
func (c *Client) DropPartition(ctx context.Context, opt DropPartitionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDropPartitionOption(collectionName, partitionName)

err := client.DropPartition(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

対象のコレクションの名前。

- **partitionName** (*string*)

削除するパーティションの名前。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細については `err != nil` を確認してください。

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

err = cli.DropPartition(ctx, milvusclient.NewDropPartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}
```
