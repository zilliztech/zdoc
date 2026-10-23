---
title: "GetPartitionStats | Go | v2"
slug: /go/go/v2-Partition-GetPartitionStats
sidebar_label: "GetPartitionStats"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回指定 Partition 的统计信息，例如行数。 | Go | v2"
type: docx
token: A8PWdL2x4oQcVXxq6aNc3AAwnEh
sidebar_position: 3
keywords: 
  - LLM 评估
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetPartitionStats
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetPartitionStats

此操作返回指定 Partition 的统计信息，例如行数。

```go
func (c *Client) GetPartitionStats(ctx context.Context, opt GetPartitionStatsOption, callOptions ...grpc.CallOption) (map[string]string, error)
```

## 请求语法\{#request-syntax}

创建 GetPartitionStats() 的请求。

```go
option := milvusclient.NewGetPartitionStatsOption(collectionName, partitionName)

result, err := client.GetPartitionStats(ctx, option)
```

**参数：**

- **collectionName**（*string*） -

    目标 Collection 的名称。

- **partitionName**（*string*） -

    要删除的 Partition 的名称。

**构建器方法：**

- `NewGetPartitionStatsOption(collectionName string, partitionName string)`

    创建用于获取 Partition 统计信息的选项。`collectionName` 指定 Collection，`partitionName` 指定 Partition。

**返回类型：**

*map[string]string, error*

**返回值：**

Partition 统计信息键值对的映射。如果操作失败，则返回错误。

**参数：**

- **result**（*map[string]string*） -

    Partition 统计信息键值对。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 GetPartitionStats() 的用法。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

result, err := cli.GetPartitionStats(ctx, milvusclient.NewGetPartitionStatsOption("books", "chunk_1"))
if err != nil {
	// handle error
}
fmt.Println(result)
```
