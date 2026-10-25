---
title: "ResultSet | Go | v2"
slug: /go/go/v2-Vector-ResultSet
sidebar_label: "ResultSet"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ResultSet 实例是由 `Search()`、`HybridSearch()`、`Query()` 和 `Get()` 返回的搜索或查询结果集。它保存返回的条目数、主键、输出字段和分数。 | Go | v2"
type: docx
token: N4dudTInDoPuE4xPup5c0a60ngO
sidebar_position: 15
keywords: 
  - 混合向量搜索
  - 视频去重
  - 视频相似度搜索
  - 向量检索
  - zilliz
  - zilliz cloud
  - 云
  - ResultSet
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ResultSet

ResultSet 实例是由 `Search()`、`HybridSearch()`、`Query()` 和 `Get()` 返回的搜索或查询结果集。它保存返回的条目数、主键、输出字段和分数。

```go
type ResultSet struct {
    ResultCount int
    GroupByValue column.Column
    IDs column.Column
    Fields DataSet
    AggregationBuckets []AggregationBucket
    Scores []float32
    Recall float32
    Err error
}
```

**字段：**

- **ResultCount**（*int*）-

    返回的条目数。

- **GroupByValue**（*column.Column*）-

    当 search/query 使用分组时，group-by 列的值。

- **IDs**（*column.Column*）-

    匹配 Entity 的主键列。

- **Fields**（*DataSet*）-

    输出字段列。

- **AggregationBuckets**（*[]AggregationBucket*）-

    请求聚合时，此查询的搜索聚合结果。

- **Scores**（*[]float32*）-

    每个匹配项与目标向量之间的距离/分数。

- **Recall**（*float32*）-

    搜索结果的估计召回率（由 Zilliz Cloud 估算）。

- **Err**（*error*）-

    搜索错误（如有）。

**构建器方法：**

- `GetColumn(fieldName string) column.Column`

    返回具有所提供字段名称的列。

- `Len() int`

    返回结果条目数。

- `Slice(start, end int) ResultSet`

    返回给定起始索引和结束索引之间的结果子集。

- `Unmarshal(receiver any) error`

    以按行方式将数据集解组为指向模型结构体的指针切片。请注意，此处不会解组 distance/score。

## 示例\{#example}

演示 ResultSet 的用法。

```go
import (
	"context"

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

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("books", 10, vectors))
if err != nil {
	// handle error
}
resultSet := resultSets[0]
fmt.Println(resultSet.ResultCount, resultSet.Scores)
```
