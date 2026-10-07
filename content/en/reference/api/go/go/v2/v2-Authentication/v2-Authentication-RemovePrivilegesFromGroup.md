---
title: "RemovePrivilegesFromGroup | Go | v2"
slug: /go/go/v2-Authentication-RemovePrivilegesFromGroup
sidebar_label: "RemovePrivilegesFromGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes one or more privileges from an existing privilege group. | Go | v2"
type: docx
token: Dzrhd3WaMoODFkxhtcucUCvCn9c
sidebar_position: 19
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - RemovePrivilegesFromGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RemovePrivilegesFromGroup

This operation removes one or more privileges from an existing privilege group.

```go
func (c *Client) RemovePrivilegesFromGroup(ctx context.Context, option RemovePrivilegeFromGroupOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for RemovePrivilegesFromGroup().

```go
option := milvusclient.NewRemovePrivilegesFromGroupOption(groupName, privilegeNames...)

err := client.RemovePrivilegesFromGroup(ctx, option)
```

**PARAMETERS:**

- **groupName** (*string*) -

    **[REQUIRED]**

    The name of the privilege group.

- **privileges** (*...string*) -

    **[REQUIRED]**

    The names of the privileges to remove from the group.

**BUILDER METHODS:**

- `NewRemovePrivilegesFromGroupOption(groupName string, privileges ...string)`

    Creates a new option to remove privileges from a privilege group.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates RemovePrivilegesFromGroup() usage.

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

err = cli.RemovePrivilegesFromGroup(ctx, milvusclient.NewRemovePrivilegesFromGroupOption("my_priv_group", "Query"))
if err != nil {
	// handle error
}
```
