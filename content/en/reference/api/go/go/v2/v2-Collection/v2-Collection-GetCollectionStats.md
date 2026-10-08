---
title: "GetCollectionStats | Go | v2"
slug: /go/go/v2-Collection-GetCollectionStats
sidebar_label: "GetCollectionStats"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns statistics about a collection, such as row count. | Go | v2"
type: docx
token: GdghdqEWhon4rpxH4HBcJUddnsf
sidebar_position: 18
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - GetCollectionStats
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetCollectionStats

This operation returns statistics about a collection, such as row count.

```go
func (c *Client) GetCollectionStats(ctx context.Context, opt GetCollectionOption) (map[string]string, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetCollectionStats().

```go
option := milvusclient.NewGetCollectionStatsOption("quick_setup")

stats, err := client.GetCollectionStats(ctx, option)
```

**BUILDER METHODS:**

- `NewGetCollectionStatsOption(collectionName string)`

    Creates options for `GetCollectionStats()`. `collectionName` specifies the collection to inspect.

**RETURN TYPE:**

*map[string]string, error*

**RETURNS:**

A map of statistics key-value pairs. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*map[string]string*) -

    The map[string]string value returned by GetCollectionStats().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates GetCollectionStats() usage.

```go
import (
	"context"
	"fmt"
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

stats, err := cli.GetCollectionStats(ctx, milvusclient.NewGetCollectionStatsOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(stats)
```
