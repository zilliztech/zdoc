---
title: "Get | Go | v2"
slug: /go/go/v2-Vector-Get
sidebar_label: "Get"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves entities by their primary key values. | Go | v2"
type: docx
token: PUZvdUzxzomdrFxCMlSc4UUqnGg
sidebar_position: 8
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - Get
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Get

This operation retrieves entities by their primary key values.

```go
func (c *Client) Get(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
```

## Request Syntax\{#request-syntax}

Creates the request for Get().

```go
option := milvusclient.NewQueryOption(collectionName).
    WithFilter(expr).
    WithTemplateParam(key, val).
    WithOffset(offset).
    WithLimit(limit).
    WithOutputFields(fieldNames).
    WithConsistencyLevel(consistencyLevel).
    WithPartitions(partitionNames).
    WithIDs(ids)

result, err := client.Get(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewQueryOption(collectionName string)`

    Creates the request for Get().

- `WithFilter(expr string)`

    Applies a boolean filter expression to narrow results.

- `WithTemplateParam(key string, val any)`

    Sets a template parameter for expression evaluation.

- `WithOffset(offset int)`

    Sets the number of results to skip before returning matches.

- `WithLimit(limit int)`

    Sets the maximum number of results to return.

- `WithOutputFields(fieldNames ...string)`

    Specifies which fields to include in the returned results.

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](../Collection/ConsistencyLevel.md))`

    Sets the consistency level for the operation (Strong, Bounded, Session, or Eventually).

- `WithPartitions(partitionNames ...string)`

    Limits the operation to the specified partitions.

- `WithNamespace(namespace string)`

    Scopes the query to a collection namespace.

- `WithOrderByFields(fields ...string)`

    Sorts query results by the given scalar fields. Each spec is `fieldName` or `fieldName:asc` / `fieldName:desc` (default asc). The server requires an explicit limit when order-by fields are set.

- `WithIDs(ids column.Column)`

    Sets the IDs for the operation.

**RETURN TYPE:**

*ResultSet, error*

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

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates Get() usage.

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/column"
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

rs, err := cli.Get(ctx, milvusclient.NewQueryOption("quick_setup").
	WithIDs(column.NewColumnInt64("id", []int64{1, 2, 3})))
if err != nil {
	// handle error
}

fmt.Println(rs.GetColumn("id"))
```
