---
title: "DescribeCollection | Go | v2"
slug: /go/go/v2-Collection-DescribeCollection
sidebar_label: "DescribeCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns detailed information about a collection, including its schema and properties. | Go | v2"
type: docx
token: Gqw1dx2TLodFGCx2prYcTgminRe
sidebar_position: 11
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeCollection

This operation returns detailed information about a collection, including its schema and properties.

```go
func (c *Client) DescribeCollection(ctx context.Context, option DescribeCollectionOption, callOptions ...grpc.CallOption) (collection *entity.Collection, err error)
```

## Request Syntax\{#request-syntax}

Creates the request for DescribeCollection().

```go
option := milvusclient.NewDescribeCollectionOption(name)

result, err := client.DescribeCollection(ctx, option)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewDescribeCollectionOption(name string)`

    Creates the request for DescribeCollection().

**RETURN TYPE:**

*entity.Collection, error*

**RETURNS:**

The collection description including schema, fields, and properties. Returns an error if the operation fails.

```go
type Collection struct {
    ID               int64
    Name             string
    Schema           *Schema
    PhysicalChannels []string
    VirtualChannels  []string
    Loaded           bool
    ConsistencyLevel ConsistencyLevel
    ShardNum         int32
    Properties       map[string]string
    UpdateTimestamp  uint64
}
```

**PARAMETERS:**

- **ID** (*int64*) -

    The unique identifier of the collection.

- **Name** (*string*) -

    The name of the collection.

- **Schema** ([Schema](./v2-Collection-Schema)) -

    The collection schema, with field definitions and the primary key.

- **PhysicalChannels** (*[]string*) -

    The physical message channels the collection uses.

- **VirtualChannels** (*[]string*) -

    The virtual message channels the collection uses.

- **Loaded** (*bool*) -

    Whether the collection is currently loaded.

- **ConsistencyLevel** ([ConsistencyLevel](./v2-Collection-ConsistencyLevel)) -

    The consistency level of the collection.

- **ShardNum** (*int32*) -

    The number of shards in the collection.

- **Properties** (*map[string]string*) -

    The collection properties (e.g., TTL settings).

- **UpdateTimestamp** (*uint64*) -

    The collection update timestamp, usually used for internal change detection.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DescribeCollection() usage.

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

collection, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(collection)
```
