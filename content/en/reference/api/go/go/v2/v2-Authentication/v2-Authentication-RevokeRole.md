---
title: "RevokeRole | Go | v2"
slug: /go/go/v2-Authentication-RevokeRole
sidebar_label: "RevokeRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes a role from a user. | Go | v2"
type: docx
token: OuG9dQJKJoMzmOxOoNNcdDRDnJd
sidebar_position: 23
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - RevokeRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RevokeRole

This operation removes a role from a user.

```go
func (c *Client) RevokeRole(ctx context.Context, opt RevokeRoleOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for RevokeRole().

```go
option := milvusclient.NewRevokeRoleOption(userName, roleName)

err := client.RevokeRole(ctx, option)
```

**PARAMETERS:**

- **userName** (*string*) -

    **[REQUIRED]**

    The name of the user.

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of the role.

**BUILDER METHODS:**

- `NewRevokeRoleOption(userName string, roleName string)`

    Creates the request for RevokeRole().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates RevokeRole() usage.

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

err = cli.RevokeRole(ctx, milvusclient.NewRevokeRoleOption("my_user", "my_role"))
if err != nil {
	// handle error
}
```
