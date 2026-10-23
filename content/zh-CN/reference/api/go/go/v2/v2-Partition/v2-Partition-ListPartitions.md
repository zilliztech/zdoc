---
title: "ListPartitions | Go | v2"
slug: /go/go/v2-Partition-ListPartitions
sidebar_label: "ListPartitions"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出 Collection 中的所有 Partition。 | Go | v2"
type: docx
token: YMkedZlN9ozHlVx28ERcGYzEn6f
sidebar_position: 5
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListPartitions
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListPartitions

此操作会列出 Collection 中的所有 Partition。

```go
func (c *Client) ListPartitions(ctx context.Context, opt ListPartitionsOption, callOptions ...grpc.CallOption) (partitionNames []string, err error)
```

## 请求语法\{#request-syntax}

创建 ListPartitions() 的请求。

```go
option := milvusclient.NewListPartitionOption(collectionName)

result, err := client.ListPartitions(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    目标 Collection 的名称。

**构建器方法：**

- `NewListPartitionOption(collectionName string)`

    创建 ListPartitions() 的请求。

**返回类型：**

*partitionNames []string, err error*

**返回：**

名称列表。如果操作失败，则返回错误。

**参数：**

- **result** （*partitionNames []string*） -

    ListPartitions() 返回的 partitionNames []string 值。

**异常处理：**

- **error**

    操作失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 ListPartitions() 的用法。

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

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(partitionNames)
```
