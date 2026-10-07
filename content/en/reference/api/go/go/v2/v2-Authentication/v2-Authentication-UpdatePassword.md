---
title: "UpdatePassword | Go | v2"
slug: /go/go/v2-Authentication-UpdatePassword
sidebar_label: "UpdatePassword"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates the password for an existing user. | Go | v2"
type: docx
token: W0UgdXTMmoA1VVx5Cooc1Re8nnb
sidebar_position: 25
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - UpdatePassword
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UpdatePassword

This operation updates the password for an existing user.

```go
func (c *Client) UpdatePassword(ctx context.Context, opt UpdatePasswordOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for UpdatePassword().

```go
option := milvusclient.NewUpdatePasswordOption(userName, oldPassword, newPassword)

err := client.UpdatePassword(ctx, option)
```

**PARAMETERS:**

- **userName** (*string*) -

    **[REQUIRED]**

    The name of the user.

- **oldPassword** (*string*) -

    **[REQUIRED]**

    The current password for verification.

- **newPassword** (*string*) -

    **[REQUIRED]**

    The new password to set.

**BUILDER METHODS:**

- `NewUpdatePasswordOption(userName string, oldPassword string, newPassword string)`

    Creates the request for UpdatePassword().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates UpdatePassword() usage.

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

err = cli.UpdatePassword(ctx, milvusclient.NewUpdatePasswordOption("my_user", "P@ssw0rd", "NewP@ssw0rd"))
if err != nil {
	// handle error
}
```
