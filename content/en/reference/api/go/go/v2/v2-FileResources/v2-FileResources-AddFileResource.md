---
title: "AddFileResource | Go | v2"
slug: /go/go/v2-FileResources-AddFileResource
sidebar_label: "AddFileResource"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation registers a remote file with Milvus, making it available to server-side features by a named reference. | Go | v2"
type: docx
token: QDGzd5iVnoxc4jxfOGPcJDxVnKc
sidebar_position: 1
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - AddFileResource
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AddFileResource

This operation registers a remote file with Milvus, making it available to server-side features by a named reference.

```go
func (c *Client) AddFileResource(ctx context.Context, option AddFileResourceOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for AddFileResource().

```go
option := milvusclient.NewAddFileResourceOption(name, path)

err := cli.AddFileResource(ctx, option)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    The name to reference the file resource by.

- **path** (*string*) -

    **[REQUIRED]**

    The path of the remote file.

**BUILDER METHODS:**

- `NewAddFileResourceOption(name string, path string)`

    Creates a new option for registering a remote file.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error if the operation fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates AddFileResource() usage.

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

err = cli.AddFileResource(ctx, milvusclient.NewAddFileResourceOption("embedding_model", "/models/embedding.bin"))
if err != nil {
	// handle error
}
```
