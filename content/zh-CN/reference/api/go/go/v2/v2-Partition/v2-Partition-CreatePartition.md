---
title: "CreatePartition | Go | v2"
slug: /go/go/v2-Partition-CreatePartition
sidebar_label: "CreatePartition"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在 Collection 中创建一个新的 Partition，用于组织数据。 | Go | v2"
type: docx
token: J1U2dUEpqo8RiBxWNKZctY72nZs
sidebar_position: 1
keywords: 
  - LLM 评估
  - 混合向量搜索
  - 视频去重
  - 视频相似度搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - CreatePartition
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreatePartition

此操作会在 Collection 中创建一个新的 Partition，用于组织数据。

```go
func (c *Client) CreatePartition(ctx context.Context, opt CreatePartitionOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 CreatePartition() 创建请求。

```go
option := milvusclient.NewCreatePartitionOption("quick_setup", "partitionA")

 := client.CreatePartition(ctx, option)
```

**构建器方法：**

- `NewCreatePartitionOption(collectionName string, partitionName string)`

    为 CreatePartition() 创建请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil；否则，返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 CreatePartition() 的用法。

```go
import (
	"context"
	"fmt"

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
