---
title: "Reranker | Go | v2"
slug: /go/go/v2-Vector-Reranker
sidebar_label: "Reranker"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A Reranker instance combines and ranks the results of multiple ANN sub-requests for `HybridSearch()`. Use `NewRRFReranker()` or `NewWeightedReranker()` to create instances. | Go | v2"
type: docx
token: TkDpdz2mHoZJojx0njDcdtDqnFg
sidebar_position: 23
keywords: 
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - Reranker
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Reranker

A Reranker instance combines and ranks the results of multiple ANN sub-requests for `HybridSearch()`. Use `NewRRFReranker()` or `NewWeightedReranker()` to create instances.

```go
type Reranker interface {
    GetParams() []*commonpb.KeyValuePair
}
```

**BUILDER METHODS:**

- `NewRRFReranker()`

    Creates a Reciprocal Rank Fusion (RRF) reranker. The default `k` is 60.

- `NewWeightedReranker(weights []float64)`

    Creates a weighted reranker with one weight per ANN sub-request.

**METHODS:**

- `GetParams() []*commonpb.KeyValuePair`

    Returns the rerank strategy and parameters as key-value pairs.

- `WithK(k float64)`

    Sets the RRF `k` smoothing factor.

- `WithWeights(weights []float64)`

    Sets optional reciprocal-rank coefficients in ANN request order. The server requires a non-empty slice, one value in [0, 1] per ANN request; nil and empty slices are serialized so the server can reject them.

## Example\{#example}

Demonstrates Reranker usage.

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
