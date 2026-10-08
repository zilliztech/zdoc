---
title: "CreateAlias | Go | v2"
slug: /go/go/v2-Collection-CreateAlias
sidebar_label: "CreateAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates an alias for a collection, allowing you to reference it by an alternative name. | Go | v2"
type: docx
token: YJuQdfyRfonHrTxLh6ucA3EDnQf
sidebar_position: 8
keywords: 
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - CreateAlias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateAlias

This operation creates an alias for a collection, allowing you to reference it by an alternative name.

```go
func (c *Client) CreateAlias(ctx context.Context, option CreateAliasOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for CreateAlias().

```go
option := milvusclient.NewCreateAliasOption(collectionName, alias)

err := client.CreateAlias(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **alias** (*string*) -

    **[REQUIRED]**

    The alias name to assign.

**BUILDER METHODS:**

- `NewCreateAliasOption(collectionName string, alias string)`

    Creates the request for CreateAlias().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates CreateAlias() usage.

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

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "bob"))
if err != nil {
	// handle error
}

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "alice"))
if err != nil {
	// handle error
}
```
