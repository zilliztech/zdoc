---
title: "AddFunctionField | Go | v2"
slug: /go/go/v2-Collection-AddFunctionField
sidebar_label: "AddFunctionField"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a function field to an existing collection after validating the field and function options on the client. | Go | v2"
type: docx
token: Tn98dTncaoafNVxRazGc47auneY
sidebar_position: 27
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - AddFunctionField
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AddFunctionField

This operation adds a function field to an existing collection after validating the field and function options on the client.

```go
func (c *Client) AddFunctionField(ctx context.Context, opt AddFunctionFieldOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for AddFunctionField().

```go
option := milvusclient.NewAddFunctionFieldOption(collectionName, field, function, boundIndex).
    WithIndexName(indexName)

err := client.AddFunctionField(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **field** (&ast;*entity.Field*) -

    **[REQUIRED]**

    The field for AddFunctionField.

- **function** (&ast;*entity.Function*) -

    **[REQUIRED]**

    The function for AddFunctionField.

- **boundIndex** (*index.Index*) -

    **[REQUIRED]**

    The boundIndex for AddFunctionField.

**BUILDER METHODS:**

- `NewAddFunctionFieldOption(collectionName string, field *entity.Field, function *entity.Function, boundIndex index.Index)`

    Creates options to add a function field. `field` defines the function output field, `function` describes the built-in function (BM25 or MinHash), and `boundIndex` is the index bound to the output field.

- `WithIndexName(indexName string)`

    Sets the name of the index bound to the function output field.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the function field is added. Returns an error when client-side validation or the RPC fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Validation, request construction, or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates AddFunctionField() usage.

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

outputField := entity.NewField().
	WithName("sparse_vector").
	WithDataType(entity.FieldTypeSparseVector)

fn := entity.NewFunction().
	WithName("bm25_fn").
	WithType(entity.FunctionTypeBM25).
	WithInputFields("text").
	WithOutputFields("sparse_vector")

boundIndex := index.NewSparseInvertedIndex(entity.IP, 0.2)

err = cli.AddFunctionField(ctx, milvusclient.NewAddFunctionFieldOption("books", outputField, fn, boundIndex).
	WithIndexName("bm25_index"))
if err != nil {
	// handle error
}
```
