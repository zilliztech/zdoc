---
title: "SearchAggregation | Go | v2"
slug: /go/go/v2-Vector-SearchAggregation
sidebar_label: "SearchAggregation"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作描述 `Search()` 的一级桶聚合。使用 `NewSearchAggregation()` 创建聚合规范，并通过 `WithSearchAggregation()` 将其传递给搜索选项。 | Go | v2"
type: docx
token: MSU5d8sIDonFYFxLv0Cc88dvnqL
sidebar_position: 24
keywords: 
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量 Database 对比
  - zilliz
  - zilliz cloud
  - 云
  - SearchAggregation
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# SearchAggregation

此操作描述 `Search()` 的一级桶聚合。使用 `NewSearchAggregation()` 创建聚合规范，并通过 `WithSearchAggregation()` 将其传递给搜索选项。

```go
type SearchAggregation struct {
}
```

**构建器方法：**

- `WithSort(fieldName, direction string)`

    追加一条 Top Hits 排序条件。`direction` 为 `asc` 或 `desc`。

**方法：**

- `Validate() error`

## 示例\{#example}

演示 SearchAggregation 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

agg := milvusclient.NewSearchAggregation([]string{"category"}, 10).
	WithMetric("avg_score", "avg", "score").
	WithOrder("_count", "desc")

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
	"quick_setup",
	100,
	[]entity.Vector{entity.FloatVector{0.1, 0.2, 0.3}},
).WithSearchAggregation(agg))
if err != nil {
	// handle error
}
_ = resultSets
```
