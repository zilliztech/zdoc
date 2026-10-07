---
title: "CreatePrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-CreatePrivilegeGroup
sidebar_label: "CreatePrivilegeGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a named group of privileges that can be granted together. | Go | v2"
type: docx
token: CUNxd572AoblwWxPx5SclwaOn5f
sidebar_position: 3
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - zilliz
  - zilliz cloud
  - cloud
  - CreatePrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreatePrivilegeGroup

This operation creates a named group of privileges that can be granted together.

```go
func (c *Client) CreatePrivilegeGroup(ctx context.Context, option CreatePrivilegeGroupOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for CreatePrivilegeGroup().

```go
option := milvusclient.NewCreatePrivilegeGroupOption(groupName)

err := client.CreatePrivilegeGroup(ctx, option)
```

**PARAMETERS:**

- **groupName** (*string*) -

    **[REQUIRED]**

    The name of the privilege group.

**BUILDER METHODS:**

- `NewCreatePrivilegeGroupOption(groupName)`

    Creates the request for CreatePrivilegeGroup().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates CreatePrivilegeGroup() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.CreatePrivilegeGroup(ctx, milvusclient.NewCreatePrivilegeGroupOption("my_priv_group"))
if err != nil {
	// handle error
}
```
