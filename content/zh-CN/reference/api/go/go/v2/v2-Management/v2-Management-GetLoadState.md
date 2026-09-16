---
title: "GetLoadState() | Go | v2"
slug: /go/go/v2-Management-GetLoadState
sidebar_label: "GetLoadState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Collection 或 Partition 的当前加载状态和进度。 | Go | v2"
type: docx
token: AvOXd92pPoAXPcxvArwcvKnSnph
sidebar_position: 12
keywords: 
  - 稠密向量
  - Hierarchical Navigable Small Worlds
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - GetLoadState()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetLoadState()

此操作返回 Collection 或 Partition 的当前加载状态和进度。

```go
func (c *Client) GetLoadState(ctx context.Context, option GetLoadStateOption, callOptions ...grpc.CallOption) (entity.LoadState, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewGetLoadStateOption(collectionName, partitionNames)

result, err := client.GetLoadState(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

- **partitionNames** (*...string*)

    一个或多个 Partition 的名称。

**返回类型：**

*[Entity.LoadState](./v2-Management-LoadState), error*

**返回：**

返回 Collection 或 Partition 的当前加载状态。如果操作失败，则返回错误。

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

collectionName := `customized_setup_1`

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

loadState, err := cli.GetLoadState(ctx, milvusclient.NewGetLoadStateOption(collectionName))
if err != nil {
	// handle err
}
fmt.Println(loadState)
```
