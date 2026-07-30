---
title: "UpdatePassword() | Go | v2"
slug: /go/go/v2-Authentication-UpdatePassword
sidebar_label: "UpdatePassword()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation updates the password for an existing user. | Go | v2"
type: docx
token: GKDQd15KkoiLPSxs8UYcFUamnIg
sidebar_position: 25
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - UpdatePassword()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UpdatePassword()

This operation updates the password for an existing user.

```go
func (c *Client) UpdatePassword(ctx context.Context, opt UpdatePasswordOption, callOpts ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewUpdatePasswordOption(userName, oldPassword, newPassword)

err := client.UpdatePassword(ctx, option)
```

**PARAMETERS:**

- **userName** (*string*)

    The name of the user.

- **oldPassword** (*string*)

    The current password for verification.

- **newPassword** (*string*)

    The new password to set.

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

err = cli.UpdatePassword(ctx, milvusclient.NewUpdatePasswordOption("my_user", "P@ssw0rd", "NewP@ssw0rd"))
if err != nil {
	// handle error
}
```
