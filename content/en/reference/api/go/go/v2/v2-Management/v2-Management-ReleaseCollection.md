---
title: "ReleaseCollection | Go | v2"
slug: /go/go/v2-Management-ReleaseCollection
sidebar_label: "ReleaseCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation releases a collection from memory to free up resources. | Go | v2"
type: docx
token: VQTgdYK3yoNZPxxt9dfct0M4nze
sidebar_position: 23
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - ReleaseCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ReleaseCollection

This operation releases a collection from memory to free up resources.

```go
func (c *Client) ReleaseCollection(ctx context.Context, option ReleaseCollectionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for ReleaseCollection().

```go
option := milvusclient.NewReleaseCollectionOption(collectionName)

err := client.ReleaseCollection(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewReleaseCollectionOption(collectionName string)`

    Creates the request for ReleaseCollection().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates ReleaseCollection() usage.

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

err = cli.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("custom_quick_setup"))
if err != nil {
	// handle error
}
```
