---
title: "CreateRole | Go | v2"
slug: /go/go/v2-Authentication-CreateRole
sidebar_label: "CreateRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a new role for access control. | Go | v2"
type: docx
token: P8PRdHt2soM6rfxHbJacm4iWnYf
sidebar_position: 4
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - CreateRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateRole

This operation creates a new role for access control.

```go
func (c *Client) CreateRole(ctx context.Context, opt CreateRoleOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for CreateRole().

```go
option := milvusclient.NewCreateRoleOption(roleName)

err := client.CreateRole(ctx, option)
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of the role.

**BUILDER METHODS:**

- `NewCreateRoleOption(roleName)`

    Creates the request for CreateRole().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates CreateRole() usage.

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

err = cli.CreateRole(ctx, milvusclient.NewCreateRoleOption("my_role"))
if err != nil {
	// handle error
}
```
