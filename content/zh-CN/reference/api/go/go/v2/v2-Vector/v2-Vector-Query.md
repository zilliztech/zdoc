---
title: "Query | Go | v2"
slug: /go/go/v2-Vector-Query
sidebar_label: "Query"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会检索与布尔过滤表达式匹配的 Entity。 | Go | v2"
type: docx
token: KwEzdcoZ6o2rkgxUAp4ct66nnDf
sidebar_position: 12
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI 智能体
  - 语义搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - Query
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Query

此操作会检索与布尔过滤表达式匹配的 Entity。

```go
func (c *Client) Query(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
```

## 请求语法\{#request-syntax}

创建 Query() 的请求。

```go
option := milvusclient.NewQueryOption(collectionName).
    WithFilter(expr).
    WithTemplateParam(key, val).
    WithOffset(offset).
    WithLimit(limit).
    WithOutputFields(fieldNames).
    WithConsistencyLevel(consistencyLevel).
    WithPartitions(partitionNames).
    WithIDs(ids)

result, err := client.Query(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewQueryOption(collectionName string)`

    创建 Query() 的请求。

- `WithFilter(expr string)`

    应用布尔过滤表达式以缩小结果范围。

- `WithTemplateParam(key string, val any)`

    设置用于表达式求值的模板参数。

- `WithOffset(offset int)`

    设置返回匹配结果前要跳过的结果数。

- `WithLimit(limit int)`

    设置要返回的最大结果数。

- `WithOutputFields(fieldNames ...string)`

    指定返回结果中要包含的字段。

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](../Collection/ConsistencyLevel.md))`

    设置操作的一致性级别（Strong、Bounded、Session 或 Eventually）。

- `WithPartitions(partitionNames ...string)`

    将操作限制在指定的 Partition 中。

- `WithNamespace(namespace string)`

    将查询范围限定在 Collection 的命名空间中。

- `WithOrderByFields(fields ...string)`

    按给定的标量字段对查询结果排序。每项规格为 `fieldName` 或 `fieldName:asc` / `fieldName:desc`（默认为升序）。设置排序字段时，服务器要求显式指定 limit。

- `WithIDs(ids column.Column)`

    为操作设置 ID。

**返回类型：**

*ResultSet, error*

**返回：**

包含匹配的 Entity 及其分数和字段的搜索或查询结果。如果操作失败，则返回错误。

```go
type ResultSet struct {
    ResultCount  int
    GroupByValue column.Column
    IDs          column.Column
    Fields       DataSet
    AggregationBuckets []AggregationBucket
    Scores       []float32
    Recall       float32
    Err          error
}
```

**参数：**

- **ResultCount** （*int*） -

    返回的条目数。

- **GroupByValue** （*column.Column*） -

    search/query 使用分组时的 group-by 列值。

- **IDs** （*column.Column*） -

    匹配 Entity 的主键列。

- **Fields** （*DataSet*） -

    输出字段列。

- **AggregationBuckets** （*[]AggregationBucket*） -

    请求聚合时，此查询的搜索聚合结果。

- **Scores** （*[]float32*） -

    每个匹配项与目标向量之间的距离。

- **Recall** （*float32*） -

    搜索结果的估计召回率（由 Zilliz Cloud 估计）。

- **Err** （*error*） -

    搜索错误（如有）。

**异常：**

- **error**

    操作失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 Query() 的用法。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

rs, err := cli.Query(ctx, milvusclient.NewQueryOption("quick_setup").
	WithFilter("emb_type == 3").
	WithOutputFields("id", "emb_type"))
if err != nil {
	// handle error
}

fmt.Println(rs.GetColumn("id"))
```
