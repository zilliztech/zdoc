---
title: "GetPartitionStats() | Go | v2"
slug: /go/go/v2-Partition-GetPartitionStats
sidebar_label: "GetPartitionStats()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns statistics about a partition, such as row count. | Go | v2"
type: docx
token: Z835dscn3oM3sGxnDlacgndBn9o
sidebar_position: 3
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - GetPartitionStats()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetPartitionStats()

This operation returns statistics about a partition, such as row count.

```go
func (c *Client) GetPartitionStats(ctx context.Context, opt GetPartitionStatsOption, callOptions ...grpc.CallOption) (map[string]string, error)
```

**RETURN TYPE:**

*map[string]string, error*

**RETURNS:**

A map of statistics key-value pairs. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

stats, err := cli.GetPartitionStats(ctx, milvusclient.NewGetPartitionStatsOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}
fmt.Println(stats)
```
