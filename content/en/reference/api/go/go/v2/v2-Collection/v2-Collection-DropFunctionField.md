---
title: "DropFunctionField | Go | v2"
slug: /go/go/v2-Collection-DropFunctionField
sidebar_label: "DropFunctionField"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes a function from an existing collection by function name. | Go | v2"
type: docx
token: Gp7KdpBhUoFdH0xfPFUcy7A1n7e
sidebar_position: 29
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - DropFunctionField
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropFunctionField

This operation removes a function from an existing collection by function name.

```go
func (c *Client) DropFunctionField(ctx context.Context, opt DropFunctionFieldOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropFunctionField().

```go
option := milvusclient.NewDropFunctionFieldOption(collectionName, functionName)

err := client.DropFunctionField(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **functionName** (*string*) -

    **[REQUIRED]**

    The functionName for DropFunctionField.

**BUILDER METHODS:**

- `NewDropFunctionFieldOption(collectionName string, functionName string)`

    Creates options to drop a function by its name. `collectionName` specifies the collection, and `functionName` specifies the function to remove.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the function is dropped. Returns an error when client-side validation or the RPC fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Validation, request construction, or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DropFunctionField() usage.

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

err = cli.DropFunctionField(ctx, milvusclient.NewDropFunctionFieldOption("books", "bm25_fn"))
if err != nil {
	// handle error
}
```
