---
title: "Delete | Go | v2"
slug: /go/go/v2-Vector-Delete
sidebar_label: "Delete"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation deletes entities from a collection by primary key values or filter expression. | Go | v2"
type: docx
token: UsNSd8reIoOaBCxH2s7cvMIDnUf
sidebar_position: 6
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - Delete
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Delete

This operation deletes entities from a collection by primary key values or filter expression.

```go
func (c *Client) Delete(ctx context.Context, option DeleteOption, callOptions ...grpc.CallOption) (DeleteResult, error)
```

## Request Syntax\{#request-syntax}

Creates the request for Delete().

```go
option := milvusclient.NewDeleteOption(collectionName).
    WithExpr(expr).
    WithInt64IDs(fieldName, ids).
    WithStringIDs(fieldName, ids).
    WithPartition(partitionName)

result, err := client.Delete(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewDeleteOption(collectionName string)`

    Creates the request for Delete().

- `WithExpr(expr string)`

    Sets the expr for the operation.

- `WithTemplateParam(key string, val any)`

    Sets a template parameter for expression evaluation.

- `WithInt64IDs(fieldName string, ids []int64)`

    Sets the int64 IDs for the operation.

- `WithStringIDs(fieldName string, ids []string)`

    Sets the string IDs for the operation.

- `WithPartition(partitionName string)`

    Sets the partition for the operation.

- `WithNamespace(namespace string)`

    Scopes the delete to a collection namespace.

**RETURN TYPE:**

*DeleteResult, error*

**RETURNS:**

The delete result. Returns an error if the operation fails.

```go
type DeleteResult struct {
    DeleteCount int64
}
```

**PARAMETERS:**

- **DeleteCount** (*int64*) -

    The number of affected entities.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates Delete() usage.

```go
import (
	"context"
	"fmt"

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

res, err := cli.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
	WithInt64IDs("id", []int64{1, 2, 3}))
if err != nil {
	// handle error
}

fmt.Println(res.DeleteCount)
```
