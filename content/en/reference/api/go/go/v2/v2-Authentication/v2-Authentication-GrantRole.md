---
title: "GrantRole | Go | v2"
slug: /go/go/v2-Authentication-GrantRole
sidebar_label: "GrantRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation assigns a role to a user. | Go | v2"
type: docx
token: PXoWdX9cPoJapOxK9kbcE2S6nVh
sidebar_position: 13
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - GrantRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantRole

This operation assigns a role to a user.

```go
func (c *Client) GrantRole(ctx context.Context, opt GrantRoleOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for GrantRole().

```go
option := milvusclient.NewGrantRoleOption(userName, roleName)

err := client.GrantRole(ctx, option)
```

**PARAMETERS:**

- **userName** (*string*) -

    **[REQUIRED]**

    The name of the user.

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of the role.

**BUILDER METHODS:**

- `NewGrantRoleOption(userName string, roleName string)`

    Creates the request for GrantRole().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates GrantRole() usage.

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

err = cli.GrantRole(ctx, milvusclient.NewGrantRoleOption("my_user", "my_role"))
if err != nil {
	// handle error
}
```
