---
title: "HasPartition() | Go | v2"
slug: /go/go/v2-Partition-HasPartition
sidebar_label: "HasPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检查 Collection 中是否存在 Partition。 | Go | v2"
type: docx
token: Cased8tfhoZ25Sx4VALcy4gZnbh
sidebar_position: 4
keywords: 
  - k 最近邻算法
  - ANNS
  - 向量搜索
  - knn 算法
  - zilliz
  - zilliz cloud
  - cloud
  - HasPartition()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HasPartition()

此操作检查 Collection 中是否存在 Partition。

```go
func (c *Client) HasPartition(ctx context.Context, opt HasPartitionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewHasPartitionOption(collectionName, partitionName)

result, err := client.HasPartition(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

- **partitionName** (*string*)

    要检查的 Partition 的名称。

**返回类型：**

*has bool, err error*

**返回：**

一个布尔值，用于指示资源是否存在。如果操作失败，则返回错误。

**异常：**

- **error**

    检查 `err != nil` 以了解失败详情。

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
result, err := cli.HasPartition(ctx, milvusclient.NewHasPartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}

fmt.Println(result)
```
