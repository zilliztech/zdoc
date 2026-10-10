---
title: "HybridSearch() | Go | v2"
slug: /go/go/v2-Vector-HybridSearch
sidebar_label: "HybridSearch()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation performs an ANN search across multiple vector fields in a collection using multiple search requests, then combines and ranks the results with a reranker. | Go | v2"
type: docx
token: VneHdph9ZoSf9wxQdKBc0046nBT
sidebar_position: 9
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - HybridSearch()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HybridSearch()

This operation performs an ANN search across multiple vector fields in a collection using multiple search requests, then combines and ranks the results with a reranker.

```go
func (c *Client) HybridSearch(ctx context.Context, option HybridSearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## Request Syntax\{#request-syntax}

Creates the request for HybridSearch().

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

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **limit** (*int*) -

    **[REQUIRED]**

    The maximum number of results to return after reranking.

- **annRequests** (<em>...</em>AnnRequest&ast;) -

    **[REQUIRED]**

    One or more per-vector-field ANN search requests, created with `NewAnnRequest`.

**BUILDER METHODS:**

- `NewHybridSearchOption(collectionName string, limit int, annRequests ...*AnnRequest)`

    Creates a new option for a hybrid search. Build each sub-request with `NewAnnRequest(annField, limit, vectors...)`.

- `NewAnnRequest(annField string, limit int, vectors ...entity.Vector)`

    Creates an ANN search sub-request for a single vector field.

- `WithConsistencyLevel(cl entity.ConsistencyLevel)`

    Sets the consistency level for the search.

- `WithPartitions(partitions ...string)`

    Restricts the search to the specified partitions.

- `WithNamespace(namespace string)`

    Specifies the namespace to search in.

- `WithOutputFields(outputFields ...string)`

    Specifies which fields to return in the result sets.

- `WithReranker(reranker [Reranker](Reranker.md))`

    Sets the reranker used to combine and rank the per-field results. Use `NewRRFReranker()` or `NewWeightedReranker()` to create one.

- `WithFunctionRerankers(functionReranker *entity.Function)`

    Applies a scoring Function to every leg of the hybrid search on the server.

- `WithFunctionScore(fs *entity.FunctionScore)`

    Sets the search [FunctionScore](./v2-Collection-FunctionScore) (functions plus score options such as boost mode).

- `WithOffset(offset int)`

    Sets the number of results to skip before returning matches.

**RETURN TYPE:**

*[]ResultSet, error*

**RETURNS:**

The search results containing matched entities with scores and fields. Returns an error if the operation fails.

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

**PARAMETERS:**

- **ResultCount** (*int*) -

    The number of returned entries.

- **GroupByValue** (*column.Column*) -

    The group-by column value when the search/query used grouping.

- **IDs** (*column.Column*) -

    The primary-key column of the matched entities.

- **Fields** (*DataSet*) -

    The output field columns.

- **AggregationBuckets** (*[]AggregationBucket*) -

    Search aggregation results for this query, when an aggregation was requested.

- **Scores** (*[]float32*) -

    The distance to the target vector for each match.

- **Recall** (*float32*) -

    The estimated recall of the search result (estimated by Zilliz Cloud).

- **Err** (*error*) -

    The search error, if any.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates HybridSearch() usage.

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
