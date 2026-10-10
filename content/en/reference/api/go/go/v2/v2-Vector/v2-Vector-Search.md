---
title: "Search() | Go | v2"
slug: /go/go/v2-Vector-Search
sidebar_label: "Search()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation performs an approximate nearest neighbor (ANN) search on a specified collection. You can use `NewSearchOption` for vector-based search or `NewSearchByIDsOption` to search by primary key IDs. | Go | v2"
type: docx
token: YKm9dpXcVoy277xHVT2cIymfnRj
sidebar_position: 16
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - Search()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Search()

This operation performs an approximate nearest neighbor (ANN) search on a specified collection. You can use `NewSearchOption` for vector-based search or `NewSearchByIDsOption` to search by primary key IDs.

```go
func (c *Client) Search(ctx context.Context, option SearchOption, callOptions ...grpc.CallOption) ([]ResultSet, error)
```

## Request Syntax\{#request-syntax}

Creates the request for Search().

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

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **limit** (*int*) -

    **[REQUIRED]**

    The maximum number of results to return after reranking.

- **ids** (*column.Column*) -

    **[REQUIRED]**

    The vectors for Search.

**BUILDER METHODS:**

- `NewSearchOption(collectionName string, limit int, vectors []entity.Vector)`

    This creates a search option for vector-based ANN search.

- `NewSearchByIDsOption(collectionName string, limit int, ids column.Column)`

    This creates a search option to find entities by their primary key IDs.

- `WithPartitions(partitionNames ...string)`

    This restricts the search to the specified partition names.

- `WithNamespace(namespace string)`

    This scopes the search to a collection namespace.

- `WithFilter(expr string)`

    This applies a boolean expression filter to the search results.

- `WithTemplateParam(key string, val any)`

    This sets a template parameter for expression evaluation.

- `WithOffset(offset int)`

    This sets the number of results to skip before returning matches.

- `WithOutputFields(fieldNames ...string)`

    This specifies which fields to return in the result sets.

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`

    This sets the consistency level for the search.

- `WithANNSField(annsField string)`

    This specifies the vector field to search on when a collection has multiple vector fields.

- `WithGroupByField(groupByField string)`

    This groups search results by the specified field.

- `WithGroupSize(groupSize int)`

    This sets the number of results to return per group when grouping is enabled.

- `WithStrictGroupSize(strictGroupSize bool)`

    This enforces strict group size limits.

- `WithIgnoreGrowing(ignoreGrowing bool)`

    This ignores growing segments during the search.

- `WithAnnParam(ap index.AnnParam)`

    This sets the approximate nearest neighbor search parameters (e.g., nprobe, ef).

- `WithSearchParam(key, value string)`

    This sets a custom search parameter key-value pair.

- `WithFunctionReranker(fr *entity.Function)`

    This applies a function-based reranker to the search results.

- `WithFunctionScore(fs *entity.FunctionScore)`

    This sets the search [FunctionScore](./v2-Collection-FunctionScore) (functions plus score options such as boost mode).

- `WithSearchAggregation(agg *SearchAggregation)`

    This sets a [SearchAggregation(https://zilliverse.feishu.cn/docx/MSU5d8sIDonFYFxLv0Cc88dvnqL) spec for the search. Mutually exclusive with group-by and offset settings.

**RETURN TYPE:**

*[]ResultSet, error*

**RETURNS:**

The search or query results containing matched entities with scores and fields. Returns an error if the operation fails.

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

    The operation fails. Check err != nil for failure details.

## Example\{#example}

Demonstrates Search() usage.

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
