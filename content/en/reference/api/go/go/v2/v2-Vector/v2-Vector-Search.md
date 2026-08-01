---
title: "Search() | Go | v2"
slug: /go/go/v2-Vector-Search
sidebar_label: "Search()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation performs an approximate nearest neighbor (ANN) search on a specified collection. You can use `NewSearchOption` for vector-based search or `NewSearchByIDsOption` to search by primary key IDs. | Go | v2"
type: docx
token: YKm9dpXcVoy277xHVT2cIymfnRj
sidebar_position: 17
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

**Vector search:**

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
```

**Search by primary key IDs:**

```go
option := milvusclient.NewSearchByIDsOption(collectionName, limit, ids).
    WithPartitions(partitionNames).
    WithFilter(expr).
    WithOutputFields(fieldNames)

resultSets, err := cli.Search(ctx, option)
```

**PARAMETERS:**

- **option** (*SearchOption*) -

    The search options. Use `NewSearchOption` for vector search or `NewSearchByIDsOption` for PK-based search.

**BUILDER METHODS:**

- `NewSearchOption(collectionName string, limit int, vectors []entity.Vector)`<br/>
  This creates a search option for vector-based ANN search.

- `NewSearchByIDsOption(collectionName string, limit int, ids column.Column)`<br/>
  This creates a search option to find entities by their primary key IDs.

- `WithPartitions(partitionNames ...string)`<br/>
  This restricts the search to the specified partition names.

- `WithFilter(expr string)`<br/>
  This applies a boolean expression filter to the search results.

- `WithTemplateParam(key string, val any)`<br/>
  This sets a template parameter for expression evaluation.

- `WithOffset(offset int)`<br/>
  This sets the number of results to skip before returning matches.

- `WithOutputFields(fieldNames ...string)`<br/>
  This specifies which fields to return in the result sets.

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`<br/>
  This sets the consistency level for the search.

- `WithANNSField(annsField string)`<br/>
  This specifies the vector field to search on when a collection has multiple vector fields.

- `WithGroupByField(groupByField string)`<br/>
  This groups search results by the specified field.

- `WithGroupSize(groupSize int)`<br/>
  This sets the number of results to return per group when grouping is enabled.

- `WithStrictGroupSize(strictGroupSize bool)`<br/>
  This enforces strict group size limits.

- `WithIgnoreGrowing(ignoreGrowing bool)`<br/>
  This ignores growing segments during the search.

- `WithAnnParam(ap index.AnnParam)`<br/>
  This sets the approximate nearest neighbor search parameters (e.g., nprobe, ef).

- `WithSearchParam(key, value string)`<br/>
  This sets a custom search parameter key-value pair.

- `WithFunctionReranker(fr *entity.Function)`<br/>
  This applies a function-based reranker to the search results.

**RETURN TYPE:**

*[]ResultSet, error*

**RETURNS:**

The search or query results containing matched entities with scores and fields. Returns an error if the operation fails.

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
