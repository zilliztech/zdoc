---
title: "LoadPartitions | Go | v2"
slug: /go/go/v2-Management-LoadPartitions
sidebar_label: "LoadPartitions"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation loads specific partitions of a collection into memory. | Go | v2"
type: docx
token: R4nBdOWqtoi6rGx2r4ccEkQ7nl3
sidebar_position: 18
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - LoadPartitions
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadPartitions

This operation loads specific partitions of a collection into memory.

```go
func (c *Client) LoadPartitions(ctx context.Context, option LoadPartitionsOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## Request Syntax\{#request-syntax}

Creates the request for LoadPartitions().

```go
option := milvusclient.NewLoadPartitionsOption(collectionName, partitionsNames).
    WithReplica(num).
    WithResourceGroup(resourceGroups).
    WithLoadFields(loadFields).
    WithSkipLoadDynamicField(skipFlag).
    WithRefresh(isRefresh)

result, err := client.LoadPartitions(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **partitionsNames** (*...string*) -

    **[REQUIRED]**

    The partitions names.

**BUILDER METHODS:**

- `NewLoadPartitionsOption(collectionName string, partitionsNames ...string)`

    Creates the request for LoadPartitions().

- `WithReplica(num int)`

    Sets the replica for the operation.

- `WithResourceGroup(resourceGroups ...string)`

    Sets the resource group for the operation.

- `WithLoadFields(loadFields ...string)`

    Specifies which fields to load into memory.

- `WithSkipLoadDynamicField(skipFlag bool)`

    Sets the skip load dynamic field for the operation.

- `WithRefresh(isRefresh bool)`

    Enables refresh mode to reload newly inserted data.

**RETURN TYPE:**

*LoadTask, error*

**RETURNS:**

A LoadTask that can be used to wait for the load operation to complete. Returns an error if the operation fails.

**METHODS:**

- **Await** (*error*) -

    Blocks until the partitions are confirmed fully loaded, polling the server at the task's check interval until the load progress reports 100 or the context is cancelled.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates LoadPartitions() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

task, err := cli.LoadPartitions(ctx, milvusclient.NewLoadPartitionsOption("quick_setup", "partitionA"))

// sync wait collection to be loaded
err = task.Await(ctx)
if err != nil {
	// handle error
}
```
