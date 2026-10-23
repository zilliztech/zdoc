---
title: "LoadPartitions | Go | v2"
slug: /go/go/v2-Management-LoadPartitions
sidebar_label: "LoadPartitions"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将 Collection 的特定 Partition 加载到内存中。 | Go | v2"
type: docx
token: R4nBdOWqtoi6rGx2r4ccEkQ7nl3
sidebar_position: 18
keywords: 
  - Pinecone 与 Milvus
  - Chroma 与 Milvus
  - Annoy 向量搜索
  - Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - LoadPartitions
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadPartitions

此操作会将 Collection 的特定 Partition 加载到内存中。

```go
func (c *Client) LoadPartitions(ctx context.Context, option LoadPartitionsOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## 请求语法\{#request-syntax}

为 LoadPartitions() 创建请求。

```go
option := milvusclient.NewLoadPartitionsOption(collectionName, partitionsNames).
    WithReplica(num).
    WithResourceGroup(resourceGroups).
    WithLoadFields(loadFields).
    WithSkipLoadDynamicField(skipFlag).
    WithRefresh(isRefresh)

result, err := client.LoadPartitions(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **partitionsNames** （*...string*） -

    **[必需]**

    Partition 的名称。

**构建器方法：**

- `NewLoadPartitionsOption(collectionName string, partitionsNames ...string)`

    为 LoadPartitions() 创建请求。

- `WithReplica(num int)`

    设置此操作的副本数。

- `WithResourceGroup(resourceGroups ...string)`

    设置此操作的资源组。

- `WithLoadFields(loadFields ...string)`

    指定要加载到内存中的字段。

- `WithSkipLoadDynamicField(skipFlag bool)`

    设置此操作是否跳过加载动态字段。

- `WithRefresh(isRefresh bool)`

    启用刷新模式，以重新加载新插入的数据。

**返回类型：**

*LoadTask, error*

**返回：**

LoadTask 可用于等待加载操作完成。如果操作失败，则返回错误。

**方法：**

- **Await** （*error*） -

    阻塞，直到确认各 Partition 已完全加载。该过程会按任务的检查间隔轮询服务器，直到加载进度报告为 100，或上下文被取消。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 LoadPartitions() 的用法。

```go
import (
	"context"

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

task, err := cli.LoadPartitions(ctx, milvusclient.NewLoadPartitionsOption("quick_setup", "partitionA"))

// sync wait collection to be loaded
err = task.Await(ctx)
if err != nil {
	// handle error
}
```
