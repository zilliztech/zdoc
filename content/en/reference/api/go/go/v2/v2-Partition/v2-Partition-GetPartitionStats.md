---
title: "GetPartitionStats | Go | v2"
slug: /go/go/v2-Partition-GetPartitionStats
sidebar_label: "GetPartitionStats"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns statistics for a specified partition, such as its row count. | Go | v2"
type: docx
token: A8PWdL2x4oQcVXxq6aNc3AAwnEh
sidebar_position: 3
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - GetPartitionStats
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetPartitionStats

This operation returns statistics for a specified partition, such as its row count.

```go
func (c *Client) GetPartitionStats(ctx context.Context, opt GetPartitionStatsOption, callOptions ...grpc.CallOption) (map[string]string, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetPartitionStats().

```go
option := milvusclient.NewGetPartitionStatsOption(collectionName, partitionName)

result, err := client.GetPartitionStats(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    The name of the target collection.

- **partitionName** (*string*) -

    The name of the partition to drop.

**BUILDER METHODS:**

- `NewGetPartitionStatsOption(collectionName string, partitionName string)`

    Creates options to get partition statistics. `collectionName` specifies the collection, and `partitionName` specifies the partition.

**RETURN TYPE:**

*map[string]string, error*

**RETURNS:**

A map of partition statistics key-value pairs. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*map[string]string*) -

    The partition statistics key-value pairs.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates GetPartitionStats() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

result, err := cli.GetPartitionStats(ctx, milvusclient.NewGetPartitionStatsOption("books", "chunk_1"))
if err != nil {
	// handle error
}
fmt.Println(result)
```
