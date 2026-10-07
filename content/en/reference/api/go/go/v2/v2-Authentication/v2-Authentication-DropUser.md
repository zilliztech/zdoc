---
title: "DropUser | Go | v2"
slug: /go/go/v2-Authentication-DropUser
sidebar_label: "DropUser"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops a user from the system. | Go | v2"
type: docx
token: DwNPdAshLoAsYvxrs4lcQCe0n4g
sidebar_position: 10
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - DropUser
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropUser

This operation drops a user from the system.

```go
func (c *Client) DropUser(ctx context.Context, opt DropUserOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropUser().

```go
option := milvusclient.NewDropUserOption(userName)

err := client.DropUser(ctx, option)
```

**PARAMETERS:**

- **userName** (*string*) -

    **[REQUIRED]**

    The name of the user.

**BUILDER METHODS:**

- `NewDropUserOption(userName string)`

    Creates the request for DropUser().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DropUser() usage.

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

err = cli.DropUser(ctx, milvusclient.NewDropUserOption("my_user"))
if err != nil {
	// handle error
}
```
