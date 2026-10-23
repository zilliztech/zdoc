---
title: "Delete | Go | v2"
slug: /go/go/v2-Vector-Delete
sidebar_label: "Delete"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过主键值或筛选表达式从 Collection 中删除 Entity。 | Go | v2"
type: docx
token: UsNSd8reIoOaBCxH2s7cvMIDnUf
sidebar_position: 6
keywords: 
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量 Database
  - 有哪些向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - Delete
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Delete

此操作通过主键值或筛选表达式从 Collection 中删除 Entity。

```go
func (c *Client) Delete(ctx context.Context, option DeleteOption, callOptions ...grpc.CallOption) (DeleteResult, error)
```

## 请求语法\{#request-syntax}

创建 Delete() 的请求。

```go
option := milvusclient.NewDeleteOption(collectionName).
    WithExpr(expr).
    WithInt64IDs(fieldName, ids).
    WithStringIDs(fieldName, ids).
    WithPartition(partitionName)

result, err := client.Delete(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewDeleteOption(collectionName string)`

    创建 Delete() 的请求。

- `WithExpr(expr string)`

    设置此操作的 expr。

- `WithTemplateParam(key string, val any)`

    设置用于表达式求值的模板参数。

- `WithInt64IDs(fieldName string, ids []int64)`

    设置此操作的 int64 ID。

- `WithStringIDs(fieldName string, ids []string)`

    设置此操作的 string ID。

- `WithPartition(partitionName string)`

    设置此操作的 Partition。

- `WithNamespace(namespace string)`

    将删除操作的范围限定到 Collection 的命名空间。

**返回类型：**

*DeleteResult, error*

**返回：**

删除结果。如果操作失败，则返回错误。

```go
type DeleteResult struct {
    DeleteCount int64
}
```

**参数：**

- **DeleteCount** （*int64*） -

    受影响的 Entity 数量。

**异常：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 Delete() 的用法。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

res, err := cli.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
	WithInt64IDs("id", []int64{1, 2, 3}))
if err != nil {
	// handle error
}

fmt.Println(res.DeleteCount)
```
