---
title: "ListFileResources | Go | v2"
slug: /go/go/v2-FileResources-ListFileResources
sidebar_label: "ListFileResources"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all remote files registered with Milvus. | Go | v2"
type: docx
token: Ubf9dGyiLoRBOyxHBktcvGAdndg
sidebar_position: 3
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - ListFileResources
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListFileResources

This operation lists all remote files registered with Milvus.

```go
func (c *Client) ListFileResources(ctx context.Context, option ListFileResourcesOption, callOptions ...grpc.CallOption) ([]*entity.FileResource, error)
```

## Request Syntax\{#request-syntax}

Creates the request for ListFileResources().

```go
option := milvusclient.NewListFileResourcesOption()

resources, err := cli.ListFileResources(ctx, option)
```

**BUILDER METHODS:**

- `NewListFileResourcesOption()`

    Creates a new option for listing registered files.

**RETURN TYPE:**

<em>[]</em>entity.FileResource, error&ast;

**RETURNS:**

A list of [entity.FileResource](./v2-FileResources-FileResource) records, each with `ID`, `Name`, and `Path` fields. Returns an error if the operation fails.

```go
type FileResource struct {
    ID   int64
    Name string
    Path string
}
```

**PARAMETERS:**

- **ID** (*int64*) -

    The unique identifier of the file resource.

- **Name** (*string*) -

    The name of the file resource.

- **Path** (*string*) -

    The path of the file resource.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates ListFileResources() usage.

```go
import (
	"context"
	"fmt"

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

resources, err := cli.ListFileResources(ctx, milvusclient.NewListFileResourcesOption())
if err != nil {
	// handle error
}

for _, resource := range resources {
	fmt.Printf("ID: %d, Name: %s, Path: %s\n", resource.ID, resource.Name, resource.Path)
}
```
