---
title: "ListRoles | Go | v2"
slug: /go/go/v2-Authentication-ListRoles
sidebar_label: "ListRoles"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the names of all roles. | Go | v2"
type: docx
token: AwuYdyq81ob9TKx3BEPcww6fnxb
sidebar_position: 15
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - ListRoles
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListRoles

This operation returns the names of all roles.

```go
func (c *Client) ListRoles(ctx context.Context, opt ListRoleOption, callOpts ...grpc.CallOption) ([]string, error)
```

## Request Syntax\{#request-syntax}

Creates the request for ListRoles().

```go
option := milvusclient.NewListRoleOption()

result, err := client.ListRoles(ctx, option)
```

**PARAMETERS:**

- **option** (*ListRoleOption*) -

    The options for listing the roles. Use `NewListRoleOption` to construct.

**BUILDER METHODS:**

- `NewListRoleOption()`

    Creates options to list all roles.

**RETURN TYPE:**

*[]string, error*

**RETURNS:**

A list of role names. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*[]string*) -

    The []string value returned by ListRoles().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates ListRoles() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

roles, err := cli.ListRoles(ctx, milvusclient.NewListRoleOption())
if err != nil {
	// handle error
}
fmt.Println(roles)
```
