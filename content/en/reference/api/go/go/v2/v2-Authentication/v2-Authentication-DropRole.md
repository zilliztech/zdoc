---
title: "DropRole() | Go | v2"
slug: /go/go/v2-Authentication-DropRole
sidebar_label: "DropRole()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops a role from the system. | Go | v2"
type: docx
token: QKItdAf6HoDzMVxzWEbcDVL9n5r
sidebar_position: 9
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - DropRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropRole()

This operation drops a role from the system.

```go
func (c *Client) DropRole(ctx context.Context, opt DropRoleOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropRole().

```go
option := milvusclient.NewDropRoleOption("my_role").
    WithForce(true)

err := cli.DropRole(ctx, option)
```

**PARAMETERS:**

- **roleName** (*string*) -

    The name of the role.

**BUILDER METHODS:**

- `NewDropRoleOption(roleName string)`

    Creates the request for DropRole().

- `WithForce(force bool)`

    This forces the drop operation, removing the role even if it is assigned to users or has privileges granted.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check err != nil for failure details.

## Example\{#example}

Demonstrates DropRole() usage.

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

// Drop a role normally
err = cli.DropRole(ctx, milvusclient.NewDropRoleOption("my_role"))
if err != nil {
	log.Fatal("failed to drop role: ", err.Error())
}

// Force drop a role that is still assigned
err = cli.DropRole(ctx, milvusclient.NewDropRoleOption("my_role").WithForce(true))
if err != nil {
	log.Fatal("failed to force drop role: ", err.Error())
}
```
