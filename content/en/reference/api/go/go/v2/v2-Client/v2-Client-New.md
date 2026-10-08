---
title: "New | Go | v2"
slug: /go/go/v2-Client-New
sidebar_label: "New"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a connection to the specified Milvus server with the specified configuration. | Go | v2"
type: docx
token: TiJxdTD1yoot4TxXHHUchnERn8e
sidebar_position: 4
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - New
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# New

This operation creates a connection to the specified Milvus server with the specified configuration.

```go
func New(ctx context.Context, config *ClientConfig) (*Client, error)
```

## Request Syntax\{#request-syntax}

Creates a connection to the specified Milvus server.

```go
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
```

**PARAMETERS:**

- **config** (&ast;*ClientConfig*) -

    The configuration for the connection, including the Milvus server address.

**RETURN TYPE:**

&ast;*Client, error*

**RETURNS:**

A connected Client instance ready for use. Returns an error if the connection fails.

**PARAMETERS:**

- **result** (&ast;*Client*) -

    The &ast;Client value returned by New().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates New() usage.

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

// Connect to a local Milvus server
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}
defer cli.Close(ctx)

collections, err := cli.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
	log.Fatal("failed to list collections:", err)
}
fmt.Println(collections)
```
