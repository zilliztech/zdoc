---
title: "ReleasePartitions | Go | v2"
slug: /go/go/v2-Management-ReleasePartitions
sidebar_label: "ReleasePartitions"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation releases one or more loaded partitions from memory. | Go | v2"
type: docx
token: YIQXdQUHwovep5xVGz2cgusdnXe
sidebar_position: 24
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - ReleasePartitions
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ReleasePartitions

This operation releases one or more loaded partitions from memory.

```go
func (c *Client) ReleasePartitions(ctx context.Context, option ReleasePartitionsOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for ReleasePartitions().

```go
option := milvusclient.NewReleasePartitionsOptions(collectionName, partitionNames...)

err := client.ReleasePartitions(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **partitionNames** (*...string*) -

    **[REQUIRED]**

    The name(s) of the partition(s).

**BUILDER METHODS:**

- `NewReleasePartitionsOptions(collectionName string, partitionNames ...string)`

    Creates options to release partitions. `collectionName` specifies the collection, and `partitionNames` lists the partitions to release.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the partitions are released. Returns an error if the operation fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Request construction or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates ReleasePartitions() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("books", "chunk_1", "chunk_2"))
if err != nil {
	// handle error
}
```
