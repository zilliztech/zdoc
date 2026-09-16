---
title: "DropPartition() | Go | v2"
slug: /go/go/v2-Partition-DropPartition
sidebar_label: "DropPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会永久删除一个 Partition 及其全部数据。 | Go | v2"
type: docx
token: XnbJdLilXobGn1x1Uq6cvhKTnhf
sidebar_position: 2
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - rag llm 架构
  - 私有 LLM
  - zilliz
  - zilliz cloud
  - 云
  - DropPartition()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropPartition()

此操作会永久删除一个 Partition 及其全部数据。

```go
func (c *Client) DropPartition(ctx context.Context, opt DropPartitionOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDropPartitionOption(collectionName, partitionName)

err := client.DropPartition(ctx, option)
```

**参数：**

- **collectionName** (*string*)

目标 Collection 的名称。

- **partitionName** (*string*)

要删除的 Partition 的名称。

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
