---
title: "ListAliases | Go | v2"
slug: /go/go/v2-Collection-ListAliases
sidebar_label: "ListAliases"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the aliases of a specified collection. | Go | v2"
type: docx
token: RXGLdpZ23o3178xZTb4cLZBmnQd
sidebar_position: 20
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - ListAliases
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListAliases

This operation returns the aliases of a specified collection.

```go
func (c *Client) ListAliases(ctx context.Context, option ListAliasesOption, callOptions ...grpc.CallOption) ([]string, error)
```

## Request Syntax\{#request-syntax}

Creates the request for ListAliases().

```go
option := milvusclient.NewListAliasesOption(collectionName)

result, err := client.ListAliases(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewListAliasesOption(collectionName string)`

    Creates options to list the aliases of a collection. `collectionName` specifies the collection.

**RETURN TYPE:**

*[]string, error*

**RETURNS:**

A list of alias names for the collection. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*[]string*) -

    The []string value returned by ListAliases().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates ListAliases() usage.

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

result, err := cli.ListAliases(ctx, milvusclient.NewListAliasesOption("books"))
if err != nil {
	// handle error
}
fmt.Println(result)
```
