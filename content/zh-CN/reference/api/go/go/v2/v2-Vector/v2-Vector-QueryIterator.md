---
title: "QueryIterator() | Go | v2"
slug: /go/go/v2-Vector-QueryIterator
sidebar_label: "QueryIterator()"
beta: false
added_since: v2.6.x
last_modified: v2.6.2
deprecate_since: false
notebook: false
description: "此操作会创建一个查询迭代器，用于从集合中分批检索匹配的实体。对于不应一次性全部加载到内存中的大型结果集，请使用此操作。 | Go | v2"
type: docx
token: GLdddi5uboT02bxj6cdc1FG2nvd
sidebar_position: 14
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - QueryIterator()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# QueryIterator()

此操作会创建一个查询迭代器，用于从集合中分批检索匹配的实体。对于不应一次性全部加载到内存中的大型结果集，请使用此操作。

```go
func (c *Client) QueryIterator(ctx context.Context, option QueryIteratorOption, callOptions ...grpc.CallOption) (QueryIterator, error)
```

## 请求语法\{#request-syntax}

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

**OPTION METHODS：**

- `NewQueryIteratorOption(collectionName string)` -

    **[必需]**

    为指定集合创建一个新的查询迭代器选项。

- `WithBatchSize(batchSize int)` -

    每次迭代批次返回的实体数量。默认值：`1000`。

- `WithPartitions(partitionNames ...string)` -

    要查询的分区。如果未指定，则查询所有分区。

- `WithFilter(expr string)` -

    用于筛选实体的布尔表达式。仅返回与该表达式匹配的实体。

- `WithOutputFields(fieldNames ...string)` -

    要包含在返回实体中的字段。如果未指定，则仅返回主键字段。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)` -

    查询的一致性级别。默认值：`Bounded`。

- `WithIteratorLimit(limit int64)` -

    允许迭代的实体总数上限。负值表示不受限制。默认值：`Unlimited`（-1）。

**返回值：**

*QueryIterator, error*

`QueryIterator` 接口提供对查询结果的分页访问。重复调用 `Next()`，直到返回 `io.EOF`。

**异常：**

- **error** - 指定的集合不存在、参数无效，或服务器不可达。

## 示例\{#example}

```go
import (
    "context"
    "fmt"
    "io"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
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

## QueryIterator\{#queryiterator}

由 `QueryIterator()` 方法返回的 `QueryIterator` 接口。它只有一个方法：

- `Next(ctx context.Context)` -

    以 `ResultSet` 的形式返回下一批查询结果。当所有结果均已消费完毕时，返回 `io.EOF` 作为错误。
