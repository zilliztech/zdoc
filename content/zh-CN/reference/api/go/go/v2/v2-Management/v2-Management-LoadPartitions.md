---
title: "LoadPartitions() | Go | v2"
slug: /go/go/v2-Management-LoadPartitions
sidebar_label: "LoadPartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将 Collection 的特定 Partition 加载到内存中。 | Go | v2"
type: docx
token: LMXGdDnueontIFxuqAIcS8D6nJc
sidebar_position: 19
keywords: 
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - 混合向量搜索
  - zilliz
  - zilliz cloud
  - 云
  - LoadPartitions()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadPartitions()

此操作会将 Collection 的特定 Partition 加载到内存中。

```go
func (c *Client) LoadPartitions(ctx context.Context, option LoadPartitionsOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## 请求语法\{#request-syntax}

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

- **collectionName** (*string*)

    目标 Collection 的名称。

- **partitionsNames** (*...string*)

    Partition 的名称。

**选项方法：**

- `WithReplica(num int)`

    设置操作的副本数。

- `WithResourceGroup(resourceGroups ...string)`

    设置操作的资源组。

- `WithLoadFields(loadFields ...string)`

    指定要加载到内存中的字段。

- `WithSkipLoadDynamicField(skipFlag bool)`

    设置操作的跳过加载动态字段。

- `WithRefresh(isRefresh bool)`

    启用刷新模式以重新加载新插入的数据。

**返回类型：**

*[LoadTask](./v2-Management-LoadTask), error*

**返回：**

返回一个 LoadTask，可用于等待加载操作完成。如果操作失败，则返回错误。

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

task, err := cli.LoadPartitions(ctx, milvusclient.NewLoadPartitionsOption("quick_setup", "partitionA"))

// sync wait collection to be loaded
err = task.Await(ctx)
if err != nil {
	// handle error
}
```
