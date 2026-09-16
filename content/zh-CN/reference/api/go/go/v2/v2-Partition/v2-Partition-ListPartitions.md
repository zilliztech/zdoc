---
title: "ListPartitions() | Go | v2"
slug: /go/go/v2-Partition-ListPartitions
sidebar_label: "ListPartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出 Collection 中的所有 Partition。 | Go | v2"
type: docx
token: ZNvXd7eldozvRHxpHOcc5CPAnug
sidebar_position: 5
keywords: 
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - AI 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - ListPartitions()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListPartitions()

此操作会列出 Collection 中的所有 Partition。

```go
func (c *Client) ListPartitions(ctx context.Context, opt ListPartitionsOption, callOptions ...grpc.CallOption) (partitionNames []string, err error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewListPartitionOption(collectionName)

result, err := client.ListPartitions(ctx, option)
```

**参数：**

- **collectionName** (*string*)

目标 Collection 的名称。

**返回类型：**

*partitionNames []string, err error*

**返回：**

名称列表。如果操作失败，则返回错误。

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

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(partitionNames)
```
