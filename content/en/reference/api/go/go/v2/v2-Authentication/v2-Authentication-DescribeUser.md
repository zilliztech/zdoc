---
title: "DescribeUser | Go | v2"
slug: /go/go/v2-Authentication-DescribeUser
sidebar_label: "DescribeUser"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns detailed information about a user, including their assigned roles. | Go | v2"
type: docx
token: PQHKdFLGXohyD3xIjALcEDa7n6g
sidebar_position: 7
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeUser
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeUser

This operation returns detailed information about a user, including their assigned roles.

```go
func (c *Client) DescribeUser(ctx context.Context, opt DescribeUserOption, callOpts ...grpc.CallOption) (*entity.User, error)
```

## Request Syntax\{#request-syntax}

Creates the request for DescribeUser().

```go
option := milvusclient.NewDescribeUserOption(userName)

result, err := client.DescribeUser(ctx, option)
```

**PARAMETERS:**

- **userName** (*string*) -

    **[REQUIRED]**

    The name of the user.

**BUILDER METHODS:**

- `NewDescribeUserOption(userName)`

    Creates the request for DescribeUser().

**RETURN TYPE:**

&ast;*entity.User, error*

**RETURNS:**

The user description including assigned roles. Returns an error if the operation fails.

```go
type User struct {
    UserName string
    Roles []string
}
```

**PARAMETERS:**

- **UserName** (*string*) -

    The name of the user.

- **Roles** (*[]string*) -

    The list of assigned roles.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DescribeUser() usage.

```go
import (
	"context"
	"fmt"

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

user, err := cli.DescribeUser(ctx, milvusclient.NewDescribeUserOption("my_user"))
if err != nil {
	// handle error
}
fmt.Println(user)
```
