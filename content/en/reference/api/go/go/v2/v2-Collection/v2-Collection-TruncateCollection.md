---
title: "TruncateCollection | Go | v2"
slug: /go/go/v2-Collection-TruncateCollection
sidebar_label: "TruncateCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes all data from a collection while keeping its schema. | Go | v2"
type: docx
token: CNcvdxPmgo6P3nx6t1tcW4R6nXf
sidebar_position: 25
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - TruncateCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# TruncateCollection

This operation removes all data from a collection while keeping its schema.

```go
func (c *Client) TruncateCollection(ctx context.Context, option TruncateCollectionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for TruncateCollection().

```go
option := milvusclient.NewTruncateCollectionOption(collectionName)

err := client.TruncateCollection(ctx, option)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    The name of the collection to create.

**BUILDER METHODS:**

- `NewTruncateCollectionOption(name string)`

    Creates options to truncate a collection. `name` specifies the collection to truncate.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the collection is truncated. Returns an error if the operation fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Request construction or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates TruncateCollection() usage.

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

err = cli.TruncateCollection(ctx, milvusclient.NewTruncateCollectionOption("books"))
if err != nil {
	// handle error
}
```
