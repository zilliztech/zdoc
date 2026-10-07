---
title: "RevokePrivilege | Go | v2"
slug: /go/go/v2-Authentication-RevokePrivilege
sidebar_label: "RevokePrivilege"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation revokes a specific privilege from a role. | Go | v2"
type: docx
token: RPbodXeOeoeiH6xVLdVcZUsenlb
sidebar_position: 21
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - RevokePrivilege
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RevokePrivilege

This operation revokes a specific privilege from a role.

```go
func (c *Client) RevokePrivilege(ctx context.Context, option RevokePrivilegeOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for RevokePrivilege().

```go
option := milvusclient.NewRevokePrivilegeOption(roleName, objectType, privilegeName, objectName).
    WithDbName(dbName)

err := client.RevokePrivilege(ctx, option)
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of the role.

- **objectType** (*string*) -

    **[REQUIRED]**

    The type of object the privilege applies to (e.g., Global, Collection).

- **privilegeName** (*string*) -

    **[REQUIRED]**

    The name of the privilege.

- **objectName** (*string*) -

    **[REQUIRED]**

    The name of the object the privilege applies to.

**BUILDER METHODS:**

- `NewRevokePrivilegeOption(roleName string, objectType string, privilegeName string, objectName string)`

    Creates the request for RevokePrivilege().

- `WithDbName(dbName string)`

    Specifies the database to use for the operation.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates RevokePrivilege() usage.

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

err = cli.RevokePrivilege(ctx, milvusclient.NewRevokePrivilegeOption("my_role", "Collection", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```
