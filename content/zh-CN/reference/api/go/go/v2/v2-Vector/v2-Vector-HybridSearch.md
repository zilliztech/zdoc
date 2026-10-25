---
title: "HybridSearch() | Go | v2"
slug: /go/go/v2-Vector-HybridSearch
sidebar_label: "HybridSearch()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用多个搜索请求对 Collection 中的多个向量字段执行 ANN 搜索，然后使用 reranker 合并并排序结果。 | Go | v2"
type: docx
token: VneHdph9ZoSf9wxQdKBc0046nBT
sidebar_position: 10
keywords: 
  - 音频搜索
  - 什么是语义搜索
  - 嵌入模型
  - 图像相似度搜索
  - zilliz
  - zilliz cloud
  - 云
  - HybridSearch()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# HybridSearch()

此操作使用多个搜索请求对 Collection 中的多个向量字段执行 ANN 搜索，然后使用 reranker 合并并排序结果。

```go
func (c *Client) HybridSearch(ctx context.Context, option HybridSearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## 请求语法\{#request-syntax}

创建 HybridSearch() 的请求。

```go
annReq1 := milvusclient.NewAnnRequest("dense_vector", 10, denseVectors...)
annReq2 := milvusclient.NewAnnRequest("sparse_vector", 10, sparseVectors...)

option := milvusclient.NewHybridSearchOption(collectionName, 10, annReq1, annReq2).
    WithPartitions(partitionNames).
    WithNamespace(namespace).
    WithOutputFields(outputFields).
    WithConsistencyLevel(consistencyLevel).
    WithReranker(reranker).
    WithOffset(offset)

resultSets, err := cli.HybridSearch(ctx, option)
```

**参数：**

- **collectionName** (*string*) -

    **[必需]**

    目标 Collection 的名称。

- **limit** (*int*) -

    **[必需]**

    重排序后返回的最大结果数。

- **annRequests** (<em>...</em>AnnRequest&ast;) -

    **[必需]**

    使用 `NewAnnRequest` 创建的一个或多个按向量字段划分的 ANN 搜索请求。

**构建器方法：**

- `NewHybridSearchOption(collectionName string, limit int, annRequests ...*AnnRequest)`

    为混合搜索创建新选项。使用 `NewAnnRequest(annField, limit, vectors...)` 构建各个子请求。

- `NewAnnRequest(annField string, limit int, vectors ...entity.Vector)`

    为单个向量字段创建 ANN 搜索子请求。

- `WithConsistencyLevel(cl entity.ConsistencyLevel)`

    设置搜索的一致性级别。

- `WithPartitions(partitions ...string)`

    将搜索限制在指定的 Partition 内。

- `WithNamespace(namespace string)`

    指定要在其中执行搜索的命名空间。

- `WithOutputFields(outputFields ...string)`

    指定结果集中要返回的字段。

- `WithReranker(reranker [Reranker](Reranker.md))`

    设置用于合并并排序各字段结果的 reranker。可使用 `NewRRFReranker()` 或 `NewWeightedReranker()` 创建一个 reranker。

- `WithFunctionRerankers(functionReranker *entity.Function)`

    在服务器端对混合搜索的每个分支应用评分 Function。

- `WithFunctionScore(fs *entity.FunctionScore)`

    设置搜索 [FunctionScore](./v2-Collection-FunctionScore)（Function 以及 boost mode 等评分选项）。

- `WithOffset(offset int)`

    设置返回匹配结果前要跳过的结果数。

**返回类型：**

*[]ResultSet, error*

**返回：**

包含匹配 Entity 及其分数和字段的搜索结果。如果操作失败，则返回错误。

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

- **ResultCount** (*int*) -

    返回的条目数。

- **GroupByValue** (*column.Column*) -

    当 search/query 使用分组时，group-by 列的值。

- **IDs** (*column.Column*) -

    匹配 Entity 的主键列。

- **Fields** (*DataSet*) -

    输出字段列。

- **AggregationBuckets** (*[]AggregationBucket*) -

    请求聚合时，此查询的搜索聚合结果。

- **Scores** (*[]float32*) -

    每个匹配结果与目标向量之间的距离。

- **Recall** (*float32*) -

    搜索结果的估计召回率（由 Zilliz Cloud 估算）。

- **Err** (*error*) -

    搜索错误（如有）。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 HybridSearch() 的用法。

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

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

denseVectors := []entity.Vector{entity.FloatVector([]float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835})}
sparse, err := entity.NewSliceSparseEmbedding([]uint32{1, 2}, []float32{0.5, 0.3})
if err != nil {
	log.Fatal("failed to construct sparse embedding: ", err.Error())
}
sparseVectors := []entity.Vector{sparse}

denseReq := milvusclient.NewAnnRequest("dense_vector", 10, denseVectors...)
sparseReq := milvusclient.NewAnnRequest("sparse_vector", 10, sparseVectors...)

resultSets, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
	"quick_setup", // collectionName
	10,            // limit
	denseReq, sparseReq,
))
if err != nil {
	log.Fatal("failed to perform hybrid search: ", err.Error())
}

for _, resultSet := range resultSets {
	log.Println("IDs: ", resultSet.IDs)
	log.Println("Scores: ", resultSet.Scores)
}
```
