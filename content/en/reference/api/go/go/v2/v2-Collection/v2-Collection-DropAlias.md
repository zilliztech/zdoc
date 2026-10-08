---
title: "DropAlias | Go | v2"
slug: /go/go/v2-Collection-DropAlias
sidebar_label: "DropAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes a collection alias. | Go | v2"
type: docx
token: Y0S5dzY9coF6EDxHhBkcBKXhnJh
sidebar_position: 12
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - DropAlias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropAlias

This operation removes a collection alias.

```go
func (c *Client) DropAlias(ctx context.Context, option DropAliasOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropAlias().

```go
option := milvusclient.NewDropAliasOption(alias)

err := client.DropAlias(ctx, option)
```

**PARAMETERS:**

- **alias** (*string*) -

    **[REQUIRED]**

    The alias name to assign.

**BUILDER METHODS:**

- `NewDropAliasOption(alias string)`

    Creates the request for DropAlias().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DropAlias() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

err = cli.DropAlias(ctx, milvusclient.NewDropAliasOption("alice"))
if err != nil {
	// handle error
}
```
