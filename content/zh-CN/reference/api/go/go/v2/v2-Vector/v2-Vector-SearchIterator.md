---
title: "SearchIterator | Go | v2"
slug: /go/go/v2-Vector-SearchIterator
sidebar_label: "SearchIterator"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个搜索迭代器，以批处理方式检索 ANN 搜索结果。对于不应一次性全部加载到内存的大型结果集，请使用此迭代器。 | Go | v2"
type: docx
token: O8iodvuRpoZswVxoC8Ncq2Wlnqf
sidebar_position: 17
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - zilliz
  - zilliz cloud
  - 云
  - SearchIterator
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# SearchIterator

此操作会创建一个搜索迭代器，以批处理方式检索 ANN 搜索结果。对于不应一次性全部加载到内存的大型结果集，请使用此迭代器。

```go
func (c *Client) SearchIterator(ctx context.Context, option SearchIteratorOption, callOptions ...grpc.CallOption) (SearchIterator, error)
```

## 请求语法\{#request-syntax}

创建 SearchIterator() 的请求。

```go
client.SearchIterator(ctx, milvusclient.NewSearchIteratorOption(collectionName, vector).
    WithBatchSize(batchSize).
    WithIteratorLimit(limit).
    WithPartitions(partitionNames...).
    WithFilter(expr).
    WithOutputFields(fieldNames...).
    WithConsistencyLevel(consistencyLevel).
    WithANNSField(annsField).
    WithAnnParam(ap),
)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **vector** （*entity.Vector*） -

    **[必需]**

    用于搜索的查询向量。

**构建器方法：**

- `NewSearchIteratorOption(collectionName string, vector entity.Vector)`

    **[必需]** 为指定的 Collection 和查询向量创建一个新的搜索迭代器选项。

- `WithBatchSize(batchSize int)`

    每个迭代批次要返回的 Entity 数量。默认值：`1000`。

- `WithIteratorLimit(limit int64)`

    要迭代的 Entity 总数量上限。负值表示不设限制。默认值：`Unlimited`（-1）。

- `WithPartitions(partitionNames ...string)`

    要搜索的 Partition。如果未指定，则搜索所有 Partition。

- `WithNamespace(namespace string)`

    将搜索迭代器的作用范围限定为 Collection 命名空间。

- `WithFilter(expr string)`

    用于筛选 Entity 的布尔表达式。仅返回与表达式匹配的 Entity。

- `WithTemplateParam(key string, val any)`

    设置用于表达式求值的模板参数。

- `WithOffset(offset int)`

    设置返回匹配结果前要跳过的结果数量。

- `WithOutputFields(fieldNames ...string)`

    返回的 Entity 中要包含的字段。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`

    搜索的一致性级别。默认值：`Bounded`。

- `WithANNSField(annsField string)`

    当 Collection 包含多个向量字段时，指定要搜索的向量字段。

- `WithGroupByField(groupByField string)`

    按指定字段对搜索结果进行分组。

- `WithGroupSize(groupSize int)`

    启用分组时，设置每组要返回的结果数量。

- `WithStrictGroupSize(strictGroupSize bool)`

    强制实施严格的组大小限制。

- `WithIgnoreGrowing(ignoreGrowing bool)`

    在搜索期间忽略增长中的 Segment。

- `WithAnnParam(ap index.AnnParam)`

    设置近似最近邻搜索参数（例如 nprobe、ef）。

- `WithSearchParam(key, value string)`

    设置自定义搜索参数的键值对。

**返回类型：**

**SearchIterator, error**

**返回：**

*SearchIterator, error* SearchIterator 接口提供对搜索结果的分页访问。请反复调用 `Next()`，直到返回 `io.EOF`。

**参数：**

- **result** （&ast;*SearchIterator*） -

    SearchIterator() 返回的 &ast;SearchIterator 值。

**错误处理：**

- **error**

    操作失败。指定的 Collection 不存在、服务器不支持搜索迭代器、参数无效或服务器无法访问。

## 示例\{#example}

演示 SearchIterator() 的用法。

```go
import (
	"context"
	"fmt"
	"io"

	"github.com/milvus-io/milvus/client/v3/entity"
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

queryVector := entity.FloatVector([]float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835})

iter, err := cli.SearchIterator(ctx, milvusclient.NewSearchIteratorOption("quick_setup", queryVector).
	WithBatchSize(500).
	WithIteratorLimit(1000),
)
if err != nil {
	// handle error
}

for {
	rs, err := iter.Next(ctx)
	if err == io.EOF {
		break
	}
	if err != nil {
		// handle error
	}
	fmt.Printf("Got %d results\n", rs.Len())
}
```
