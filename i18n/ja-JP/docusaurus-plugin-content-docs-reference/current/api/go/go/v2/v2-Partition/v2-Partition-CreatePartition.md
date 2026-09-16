---
title: "CreatePartition() | Go | v2"
slug: /go/go/v2-Partition-CreatePartition
sidebar_label: "CreatePartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、データを整理するためにコレクション内に新しいパーティションを作成します。 | Go | v2"
type: docx
token: Pp0KdUrYGoX4PbxXNFvczjePn4f
sidebar_position: 1
keywords: 
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトルデータベースとは
  - ベクトルデータベースにはどのようなものがあるか
  - zilliz
  - zilliz cloud
  - cloud
  - CreatePartition()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreatePartition()

この操作は、データを整理するためにコレクション内に新しいパーティションを作成します。

```go
func (c *Client) CreatePartition(ctx context.Context, opt CreatePartitionOption, callOptions ...grpc.CallOption) error
```

**戻り値の型:**

*error*

**戻り値:**

成功時には nil を返し、失敗時には問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"

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

err = cli.CreatePartition(ctx, milvusclient.NewCreatePartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(partitionNames)
```
