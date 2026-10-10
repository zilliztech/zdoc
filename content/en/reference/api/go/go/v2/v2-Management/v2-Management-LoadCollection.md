---
title: "LoadCollection | Go | v2"
slug: /go/go/v2-Management-LoadCollection
sidebar_label: "LoadCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation loads a collection into memory for search and query operations. | Go | v2"
type: docx
token: RGDUdquTToKBJJxdGwlcltJYncd
sidebar_position: 17
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - LoadCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadCollection

This operation loads a collection into memory for search and query operations.

```go
func (c *Client) LoadCollection(ctx context.Context, option LoadCollectionOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## Request Syntax\{#request-syntax}

Creates the request for LoadCollection().

```go
option := milvusclient.NewLoadCollectionOption(collectionName).
    WithReplica(num).
    WithResourceGroup(resourceGroups).
    WithLoadFields(loadFields).
    WithSkipLoadDynamicField(skipFlag).
    WithRefresh(isRefresh)

result, err := client.LoadCollection(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewLoadCollectionOption(collectionName string)`

    Creates the request for LoadCollection().

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

    Blocks until the load is confirmed complete, polling the server at the task's check interval until the collection or partitions report fully loaded or the context is cancelled.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates LoadCollection() usage.

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

loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("customized_setup_1"))
if err != nil {
	// handle error
}

// sync wait collection to be loaded
err = loadTask.Await(ctx)
if err != nil {
	// handle error
}
```
