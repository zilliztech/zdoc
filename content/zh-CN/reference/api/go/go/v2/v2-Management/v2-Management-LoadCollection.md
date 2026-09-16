---
title: "LoadCollection() | Go | v2"
slug: /go/go/v2-Management-LoadCollection
sidebar_label: "LoadCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将 Collection 加载到内存，以便进行搜索和查询操作。 | Go | v2"
type: docx
token: B5w2dyWunogsmAxlJfQcQp8qnRg
sidebar_position: 18
keywords: 
  - IVF
  - knn
  - 图像搜索
  - LLMs
  - zilliz
  - zilliz cloud
  - 云
  - LoadCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadCollection()

此操作会将 Collection 加载到内存，以便进行搜索和查询操作。

```go
func (c *Client) LoadCollection(ctx context.Context, option LoadCollectionOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## 请求语法\{#request-syntax}

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

- **collectionName** (*string*)

    目标 Collection 的名称。

**选项方法：**

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
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
