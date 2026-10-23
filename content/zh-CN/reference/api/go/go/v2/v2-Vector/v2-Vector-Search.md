---
title: "Search() | Go | v2"
slug: /go/go/v2-Vector-Search
sidebar_label: "Search()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作在指定的 Collection 上执行近似最近邻（ANN）搜索。您可以使用 `NewSearchOption` 进行基于向量的搜索，或使用 `NewSearchByIDsOption` 按主键 ID 搜索。 | Go | v2"
type: docx
token: YKm9dpXcVoy277xHVT2cIymfnRj
sidebar_position: 16
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - Zilliz
  - Zilliz Cloud
  - 云
  - Search()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Search()

此操作在指定的 Collection 上执行近似最近邻（ANN）搜索。您可以使用 `NewSearchOption` 进行基于向量的搜索，或使用 `NewSearchByIDsOption` 按主键 ID 搜索。

```go
func (c *Client) Search(ctx context.Context, option SearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## 请求语法\{#request-syntax}

创建用于 Search() 的请求。

```go
option := milvusclient.NewSearchOption(collectionName, limit, vectors).
    WithPartitions(partitionNames).
    WithFilter(expr).
    WithTemplateParam(key, val).
    WithOffset(offset).
    WithOutputFields(fieldNames).
    WithConsistencyLevel(consistencyLevel).
    WithANNSField(annsField).
    WithGroupByField(groupByField).
    WithGroupSize(groupSize).
    WithStrictGroupSize(strictGroupSize).
    WithIgnoreGrowing(ignoreGrowing).
    WithAnnParam(ap).
    WithSearchParam(key, value).
    WithFunctionReranker(fr)

resultSets, err := cli.Search(ctx, option)
option := milvusclient.NewSearchByIDsOption(collectionName, limit, ids).
    WithPartitions(partitionNames).
    WithFilter(expr).
    WithOutputFields(fieldNames)

resultSets, err := cli.Search(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **limit** （*int*） -

    **[必需]**

    重排序后返回的最大结果数。

- **ids** （*column.Column*） -

    **[必需]**

    用于 Search 的向量。

**构建器方法：**

- `NewSearchOption(collectionName string, limit int, vectors []entity.Vector)`

    创建用于基于向量的 ANN 搜索的搜索选项。

- `NewSearchByIDsOption(collectionName string, limit int, ids column.Column)`

    创建用于按主键 ID 查找 Entity 的搜索选项。

- `WithPartitions(partitionNames ...string)`

    将搜索限制在指定的 Partition 名称内。

- `WithNamespace(namespace string)`

    将搜索范围限定为 Collection 命名空间。

- `WithFilter(expr string)`

    对搜索结果应用布尔表达式过滤。

- `WithTemplateParam(key string, val any)`

    为表达式求值设置模板参数。

- `WithOffset(offset int)`

    设置返回匹配项之前要跳过的结果数。

- `WithOutputFields(fieldNames ...string)`

    指定在结果集中返回哪些字段。

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`

    设置搜索的一致性级别。

- `WithANNSField(annsField string)`

    指定当 Collection 包含多个向量字段时要搜索的向量字段。

- `WithGroupByField(groupByField string)`

    按指定字段对搜索结果分组。

- `WithGroupSize(groupSize int)`

    启用分组后，设置每组返回的结果数。

- `WithStrictGroupSize(strictGroupSize bool)`

    强制执行严格的组大小限制。

- `WithIgnoreGrowing(ignoreGrowing bool)`

    搜索期间忽略正在增长的 Segment。

- `WithAnnParam(ap index.AnnParam)`

    设置近似最近邻搜索参数（例如 nprobe、ef）。

- `WithSearchParam(key, value string)`

    设置自定义搜索参数的键值对。

- `WithFunctionReranker(fr *entity.Function)`

    对搜索结果应用基于函数的重排序器。

- `WithFunctionScore(fs *entity.FunctionScore)`

    设置搜索 [FunctionScore](./v2-Collection-FunctionScore)（函数以及 boost 模式等评分选项）。

- `WithSearchAggregation(agg *SearchAggregation)`

    为搜索设置 [SearchAggregation(https://zilliverse.feishu.cn/docx/MSU5d8sIDonFYFxLv0Cc88dvnqL) 规范。此设置与 group-by 和 offset 设置互斥。

**返回类型：**

*[]ResultSet, error*

**返回：**

搜索或查询结果，其中包含匹配 Entity 及其分数和字段。如果操作失败，则返回错误。

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

    当搜索/query 使用分组时的 group-by 列值。

- **IDs** （*column.Column*） -

    匹配 Entity 的主键列。

- **Fields** （*DataSet*） -

    输出字段列。

- **AggregationBuckets** （*[]AggregationBucket*） -

    请求聚合时，此查询的搜索聚合结果。

- **Scores** （*[]float32*） -

    每个匹配项与目标向量之间的距离。

- **Recall** （*float32*） -

    搜索结果的预估召回率（由 Zilliz Cloud 估算）。

- **Err** （*error*） -

    搜索错误（如有）。

**异常：**

- **error**

    操作失败。检查 err != nil 以获取失败详情。

## 示例\{#example}

演示 Search() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
	APIKey:  token,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
	"quick_setup", // collectionName
	3,             // limit
	[]entity.Vector{entity.FloatVector(queryVector)},
))
if err != nil {
	log.Fatal("failed to perform basic ANN search collection: ", err.Error())
}

for _, resultSet := range resultSets {
	log.Println("IDs: ", resultSet.IDs)
	log.Println("Scores: ", resultSet.Scores)
}
```
