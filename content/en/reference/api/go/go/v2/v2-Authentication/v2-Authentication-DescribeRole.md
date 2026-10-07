---
title: "DescribeRole | Go | v2"
slug: /go/go/v2-Authentication-DescribeRole
sidebar_label: "DescribeRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns detailed information about a role, including its description and privileges. | Go | v2"
type: docx
token: TfY6dRxjhoz0hexPK8xchxQ4nsh
sidebar_position: 6
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeRole

This operation returns detailed information about a role, including its description and privileges.

```go
func (c *Client) DescribeRole(ctx context.Context, option DescribeRoleOption, callOptions ...grpc.CallOption) (*entity.Role, error)
```

## Request Syntax\{#request-syntax}

Creates the request for DescribeRole().

```go
option := milvusclient.NewDescribeRoleOption(roleName).
    WithDbName(dbName)

result, err := client.DescribeRole(ctx, option)
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    The options for describing the role. Use `NewDescribeRoleOption` to construct.

**BUILDER METHODS:**

- `NewDescribeRoleOption(roleName string)`

    Creates options to describe a role. `roleName` specifies the role to describe.

- `WithDbName(dbName string)`

    Specifies the database to use for the operation.

**RETURN TYPE:**

&ast;*entity.Role, error*

**RETURNS:**

The role description including the role name, description, and privileges. Returns an error if the role is not found or the operation fails.

```go
type Role struct {
    RoleName string
    Privileges []GrantItem
}
```

**PARAMETERS:**

- **RoleName** (*string*) -

    The name of the role.

- **Privileges** (*[]GrantItem*) -

    The list of granted privileges.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DescribeRole() usage.

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

role, err := cli.DescribeRole(ctx, milvusclient.NewDescribeRoleOption("my_role"))
if err != nil {
	// handle error
}
log.Println(role)
```
