---
title: "DropIndexProperties | Go | v2"
slug: /go/go/v2-Management-DropIndexProperties
sidebar_label: "DropIndexProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从现有索引中移除一个或多个属性。 | Go | v2"
type: docx
token: DdDQdWN3OoSwZbxFTebctTRFnZf
sidebar_position: 8
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - DropIndexProperties
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropIndexProperties

此操作会从现有索引中移除一个或多个属性。

```go
func (c *Client) DropIndexProperties(ctx context.Context, opt DropIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropIndexProperties() 的请求。

```go
option := milvusclient.NewDropIndexPropertiesOption(collectionName, indexName, keys...)

err := client.DropIndexProperties(ctx, option)
```

**参数：**

- **collectionName**（*string*） -

    **[必需]**

    目标 Collection 的名称。

- **indexName**（*string*） -

    **[必需]**

    索引的名称。

- **keys**（*...string*） -

    **[必需]**

    DropIndexProperties 的键。

**构建器方法：**

- `NewDropIndexPropertiesOption(collectionName string, indexName string, keys ...string)`

    创建用于删除索引属性的选项。`collectionName` 指定 Collection，`indexName` 指定索引，`keys` 列出要移除的属性键。

**返回类型：**

*error*

**返回值：**

删除索引属性后返回 nil。如果操作失败，则返回错误。

**错误处理：**

- **error**

    操作失败。请求构造或 RPC 失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 DropIndexProperties() 的用法。

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

err = cli.DropIndexProperties(ctx, milvusclient.NewDropIndexPropertiesOption("books", "vector_index", "mmap.enabled"))
if err != nil {
	// handle error
}
```
