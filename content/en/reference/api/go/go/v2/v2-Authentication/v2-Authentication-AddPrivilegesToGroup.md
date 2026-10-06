---
title: "AddPrivilegesToGroup | Go | v2"
slug: /go/go/v2-Authentication-AddPrivilegesToGroup
sidebar_label: "AddPrivilegesToGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds one or more privileges to an existing privilege group. | Go | v2"
type: docx
token: VCAedbFRIoAQS8x97rRcN32unMg
sidebar_position: 1
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - AddPrivilegesToGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AddPrivilegesToGroup

This operation adds one or more privileges to an existing privilege group.

```go
func (c *Client) AddPrivilegesToGroup(ctx context.Context, option AddPrivilegeToGroupOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for AddPrivilegesToGroup().

```go
option := milvusclient.NewAddPrivilegesToGroupOption(groupName, privilegeNames...)

err := client.AddPrivilegesToGroup(ctx, option)
```

**PARAMETERS:**

- **groupName** (*string*) -

    **[REQUIRED]**

    The name of the privilege group.

- **privileges** (*...string*) -

    **[REQUIRED]**

    The names of the privileges to add to the group.

**BUILDER METHODS:**

- `NewAddPrivilegesToGroupOption(groupName string, privileges ...string)`

    Creates a new option to add privileges to a privilege group.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates AddPrivilegesToGroup() usage.

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

err = cli.AddPrivilegesToGroup(ctx, milvusclient.NewAddPrivilegesToGroupOption("my_priv_group", "Search", "Query"))
if err != nil {
	// handle error
}
```
