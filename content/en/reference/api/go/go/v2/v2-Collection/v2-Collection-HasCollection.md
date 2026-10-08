---
title: "HasCollection | Go | v2"
slug: /go/go/v2-Collection-HasCollection
sidebar_label: "HasCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation checks whether a collection exists in the connected Milvus instance. | Go | v2"
type: docx
token: T0tQdxsOBolMhFxvjTZcukxHnqh
sidebar_position: 19
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - HasCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HasCollection

This operation checks whether a collection exists in the connected Milvus instance.

```go
func (c *Client) HasCollection(ctx context.Context, option HasCollectionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## Request Syntax\{#request-syntax}

Creates the request for HasCollection().

```go
option := milvusclient.NewHasCollectionOption(collectionName)

result, err := client.HasCollection(ctx, option)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    The name of the collection to create.

**BUILDER METHODS:**

- `NewHasCollectionOption(name string)`

    Creates options to check whether a collection exists. `name` specifies the collection to check.

**RETURN TYPE:**

*has bool, err error*

**RETURNS:**

A boolean indicating whether the collection exists. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*has bool*) -

    The has bool value returned by HasCollection().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates HasCollection() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

result, err := cli.HasCollection(ctx, milvusclient.NewHasCollectionOption("books"))
if err != nil {
	// handle error
}
fmt.Println(result)
```
