---
title: "ListPartitions | Go | v2"
slug: /go/go/v2-Partition-ListPartitions
sidebar_label: "ListPartitions"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all partitions in a collection. | Go | v2"
type: docx
token: YMkedZlN9ozHlVx28ERcGYzEn6f
sidebar_position: 5
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - ListPartitions
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListPartitions

This operation lists all partitions in a collection.

```go
func (c *Client) ListPartitions(ctx context.Context, opt ListPartitionsOption, callOptions ...grpc.CallOption) (partitionNames []string, err error)
```

## Request Syntax\{#request-syntax}

Creates the request for ListPartitions().

```go
option := milvusclient.NewListPartitionOption(collectionName)

result, err := client.ListPartitions(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    The name of the target collection.

**BUILDER METHODS:**

- `NewListPartitionOption(collectionName string)`

    Creates the request for ListPartitions().

**RETURN TYPE:**

*partitionNames []string, err error*

**RETURNS:**

A list of names. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*partitionNames []string*) -

    The partitionNames []string value returned by ListPartitions().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates ListPartitions() usage.

```go
import (
	"context"
	"fmt"

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

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(partitionNames)
```
