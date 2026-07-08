---
title: "DescribeRole() | Go | v2"
slug: /go/go/v2-Authentication-DescribeRole
sidebar_label: "DescribeRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns detailed information about a role, including its granted privileges. | Go | v2"
type: docx
token: EAs8dmRIuoMvW5xXLHdcDw2Gn0d
sidebar_position: 6
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeRole()

This operation returns detailed information about a role, including its granted privileges.

```go
func (c *Client) DescribeRole(ctx context.Context, option DescribeRoleOption, callOptions ...grpc.CallOption) (*entity.Role, error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewDescribeRoleOption(roleName).
    WithDbName(dbName)

result, err := client.DescribeRole(ctx, option)
```

**PARAMETERS:**

- **roleName** (*string*)

    The name of the role.

**OPTION METHODS:**

- `WithDbName(dbName string)`

    Specifies the database to use for the operation.

**RETURN TYPE:**

**[entity.Role](./v2-Authentication-Role), error*

**RETURNS:**

The role details including granted privileges. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

role, err := cli.DescribeRole(ctx, milvusclient.NewDescribeRoleOption("my_role"))
if err != nil {
	// handle error
}
fmt.Println(role)
```
