---
title: "GetServerVersion | Go | v2"
slug: /go/go/v2-Client-GetServerVersion
sidebar_label: "GetServerVersion"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the version of the connected Milvus server. | Go | v2"
type: docx
token: ZZ1mdvZJVoi5egxObkncej3SnUc
sidebar_position: 3
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - GetServerVersion
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersion

This operation returns the version of the connected Milvus server.

```go
func (c *Client) GetServerVersion(ctx context.Context, option GetServerVersionOption, callOptions ...grpc.CallOption) (string, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetServerVersion().

```go
option := milvusclient.NewGetServerVersionOption()

version, err := client.GetServerVersion(ctx, option)
```

**BUILDER METHODS:**

- `NewGetServerVersionOption()`

    Creates the request for GetServerVersion().

**RETURN TYPE:**

*string, error*

**RETURNS:**

The requested string value. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*string*) -

    The string value returned by GetServerVersion().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates GetServerVersion() usage.

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}
defer cli.Close(ctx)

version, err := cli.GetServerVersion(ctx, milvusclient.NewGetServerVersionOption())
if err != nil {
	log.Fatal("failed to get server version:", err)
}
fmt.Println(version)
```
