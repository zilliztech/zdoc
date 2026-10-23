---
title: "Reranker | Go | v2"
slug: /go/go/v2-Vector-Reranker
sidebar_label: "Reranker"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Reranker 实例会为 `HybridSearch()` 合并多个 ANN 子请求的结果并对其进行排序。可使用 `NewRRFReranker()` 或 `NewWeightedReranker()` 创建实例。 | Go | v2"
type: docx
token: TkDpdz2mHoZJojx0njDcdtDqnFg
sidebar_position: 23
keywords: 
  - 什么是语义搜索
  - Embedding 模型
  - 图像相似性搜索
  - 上下文窗口
  - zilliz
  - zilliz cloud
  - 云
  - Reranker
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Reranker

Reranker 实例会为 `HybridSearch()` 合并多个 ANN 子请求的结果并对其进行排序。可使用 `NewRRFReranker()` 或 `NewWeightedReranker()` 创建实例。

```go
type Reranker interface {
    GetParams() []*commonpb.KeyValuePair
}
```

**构建器方法：**

- `NewRRFReranker()`

    创建一个 Reciprocal Rank Fusion（RRF）Reranker。默认 `k` 为 60。

- `NewWeightedReranker(weights []float64)`

    创建一个加权 Reranker，每个 ANN 子请求对应一个权重。

**方法：**

- `GetParams() []*commonpb.KeyValuePair`

    以键值对形式返回重排策略和参数。

- `WithK(k float64)`

    设置 RRF `k` 平滑因子。

- `WithWeights(weights []float64)`

    按 ANN 请求顺序设置可选的倒数排名系数。服务器要求切片非空，且每个 ANN 请求对应一个位于 [0, 1] 内的值；nil 和空切片也会被序列化，以便服务器能够拒绝它们。

## 示例\{#example}

演示 Reranker 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
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

denseReq := milvusclient.NewAnnRequest("dense_vector", 10, denseVectors...)
sparseReq := milvusclient.NewAnnRequest("sparse_vector", 10, []entity.Vector{sparse}...)

resultSets, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
	"quick_setup",
	10,
	denseReq, sparseReq,
).WithReranker(milvusclient.NewRRFReranker()))
if err != nil {
	log.Fatal("failed to perform hybrid search: ", err.Error())
}
_ = resultSets
```
