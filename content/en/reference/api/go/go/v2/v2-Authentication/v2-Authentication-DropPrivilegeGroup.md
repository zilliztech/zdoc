---
title: "DropPrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-DropPrivilegeGroup
sidebar_label: "DropPrivilegeGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops a privilege group. | Go | v2"
type: docx
token: Vt7adLFyNoUVsJxfYpdcDdVanae
sidebar_position: 8
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - DropPrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropPrivilegeGroup

This operation drops a privilege group.

```go
func (c *Client) DropPrivilegeGroup(ctx context.Context, option DropPrivilegeGroupOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropPrivilegeGroup().

```go
option := milvusclient.NewDropPrivilegeGroupOption(groupName)

err := client.DropPrivilegeGroup(ctx, option)
```

**PARAMETERS:**

- **groupName** (*string*) -

    **[REQUIRED]**

    The name of the privilege group.

**BUILDER METHODS:**

- `NewDropPrivilegeGroupOption(groupName)`

    Creates the request for DropPrivilegeGroup().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DropPrivilegeGroup() usage.

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

err = cli.DropPrivilegeGroup(ctx, milvusclient.NewDropPrivilegeGroupOption("my_priv_group"))
if err != nil {
	// handle error
}
```
