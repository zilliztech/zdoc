---
title: "DropCollection | Go | v2"
slug: /go/go/v2-Collection-DropCollection
sidebar_label: "DropCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops a collection and all its data permanently. | Go | v2"
type: docx
token: MPMwdusXRoBFuUxQolHcZBFhn5e
sidebar_position: 13
keywords: 
  - Unstructured Data
  - vector database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollection

This operation drops a collection and all its data permanently.

```go
func (c *Client) DropCollection(ctx context.Context, option DropCollectionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropCollection().

```go
option := milvusclient.NewDropCollectionOption(name)

err := client.DropCollection(ctx, option)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewDropCollectionOption(name string)`

    Creates the request for DropCollection().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DropCollection() usage.

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

err = cli.DropCollection(ctx, milvusclient.NewDropCollectionOption("customized_setup_2"))
if err != nil {
	// handle err
}
```
