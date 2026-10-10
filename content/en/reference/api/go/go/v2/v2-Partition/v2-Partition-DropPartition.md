---
title: "DropPartition | Go | v2"
slug: /go/go/v2-Partition-DropPartition
sidebar_label: "DropPartition"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops a partition and all its data permanently. | Go | v2"
type: docx
token: FYzrd2bUkosyWexZwKpcWp8znLC
sidebar_position: 2
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - DropPartition
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropPartition

This operation drops a partition and all its data permanently.

```go
func (c *Client) DropPartition(ctx context.Context, opt DropPartitionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropPartition().

```go
option := milvusclient.NewDropPartitionOption(collectionName, partitionName)

err := client.DropPartition(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    The name of the target collection.

- **partitionName** (*string*) -

    The name of the partition to drop.

**BUILDER METHODS:**

- `NewDropPartitionOption(collectionName string, partitionName string)`

    Creates the request for DropPartition().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DropPartition() usage.

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

err = cli.DropPartition(ctx, milvusclient.NewDropPartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}
```
