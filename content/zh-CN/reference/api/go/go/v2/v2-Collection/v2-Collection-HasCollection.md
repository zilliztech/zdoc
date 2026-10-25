---
title: "HasCollection | Go | v2"
slug: /go/go/v2-Collection-HasCollection
sidebar_label: "HasCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作检查连接的 Milvus 实例中是否存在 Collection。 | Go | v2"
type: docx
token: T0tQdxsOBolMhFxvjTZcukxHnqh
sidebar_position: 19
keywords: 
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - HasCollection
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# HasCollection

此操作检查连接的 Milvus 实例中是否存在 Collection。

```go
func (c *Client) HasCollection(ctx context.Context, option HasCollectionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## 请求语法\{#request-syntax}

为 HasCollection() 创建请求。

```go
option := milvusclient.NewHasCollectionOption(collectionName)

result, err := client.HasCollection(ctx, option)
```

**参数：**

- **name** （*string*） -

    **[必需]**

    要创建的 Collection 的名称。

**构建器方法：**

- `NewHasCollectionOption(name string)`

    创建用于检查 Collection 是否存在的选项。`name` 指定要检查的 Collection。

**返回类型：**

*has bool, err error*

**返回：**

一个布尔值，指示 Collection 是否存在。如果操作失败，则返回错误。

**参数：**

- **result** （*has bool*） -

    由 HasCollection() 返回的 has bool 值。

**异常：**

- **error**

    操作失败。检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 HasCollection() 的用法。

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

result, err := cli.HasCollection(ctx, milvusclient.NewHasCollectionOption("books"))
if err != nil {
	// handle error
}
fmt.Println(result)
```
