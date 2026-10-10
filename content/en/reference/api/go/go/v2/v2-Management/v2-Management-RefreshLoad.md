---
title: "RefreshLoad | Go | v2"
slug: /go/go/v2-Management-RefreshLoad
sidebar_label: "RefreshLoad"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation reloads a collection to include newly inserted data in search results. | Go | v2"
type: docx
token: Ava5d8VRjo9lM2x0fJccDqi5nHd
sidebar_position: 22
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshLoad
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshLoad

This operation reloads a collection to include newly inserted data in search results.

```go
func (c *Client) RefreshLoad(ctx context.Context, option RefreshLoadOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## Request Syntax\{#request-syntax}

Creates the request for RefreshLoad().

```go
option := milvusclient.NewRefreshLoadOption(collectionName)

result, err := client.RefreshLoad(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewRefreshLoadOption(collectionName string)`

    Creates the request for RefreshLoad().

**RETURN TYPE:**

*LoadTask, error*

**RETURNS:**

A LoadTask that can be used to wait for the load operation to complete. Returns an error if the operation fails.

**METHODS:**

- **Await** (*error*) -

    Blocks until the refreshed load is confirmed complete, polling the server at the task's check interval until the refresh progress reports 100 or the context is cancelled.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates RefreshLoad() usage.

```go
import (
	"context"

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

loadTask, err := cli.RefreshLoad(ctx, milvusclient.NewRefreshLoadOption(collectionName))
if err != nil {
	// handle err
}
err = loadTask.Await(ctx)
if err != nil {
	// handler err
}
```
