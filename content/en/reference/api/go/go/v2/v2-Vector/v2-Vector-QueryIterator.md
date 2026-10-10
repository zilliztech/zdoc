---
title: "QueryIterator | Go | v2"
slug: /go/go/v2-Vector-QueryIterator
sidebar_label: "QueryIterator"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a query iterator that retrieves matching entities from a collection in batches. Use this for large result sets that should not be loaded into memory all at once. | Go | v2"
type: docx
token: AGM3dTL6Vorr6XxS3IjcBAbBnVg
sidebar_position: 13
keywords: 
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - QueryIterator
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# QueryIterator

This operation creates a query iterator that retrieves matching entities from a collection in batches. Use this for large result sets that should not be loaded into memory all at once.

```go
func (c *Client) QueryIterator(ctx context.Context, option QueryIteratorOption, callOptions ...grpc.CallOption) (QueryIterator, error)
```

## Request Syntax\{#request-syntax}

Creates the request for QueryIterator().

```go
client.QueryIterator(ctx, milvusclient.NewQueryIteratorOption(collectionName).
    WithBatchSize(batchSize).
    WithPartitions(partitionNames...).
    WithFilter(expr).
    WithOutputFields(fieldNames...).
    WithConsistencyLevel(consistencyLevel).
    WithIteratorLimit(limit),
)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the collection to query.

**BUILDER METHODS:**

- `NewQueryIteratorOption(collectionName string)`

    Creates a new query iterator option for the specified collection.

- `WithBatchSize(batchSize int)`

    The number of entities to return per iteration batch. Default: `1000`.

- `WithPartitions(partitionNames ...string)`

    The partitions to query. If not specified, all partitions are queried.

- `WithNamespace(namespace string)`

    Scopes the query iterator to a collection namespace.

- `WithFilter(expr string)`

    A boolean expression to filter entities. Only entities matching the expression are returned.

- `WithOutputFields(fieldNames ...string)`

    The fields to include in the returned entities. If not specified, only the primary key field is returned.

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`

    The consistency level for the query. Default: `Bounded`.

- `WithIteratorLimit(limit int64)`

    The maximum total number of entities to iterate over. A negative value means unlimited. Default: `Unlimited` (-1).

**RETURN TYPE:**

&ast;*QueryIterator, error*

**RETURNS:**

*QueryIterator, error* The QueryIterator interface provides paginated access to query results. Call `Next()` repeatedly until `io.EOF` is returned.

**PARAMETERS:**

- **result** (&ast;*QueryIterator*) -

    The &ast;QueryIterator value returned by QueryIterator().

**ERROR HANDLING:**

- **error**

    The operation fails. The specified collection does not exist, invalid parameters, or the server is unreachable.

## Example\{#example}

Demonstrates QueryIterator() usage.

```go
import (
    "context"
    "fmt"
    "io"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

iter, err := client.QueryIterator(ctx,
    milvusclient.NewQueryIteratorOption("my_collection").
        WithBatchSize(500).
        WithFilter("age > 18").
        WithOutputFields("name", "age"),
)
if err != nil {
    log.Fatal(err)
}

for {
    rs, err := iter.Next(ctx)
    if err == io.EOF {
        break
    }
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Got %d results\n", rs.Len())
}
```
