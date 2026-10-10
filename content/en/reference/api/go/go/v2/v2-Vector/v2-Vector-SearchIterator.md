---
title: "SearchIterator | Go | v2"
slug: /go/go/v2-Vector-SearchIterator
sidebar_label: "SearchIterator"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a search iterator that retrieves ANN search results in batches. Use this for large result sets that should not be loaded into memory all at once. | Go | v2"
type: docx
token: O8iodvuRpoZswVxoC8Ncq2Wlnqf
sidebar_position: 17
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - SearchIterator
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# SearchIterator

This operation creates a search iterator that retrieves ANN search results in batches. Use this for large result sets that should not be loaded into memory all at once.

```go
func (c *Client) SearchIterator(ctx context.Context, option SearchIteratorOption, callOptions ...grpc.CallOption) (SearchIterator, error)
```

## Request Syntax\{#request-syntax}

Creates the request for SearchIterator().

```go
client.SearchIterator(ctx, milvusclient.NewSearchIteratorOption(collectionName, vector).
    WithBatchSize(batchSize).
    WithIteratorLimit(limit).
    WithPartitions(partitionNames...).
    WithFilter(expr).
    WithOutputFields(fieldNames...).
    WithConsistencyLevel(consistencyLevel).
    WithANNSField(annsField).
    WithAnnParam(ap),
)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **vector** (*entity.Vector*) -

    **[REQUIRED]**

    The query vector to search with.

**BUILDER METHODS:**

- `NewSearchIteratorOption(collectionName string, vector entity.Vector)`

    **[REQUIRED]** Creates a new search iterator option for the specified collection and query vector.

- `WithBatchSize(batchSize int)`

    The number of entities to return per iteration batch. Default: `1000`.

- `WithIteratorLimit(limit int64)`

    The maximum total number of entities to iterate over. A negative value means unlimited. Default: `Unlimited` (-1).

- `WithPartitions(partitionNames ...string)`

    The partitions to search. If not specified, all partitions are searched.

- `WithNamespace(namespace string)`

    Scopes the search iterator to a collection namespace.

- `WithFilter(expr string)`

    A boolean expression to filter entities. Only entities matching the expression are returned.

- `WithTemplateParam(key string, val any)`

    Sets a template parameter for expression evaluation.

- `WithOffset(offset int)`

    Sets the number of results to skip before returning matches.

- `WithOutputFields(fieldNames ...string)`

    The fields to include in the returned entities.

- `WithConsistencyLevel(consistencyLevel entity.ConsistencyLevel)`

    The consistency level for the search. Default: `Bounded`.

- `WithANNSField(annsField string)`

    Specifies the vector field to search on when a collection has multiple vector fields.

- `WithGroupByField(groupByField string)`

    Groups search results by the specified field.

- `WithGroupSize(groupSize int)`

    Sets the number of results to return per group when grouping is enabled.

- `WithStrictGroupSize(strictGroupSize bool)`

    Enforces strict group size limits.

- `WithIgnoreGrowing(ignoreGrowing bool)`

    Ignores growing segments during the search.

- `WithAnnParam(ap index.AnnParam)`

    Sets the approximate nearest neighbor search parameters (e.g., nprobe, ef).

- `WithSearchParam(key, value string)`

    Sets a custom search parameter key-value pair.

**RETURN TYPE:**

**SearchIterator, error**

**RETURNS:**

*SearchIterator, error* The SearchIterator interface provides paginated access to search results. Call `Next()` repeatedly until `io.EOF` is returned.

**PARAMETERS:**

- **result** (&ast;*SearchIterator*) -

    The &ast;SearchIterator value returned by SearchIterator().

**ERROR HANDLING:**

- **error**

    The operation fails. The specified collection does not exist, the server does not support search iterators, invalid parameters, or the server is unreachable.

## Example\{#example}

Demonstrates SearchIterator() usage.

```go
import (
	"context"
	"fmt"
	"io"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

queryVector := entity.FloatVector([]float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835})

iter, err := cli.SearchIterator(ctx, milvusclient.NewSearchIteratorOption("quick_setup", queryVector).
	WithBatchSize(500).
	WithIteratorLimit(1000),
)
if err != nil {
	// handle error
}

for {
	rs, err := iter.Next(ctx)
	if err == io.EOF {
		break
	}
	if err != nil {
		// handle error
	}
	fmt.Printf("Got %d results\n", rs.Len())
}
```
