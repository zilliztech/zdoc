---
title: "HasCollection() | Go | v2"
slug: /go/go/v2-Collection-HasCollection
sidebar_label: "HasCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks whether a collection exists in the current database. | Go | v2"
type: docx
token: JfRidhpQRo2tZFxrL87cNODunWc
sidebar_position: 19
keywords: 
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - HasCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HasCollection()

This operation checks whether a collection exists in the current database.

```go
func (c *Client) HasCollection(ctx context.Context, option HasCollectionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewHasCollectionOption(name)

result, err := client.HasCollection(ctx, option)
```

**PARAMETERS:**

- **name** (*string*)

    The name of the target collection.

**RETURN TYPE:**

*has bool, err error*

**RETURNS:**

A boolean indicating whether the resource exists. Returns an error if the operation fails.

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

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

has, err := cli.HasCollection(ctx, milvusclient.NewHasCollectionOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(has)
```
