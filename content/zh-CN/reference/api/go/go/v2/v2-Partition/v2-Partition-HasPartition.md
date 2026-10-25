---
title: "HasPartition | Go | v2"
slug: /go/go/v2-Partition-HasPartition
sidebar_label: "HasPartition"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作检查 Collection 中是否存在 Partition。 | Go | v2"
type: docx
token: Qn1ddXN3ho1R9ixA2qRcr0JanJb
sidebar_position: 4
keywords: 
  - rag 向量 Database
  - 什么是向量数据库
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - 云
  - HasPartition
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# HasPartition

此操作检查 Collection 中是否存在 Partition。

```go
func (c *Client) HasPartition(ctx context.Context, opt HasPartitionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## 请求语法\{#request-syntax}

创建 HasPartition() 的请求。

```go
option := milvusclient.NewHasPartitionOption(collectionName, partitionName)

result, err := client.HasPartition(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    目标 Collection 的名称。

- **partitionName** （*string*） -

    要检查的 Partition 名称。

**构建器方法：**

- `NewHasPartitionOption(collectionName string, partitionName string)`

    创建 HasPartition() 的请求。

**返回类型：**

*has bool, err error*

**返回：**

布尔值，指示资源是否存在。如果操作失败，则返回错误。

**参数：**

- **result** （*has bool*） -

    HasPartition() 返回的 has bool 值。

**异常：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 HasPartition() 的用法。

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
result, err := cli.HasPartition(ctx, milvusclient.NewHasPartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}

fmt.Println(result)
```
