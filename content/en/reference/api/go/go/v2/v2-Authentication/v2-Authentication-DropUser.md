---
title: "DropUser() | Go | v2"
slug: /go/go/v2-Authentication-DropUser
sidebar_label: "DropUser()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a user from the system. | Go | v2"
type: docx
token: QM8QdP63jofHxkxwxSEcXVXZnKX
sidebar_position: 10
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - DropUser()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropUser()

This operation drops a user from the system.

```go
func (c *Client) DropUser(ctx context.Context, opt DropUserOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewDropUserOption(userName)

err := client.DropUser(ctx, option)
```

**PARAMETERS:**

- **userName** (*string*)

    The name of the user.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"

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

err = cli.DropUser(ctx, milvusclient.NewDropUserOption("my_user"))
if err != nil {
	// handle error
}
```
