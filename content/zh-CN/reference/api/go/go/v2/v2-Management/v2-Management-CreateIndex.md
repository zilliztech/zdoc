---
title: "CreateIndex() | Go | v2"
slug: /go/go/v2-Management-CreateIndex
sidebar_label: "CreateIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在指定字段上创建索引，以加速向量相似度搜索或标量过滤。 | Go | v2"
type: docx
token: KLrMdFtVko5QGwxyIs9ckmtUn0c
sidebar_position: 4
keywords: 
  - milvus lite
  - milvus benchmark
  - 托管 milvus
  - Serverless 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - CreateIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateIndex()

此操作会在指定字段上创建索引，以加速向量相似度搜索或标量过滤。

```go
func (c *Client) CreateIndex(ctx context.Context, option CreateIndexOption, callOptions ...grpc.CallOption) (*CreateIndexTask, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewCreateIndexOption(collectionName, fieldName, index).
    WithIndexName(indexName)

result, err := client.CreateIndex(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

- **fieldName** (*string*)

    字段的名称。

- **[index](./v2-Management-Index)** (*[index.Index](./v2-Management-Index)*)

    索引。

**选项方法：**

- `WithIndexName(indexName string)`

    设置索引的名称。

**返回类型：**

&ast;*[CreateIndexTask](./v2-Management-CreateIndexTask), error*

**返回：**

返回一个 CreateIndexTask，可用于等待索引构建完成。如果操作失败，则返回错误。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/entity"
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

index := index.NewHNSWIndex(entity.COSINE, 32, 128)
indexTask, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "vector", index))
if err != nil {
	// handler err
}

err = indexTask.Await(ctx)
if err != nil {
	// handler err
}
```
