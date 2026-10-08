---
title: "AddCollectionStructField | Go | v2"
slug: /go/go/v2-Collection-AddCollectionStructField
sidebar_label: "AddCollectionStructField"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a struct-array field to an existing collection after validating the field option on the client. | Go | v2"
type: docx
token: ZSsxdrxftoPHDhxu0u6c8j2Fntm
sidebar_position: 26
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionStructField
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionStructField

This operation adds a struct-array field to an existing collection after validating the field option on the client.

```go
func (c *Client) AddCollectionStructField(ctx context.Context, opt AddCollectionStructFieldOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for AddCollectionStructField().

```go
option := milvusclient.NewAddCollectionStructFieldOption(collectionName, field)

err := client.AddCollectionStructField(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **field** (&ast;*entity.Field*) -

    **[REQUIRED]**

    The field for AddCollectionStructField.

**BUILDER METHODS:**

- `NewAddCollectionStructFieldOption(collectionName string, field *entity.Field)`

    Creates options to add a struct-array field. The field must use the Array data type with the Struct element type and include a struct schema. `collectionName` specifies the collection, and `field` defines the field to add.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the field is added. Returns an error when client-side validation or the RPC fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Validation, request construction, or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates AddCollectionStructField() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("title").WithDataType(entity.FieldTypeVarChar).WithMaxLength(256))

field := entity.NewField().
	WithName("chunks").
	WithDataType(entity.FieldTypeArray).
	WithElementType(entity.FieldTypeStruct).
	WithStructSchema(structSchema)

err = cli.AddCollectionStructField(ctx, milvusclient.NewAddCollectionStructFieldOption("books", field))
if err != nil {
	// handle error
}
```
