---
title: "CreatePartition() | Go | v2"
slug: /go/go/v2-Partition-CreatePartition
sidebar_label: "CreatePartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在 Collection 中创建一个新的 Partition，用于组织数据。 | Go | v2"
type: docx
token: Pp0KdUrYGoX4PbxXNFvczjePn4f
sidebar_position: 1
keywords: 
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量 db
  - 什么是向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - CreatePartition()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreatePartition()

此操作会在 Collection 中创建一个新的 Partition，用于组织数据。

```go
func (c *Client) CreatePartition(ctx context.Context, opt CreatePartitionOption, callOptions ...grpc.CallOption) error
```

**返回类型：**

*error*

**返回值：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

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
