---
title: "AlterRole | Go | v2"
slug: /go/go/v2-Authentication-AlterRole
sidebar_label: "AlterRole"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies the description of an existing role. | Go | v2"
type: docx
token: HvS9dO1v7ofQuhx49Q3ceroCnmI
sidebar_position: 27
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - AlterRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterRole

This operation modifies the description of an existing role.

```go
func (c *Client) AlterRole(ctx context.Context, opt AlterRoleOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for AlterRole().

```go
option := milvusclient.NewAlterRoleOption(roleName).
    WithDescription(description)

err := client.AlterRole(ctx, option)
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    The options for altering the role. Use `NewAlterRoleOption` to construct.

**BUILDER METHODS:**

- `NewAlterRoleOption(roleName string)`

    Creates options to alter a role. `roleName` specifies the role to modify.

- `WithDescription(description string)`

    Sets the description of the role.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates AlterRole() usage.

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

err = cli.AlterRole(ctx, milvusclient.NewAlterRoleOption("my_role").
	WithDescription("read only role"))
if err != nil {
	// handle error
}
```
