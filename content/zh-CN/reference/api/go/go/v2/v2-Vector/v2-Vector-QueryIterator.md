---
title: "QueryIterator | Go | v2"
slug: /go/go/v2-Vector-QueryIterator
sidebar_label: "QueryIterator"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个查询迭代器，以分批方式从 Collection 中检索匹配的 Entity。此操作适用于不应一次性加载到内存的大型结果集。 | Go | v2"
type: docx
token: AGM3dTL6Vorr6XxS3IjcBAbBnVg
sidebar_position: 13
keywords: 
  - 降维
  - HNSW 算法
  - 向量相似性搜索
  - 近似最近邻搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - QueryIterator
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# QueryIterator

此操作会创建一个查询迭代器，以分批方式从 Collection 中检索匹配的 Entity。此操作适用于不应一次性加载到内存的大型结果集。

```go
func (c *Client) QueryIterator(ctx context.Context, option QueryIteratorOption, callOptions ...grpc.CallOption) (QueryIterator, error)
```

## 请求语法\{#request-syntax}

创建 QueryIterator() 的请求。

```go
client.QueryIterator(ctx, milvusclient.NewQueryIteratorOption(collectionName).
    WithBatchSize(batchSize).
    WithPartitions(partitionNames...).
    WithFilter(expr).
    WithOutputFields(fieldNames...).
    WithConsistencyLevel(consistencyLevel).
    WithIteratorLimit(limit),
)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    要查询的 Collection 的名称。

**构建器方法：**

- `NewQueryIteratorOption(collectionName string)`

    为指定的 Collection 创建新的查询迭代器选项。

- `WithBatchSize(batchSize int)`

    每个迭代批次要返回的 Entity 数量。该值默认为 `1000`。

- `WithPartitions(partitionNames ...string)`

    要查询的 Partition。如果未指定，则查询所有 Partition。

- `WithNamespace(namespace string)`

    将查询迭代器的作用域限定为 Collection 命名空间。

- `WithFilter(expr string)`

    用于筛选 Entity 的布尔表达式。仅返回与表达式匹配的 Entity。

- `WithOutputFields(fieldNames ...string)`

    要包含在返回的 Entity 中的字段。如果未指定，则仅返回主键字段。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`

    查询的一致性级别。该值默认为 `Bounded`。

- `WithIteratorLimit(limit int64)`

    要迭代的 Entity 总数上限。负值表示无限制。该值默认为 `Unlimited`（-1）。

**返回类型：**

&ast;*QueryIterator, error*

**返回：**

*QueryIterator, error* QueryIterator 接口提供对查询结果的分页访问。反复调用 `Next()`，直到返回 `io.EOF`。

**参数：**

- **result** （&ast;*QueryIterator*） -

    QueryIterator() 返回的 &ast;QueryIterator 值。

**错误处理：**

- **error**

    操作失败。指定的 Collection 不存在、参数无效或服务器不可达。

## 示例\{#example}

演示 QueryIterator() 的用法。

```go
import (
    "context"
    "fmt"
    "io"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

iter, err := client.QueryIterator(ctx,
    milvusclient.NewQueryIteratorOption("my_collection").
        WithBatchSize(500).
        WithFilter("age > 18").
        WithOutputFields("name", "age"),
)
if err != nil {
    log.Fatal(err)
}

for {
    rs, err := iter.Next(ctx)
    if err == io.EOF {
        break
    }
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Got %d results\n", rs.Len())
}
```
