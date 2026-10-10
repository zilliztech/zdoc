---
title: "GetLoadState | Go | v2"
slug: /go/go/v2-Management-GetLoadState
sidebar_label: "GetLoadState"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the current load state and progress of a collection or partitions. | Go | v2"
type: docx
token: GnxodY26PoUgOIxa5ihc2e0MnK0
sidebar_position: 12
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - GetLoadState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetLoadState

This operation returns the current load state and progress of a collection or partitions.

```go
func (c *Client) GetLoadState(ctx context.Context, option GetLoadStateOption, callOptions ...grpc.CallOption) (entity.LoadState, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetLoadState().

```go
option := milvusclient.NewGetLoadStateOption(collectionName, partitionNames)

result, err := client.GetLoadState(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **partitionNames** (*...string*) -

    **[REQUIRED]**

    The name(s) of the partition(s).

**BUILDER METHODS:**

- `NewGetLoadStateOption(collectionName string, partitionNames ...string)`

    Creates the request for GetLoadState().

**RETURN TYPE:**

*entity.LoadState, error*

**RETURNS:**

The current load state of the collection or partitions. Returns an error if the operation fails.

```go
type LoadState struct {
    State LoadStateCode
    Progress int64
}
```

**PARAMETERS:**

- **State** (*LoadStateCode*) -

    The current state: LoadStateLoading, LoadStateLoaded, LoadStateUnloading, or LoadStateNotLoad.

- **Progress** (*int64*) -

    The progress percentage.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates GetLoadState() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

collectionName := `customized_setup_1`

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

loadState, err := cli.GetLoadState(ctx, milvusclient.NewGetLoadStateOption(collectionName))
if err != nil {
	// handle err
}
fmt.Println(loadState)
```
