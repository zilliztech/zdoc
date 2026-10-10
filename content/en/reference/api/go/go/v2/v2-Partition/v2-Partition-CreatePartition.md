---
title: "CreatePartition | Go | v2"
slug: /go/go/v2-Partition-CreatePartition
sidebar_label: "CreatePartition"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a new partition in a collection for organizing data. | Go | v2"
type: docx
token: J1U2dUEpqo8RiBxWNKZctY72nZs
sidebar_position: 1
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - CreatePartition
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreatePartition

This operation creates a new partition in a collection for organizing data.

```go
func (c *Client) CreatePartition(ctx context.Context, opt CreatePartitionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for CreatePartition().

```go
option := milvusclient.NewCreatePartitionOption("quick_setup", "partitionA")

 := client.CreatePartition(ctx, option)
```

**BUILDER METHODS:**

- `NewCreatePartitionOption(collectionName string, partitionName string)`

    Creates the request for CreatePartition().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates CreatePartition() usage.

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

err = cli.CreatePartition(ctx, milvusclient.NewCreatePartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(partitionNames)
```
