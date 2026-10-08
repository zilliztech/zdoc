---
title: "DropCollectionField | Go | v2"
slug: /go/go/v2-Collection-DropCollectionField
sidebar_label: "DropCollectionField"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes a field from an existing collection by field name or field ID. | Go | v2"
type: docx
token: Cx0Mdu2qio3sZpxtxlDcwPpNnEf
sidebar_position: 28
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionField
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionField

This operation removes a field from an existing collection by field name or field ID.

```go
func (c *Client) DropCollectionField(ctx context.Context, opt DropCollectionFieldOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropCollectionField().

```go
option := milvusclient.NewDropCollectionFieldOption(collectionName, fieldName)

err := client.DropCollectionField(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **fieldID** (*int64*) -

    **[REQUIRED]**

    The fieldName for DropCollectionField.

**BUILDER METHODS:**

- `NewDropCollectionFieldOption(collectionName string, fieldName string)`

    Creates options to drop a field by its name.

- `NewDropCollectionFieldByIDOption(collectionName string, fieldID int64)`

    Creates options to drop a field by its field ID. The field ID must be greater than 0.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the field is dropped. Returns an error when client-side validation or the RPC fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Validation, request construction, or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DropCollectionField() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("books", "old_field"))
if err != nil {
	// handle error
}
```
