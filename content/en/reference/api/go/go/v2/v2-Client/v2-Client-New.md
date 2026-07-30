---
title: "New() | Go | v2"
slug: /go/go/v2-Client-New
sidebar_label: "New()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a connection to the specified Zilliz Cloud cluster with the specified configuration. | Go | v2"
type: docx
token: NvlZd3VOpoMrsoxmavQckdAOnQg
sidebar_position: 4
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - New()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# New()

This operation creates a connection to the specified Zilliz Cloud cluster with the specified configuration.

```go
func New(ctx context.Context, config *ClientConfig) (*Client, error)
```

**RETURN TYPE:**

**Client, error*

**RETURNS:**

A connected Client instance ready for use. Returns an error if the connection fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
