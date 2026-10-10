---
title: "CreateIndex | Go | v2"
slug: /go/go/v2-Management-CreateIndex
sidebar_label: "CreateIndex"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates an index on a specified field of a collection and returns a task to track its progress. | Go | v2"
type: docx
token: Rrx1dlCBVocbLIxGCBycLTScnUg
sidebar_position: 4
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - CreateIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateIndex

This operation creates an index on a specified field of a collection and returns a task to track its progress.

```go
func (c *Client) CreateIndex(ctx context.Context, option CreateIndexOption, callOptions ...grpc.CallOption) (*CreateIndexTask, error)
```

## Request Syntax\{#request-syntax}

Creates the request for CreateIndex().

```go
option := milvusclient.NewCreateIndexOption(collectionName, fieldName, idx).
    WithIndexName(indexName)

task, err := client.CreateIndex(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **fieldName** (*string*) -

    **[REQUIRED]**

    The fieldName for CreateIndex.

- **index** (*index.Index*) -

    **[REQUIRED]**

    The index for CreateIndex.

**BUILDER METHODS:**

- `NewCreateIndexOption(collectionName string, fieldName string, index index.Index)`

    Creates options to build an index. `collectionName` specifies the collection, `fieldName` specifies the field to index, and `index` defines the index type and parameters.

- `WithIndexName(indexName string)`

    Sets the name of the index to create.

- `WithExtraParam(key string, value any)`

    Adds an extra index build parameter key-value pair. This method mutates the option in place and does not return the option, so it cannot be chained.

**RETURN TYPE:**

*CreateIndexTask, error*

**RETURNS:**

A CreateIndexTask that can be used to wait for the index build to complete. Returns an error if the operation fails.

**PARAMETERS:**

- **result** ([CreateIndexTask](./v2-Management-CreateIndexTask)) -

    The CreateIndexTask value returned by CreateIndex().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates CreateIndex() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

idx := index.NewAutoIndex(entity.COSINE)

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "vector", idx).
	WithIndexName("vector_index"))
if err != nil {
	// handle error
}

// sync wait index to be created
err = task.Await(ctx)
if err != nil {
	// handle error
}
```
