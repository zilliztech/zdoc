---
title: "CreateIndex | Go | v2"
slug: /go/go/v2-Management-CreateIndex
sidebar_label: "CreateIndex"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在 Collection 的指定字段上创建索引，并返回一个用于跟踪其进度的任务。 | Go | v2"
type: docx
token: Rrx1dlCBVocbLIxGCBycLTScnUg
sidebar_position: 4
keywords: 
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - IVF
  - Zilliz
  - Zilliz Cloud
  - 云
  - CreateIndex
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreateIndex

此操作会在 Collection 的指定字段上创建索引，并返回一个用于跟踪其进度的任务。

```go
func (c *Client) CreateIndex(ctx context.Context, option CreateIndexOption, callOptions ...grpc.CallOption) (*CreateIndexTask, error)
```

## 请求语法\{#request-syntax}

创建 CreateIndex() 的请求。

```go
option := milvusclient.NewCreateIndexOption(collectionName, fieldName, idx).
    WithIndexName(indexName)

task, err := client.CreateIndex(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **fieldName** （*string*） -

    **[必需]**

    用于 CreateIndex 的 fieldName。

- **index** （*index.Index*） -

    **[必需]**

    用于 CreateIndex 的索引。

**构建器方法：**

- `NewCreateIndexOption(collectionName string, fieldName string, index index.Index)`

    创建用于构建索引的选项。`collectionName` 指定 Collection，`fieldName` 指定要建立索引的字段，`index` 定义索引类型和参数。

- `WithIndexName(indexName string)`

    设置要创建的索引的名称。

- `WithExtraParam(key string, value any)`

    添加额外的索引构建参数键值对。此方法会就地修改选项，并且不返回该选项，因此无法链式调用。

**返回类型：**

*CreateIndexTask, error*

**返回：**

一个可用于等待索引构建完成的 CreateIndexTask。如果操作失败，则返回错误。

**参数：**

- **result** （[CreateIndexTask](./v2-Management-CreateIndexTask)） -

    由 CreateIndex() 返回的 CreateIndexTask 值。

**异常：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 CreateIndex() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

idx := index.NewAutoIndex(entity.COSINE)

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "vector", idx).
	WithIndexName("vector_index"))
if err != nil {
	// handle error
}

// sync wait index to be created
err = task.Await(ctx)
if err != nil {
	// handle error
}
```
