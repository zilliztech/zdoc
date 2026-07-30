---
title: "HybridSearch() | Go | v2"
slug: /go/go/v2-Vector-HybridSearch
sidebar_label: "HybridSearch()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation performs a hybrid search that combines results from multiple ANN requests, each targeting a different vector field or index type. Use a reranker to merge and reorder the results. | Go | v2"
type: docx
token: VneHdph9ZoSf9wxQdKBc0046nBT
sidebar_position: 5
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

This operation performs a hybrid search that combines results from multiple ANN requests, each targeting a different vector field or index type. Use a reranker to merge and reorder the results.

```go
func (c *Client) HybridSearch(ctx context.Context, option HybridSearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewHybridSearchOption(collectionName, limit, annRequests).
    WithConsistencyLevel(cl).
    WithPartitions(partitions).
    WithOutputFields(outputFields).
    WithReranker(reranker).
    WithFunctionRerankers(functionReranker).
    WithOffset(offset)

resultSets, err := cli.HybridSearch(ctx, option)
```

**PARAMETERS:**

- **option** (*HybridSearchOption*) -

    The hybrid search options.

**BUILDER METHODS:**

- `NewHybridSearchOption(collectionName string, limit int, annRequests ...*AnnRequest)`
This creates a hybrid search option with one or more ANN requests.

- `NewAnnRequest(fieldName string, limit int, vector entity.Vector)`
This creates an ANN request for a specific vector field.

- `WithIDs(ids column.Column)`
This filters the ANN request to search only the specified primary key IDs.

- `WithFilter(expr string)`
This applies a boolean expression filter to the ANN request.

- `WithOffset(offset int)`
This sets the number of results to skip for the ANN request.

- `WithGroupByField(groupByField string)`
This groups the ANN request results by the specified field.

- `WithGroupSize(groupSize int)`
This sets the number of results per group.

- `WithStrictGroupSize(strictGroupSize bool)`
This enforces strict group size limits.

- `WithIgnoreGrowing(ignoreGrowing bool)`
This ignores growing segments during the ANN request.

- `WithAnnParam(ap index.AnnParam)`
This sets the ANN parameters for the request.

- `WithSearchParam(key, value string)`
This sets a custom search parameter for the ANN request.

- `WithFunctionReranker(fr *entity.Function)`
This applies a function reranker to the ANN request.

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`
This sets the consistency level for the hybrid search.

- `WithPartitions(partitionNames ...string)`
This restricts the hybrid search to the specified partitions.

- `WithOutputFields(fieldNames ...string)`
This specifies which fields to return in the result sets.

- `WithReranker(reranker milvusclient.Reranker)`
This sets a reranker to merge and reorder results from multiple ANN requests.

- `WithFunctionRerankers(functionReranker ...*entity.Function)`
This sets function-based rerankers for the hybrid search.

- `WithOffset(offset int)`
This sets the number of results to skip before returning matches.

**RETURN TYPE:**

*[]ResultSet, error*

**RETURNS:**

The hybrid search results containing matched entities with scores and fields from all ANN requests. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check err != nil for failure details.

## Example\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/entity"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
sparseVector, _ := entity.NewSliceSparseEmbedding([]uint32{1, 21, 100}, []float32{0.1, 0.2, 0.3})

resultSets, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
	"quick_setup",
	3,
	milvusclient.NewAnnRequest("dense_vector", 10, entity.FloatVector(queryVector)),
	milvusclient.NewAnnRequest("sparse_vector", 10, sparseVector),
).WithReranker(milvusclient.NewRRFReranker()))
if err != nil {
	log.Fatal("failed to perform hybrid search: ", err.Error())
}

for _, resultSet := range resultSets {
	log.Println("IDs: ", resultSet.IDs)
	log.Println("Scores: ", resultSet.Scores)
}
```
