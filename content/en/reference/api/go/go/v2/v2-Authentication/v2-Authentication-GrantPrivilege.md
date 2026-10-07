---
title: "GrantPrivilege | Go | v2"
slug: /go/go/v2-Authentication-GrantPrivilege
sidebar_label: "GrantPrivilege"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation grants a privilege to a role using the v1 API with explicit object type and object name. For the simplified v2 API, use `GrantPrivilegeV2()`. | Go | v2"
type: docx
token: DgJjdMnqgoBVB5xd6cgcMl4VnCh
sidebar_position: 11
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - GrantPrivilege
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilege

This operation grants a privilege to a role using the v1 API with explicit object type and object name. For the simplified v2 API, use `GrantPrivilegeV2()`.

```go
func (c *Client) GrantPrivilege(ctx context.Context, option GrantPrivilegeOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for GrantPrivilege().

```go
option := milvusclient.NewGrantPrivilegeOption(roleName, objectType, privilegeName, objectName).
    WithDbName(dbName)

err := client.GrantPrivilege(ctx, option)
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

- `NewGrantPrivilegeOption(roleName string, objectType string, privilegeName string, objectName string)`

    Creates a new option to grant a privilege to a role.

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

Demonstrates GrantPrivilege() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

err = cli.GrantPrivilege(ctx, milvusclient.NewGrantPrivilegeOption("my_role", "Collection", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```
