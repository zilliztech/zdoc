---
title: "LoadCollection | Go | v2"
slug: /go/go/v2-Management-LoadCollection
sidebar_label: "LoadCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将 Collection 加载到内存中，以便执行搜索和查询操作。 | Go | v2"
type: docx
token: RGDUdquTToKBJJxdGwlcltJYncd
sidebar_position: 17
keywords: 
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量 Database
  - 什么是向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - LoadCollection
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# LoadCollection

此操作会将 Collection 加载到内存中，以便执行搜索和查询操作。

```go
func (c *Client) LoadCollection(ctx context.Context, option LoadCollectionOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## 请求语法\{#request-syntax}

创建 LoadCollection() 请求。

```go
option := milvusclient.NewLoadCollectionOption(collectionName).
    WithReplica(num).
    WithResourceGroup(resourceGroups).
    WithLoadFields(loadFields).
    WithSkipLoadDynamicField(skipFlag).
    WithRefresh(isRefresh)

result, err := client.LoadCollection(ctx, option)
```

**参数：**

- **collectionName**（*string*）-

    **[必填]**

    目标 Collection 的名称。

**构建器方法：**

- `NewLoadCollectionOption(collectionName string)`

    创建 LoadCollection() 请求。

- `WithReplica(num int)`

    设置该操作的副本数。

- `WithResourceGroup(resourceGroups ...string)`

    设置该操作的资源组。

- `WithLoadFields(loadFields ...string)`

    指定要加载到内存中的字段。

- `WithSkipLoadDynamicField(skipFlag bool)`

    设置该操作的跳过加载动态字段。

- `WithRefresh(isRefresh bool)`

    启用刷新模式，以重新加载新插入的数据。

**返回类型：**

*LoadTask, error*

**返回值：**

可用于等待加载操作完成的 LoadTask。如果操作失败，则返回错误。

**方法：**

- **Await**（*error*）-

    在确认加载完成前一直阻塞，并按照任务的检查间隔轮询服务器，直到 Collection 或 Partition 报告已完全加载，或上下文被取消。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 LoadCollection() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("customized_setup_1"))
if err != nil {
	// handle error
}

// sync wait collection to be loaded
err = loadTask.Await(ctx)
if err != nil {
	// handle error
}
```
