---
title: "DropIndex | Go | v2"
slug: /go/go/v2-Management-DropIndex
sidebar_label: "DropIndex"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops an index from a collection field. | Go | v2"
type: docx
token: Fjo3dPXt5o62BPxPefHcUFbtnoc
sidebar_position: 7
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - DropIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropIndex

This operation drops an index from a collection field.

```go
func (c *Client) DropIndex(ctx context.Context, opt DropIndexOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropIndex().

```go
option := milvusclient.NewDropIndexOption(collectionName, indexName)

err := client.DropIndex(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **indexName** (*string*) -

    **[REQUIRED]**

    The name of the index.

**BUILDER METHODS:**

- `NewDropIndexOption(collectionName string, indexName string)`

    Creates the request for DropIndex().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DropIndex() usage.

```go
import (
	"context"

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

err = cli.DropIndex(ctx, milvusclient.NewDropIndexOption("my_collection", "my_index"))
if err != nil {
	// handle err
}
```
