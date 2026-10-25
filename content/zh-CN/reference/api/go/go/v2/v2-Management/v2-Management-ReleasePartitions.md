---
title: "ReleasePartitions | Go | v2"
slug: /go/go/v2-Management-ReleasePartitions
sidebar_label: "ReleasePartitions"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作从内存中释放一个或多个已加载的 Partition。 | Go | v2"
type: docx
token: YIQXdQUHwovep5xVGz2cgusdnXe
sidebar_position: 24
keywords: 
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - Zilliz
  - Zilliz 云
  - 云
  - ReleasePartitions
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ReleasePartitions

此操作从内存中释放一个或多个已加载的 Partition。

```go
func (c *Client) ReleasePartitions(ctx context.Context, option ReleasePartitionsOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 ReleasePartitions() 的请求。

```go
option := milvusclient.NewReleasePartitionsOptions(collectionName, partitionNames...)

err := client.ReleasePartitions(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **partitionNames** （*...string*） -

    **[必需]**

    一个或多个 Partition 的名称。

**构建器方法：**

- `NewReleasePartitionsOptions(collectionName string, partitionNames ...string)`

    创建用于释放 Partition 的选项。`collectionName` 指定 Collection，`partitionNames` 列出要释放的 Partition。

**返回类型：**

*error*

**返回：**

释放 Partition 后返回 nil。如果操作失败，则返回错误。

**异常处理：**

- **error**

    操作失败。请求构造或 RPC 失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 ReleasePartitions() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("books", "chunk_1", "chunk_2"))
if err != nil {
	// handle error
}
```
