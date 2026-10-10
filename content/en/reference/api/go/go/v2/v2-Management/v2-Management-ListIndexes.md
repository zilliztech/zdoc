---
title: "ListIndexes | Go | v2"
slug: /go/go/v2-Management-ListIndexes
sidebar_label: "ListIndexes"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all indexes built on a specified collection. | Go | v2"
type: docx
token: R53fdYWNAorBuUxdrF7cSuovnnf
sidebar_position: 16
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - ListIndexes
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListIndexes

This operation lists all indexes built on a specified collection.

```go
func (c *Client) ListIndexes(ctx context.Context, opt ListIndexOption, callOptions ...grpc.CallOption) ([]string, error)
```

## Request Syntax\{#request-syntax}

Creates the request for ListIndexes().

```go
option := milvusclient.NewListIndexOption(collectionName).
    WithFieldName(fieldName)

result, err := client.ListIndexes(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewListIndexOption(collectionName string)`

    Creates the request for ListIndexes().

- `WithFieldName(fieldName string)`

    Sets the field name for the operation.

**RETURN TYPE:**

*[]string, error*

**RETURNS:**

A list of index names. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*[]string*) -

    The []string value returned by ListIndexes().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates ListIndexes() usage.

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
	// handle err
}

indexes, err := cli.ListIndexes(ctx, milvusclient.NewListIndexOption("my_collection").WithFieldName("my_vector"))
if err != nil {
	// handle err
}
fmt.Println(indexes)
```
