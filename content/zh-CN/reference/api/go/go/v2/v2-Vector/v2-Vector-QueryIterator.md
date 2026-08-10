---
title: "QueryIterator() | Go | v2"
slug: /go/go/v2-Vector-QueryIterator
sidebar_label: "QueryIterator()"
beta: false
added_since: v2.6.x
last_modified: v2.6.2
deprecate_since: false
notebook: false
description: "此操作会创建一个查询迭代器，以批次方式从 Collection 中检索匹配的 Entity。对于不应一次性全部加载到内存中的大型结果集，请使用此操作。 | Go | v2"
type: docx
token: GLdddi5uboT02bxj6cdc1FG2nvd
sidebar_position: 14
keywords: 
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - QueryIterator()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# QueryIterator()

此操作会创建一个查询迭代器，以批次方式从 Collection 中检索匹配的 Entity。对于不应一次性全部加载到内存中的大型结果集，请使用此操作。

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

**选项方法：**

- `NewQueryIteratorOption(collectionName string)` -

    **[必需]**

    为指定的 Collection 创建一个新的查询迭代器选项。

- `WithBatchSize(batchSize int)` -

    每次迭代批次返回的 Entity 数量。默认值：`1000`。

- `WithPartitions(partitionNames ...string)` -

    要查询的 Partition。如果未指定，则查询所有 Partition。

- `WithFilter(expr string)` -

    用于筛选 Entity 的布尔表达式。仅返回与该表达式匹配的 Entity。

- `WithOutputFields(fieldNames ...string)` -

    返回的 Entity 中要包含的字段。如果未指定，则仅返回主键字段。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)` -

    查询的一致性级别。默认值：`Bounded`。

- `WithIteratorLimit(limit int64)` -

    要迭代的 Entity 总数上限。负值表示无限制。默认值：`Unlimited` (-1)。

**返回：**

*QueryIterator, error*

QueryIterator 接口提供对查询结果的分页访问。重复调用 `Next()`，直到返回 `io.EOF`。

**异常：**

- **error** - 指定的 Collection 不存在、参数无效，或者服务器无法访问。

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

由 `QueryIterator()` 方法返回的 QueryIterator 接口。它只有一个方法：

- `Next(ctx context.Context)` -

    将下一批查询结果作为 `ResultSet` 返回。当所有结果都已使用完毕时，返回 `io.EOF` 作为错误。
