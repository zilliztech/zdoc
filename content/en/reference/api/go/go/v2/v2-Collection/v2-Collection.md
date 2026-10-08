---
title: "Collection | Go | v2"
slug: /go/go/v2-Collection
sidebar_label: "Collection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A Collection instance represents collection metadata in Milvus, including the collection schema and consistency settings. Returned by `DescribeCollection()`. | Go | v2"
type: docx
token: PNwFdxMMdo6rtIxERDHcVFgdnxc
sidebar_position: 6
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - Collection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Collection

A Collection instance represents collection metadata in Milvus, including the collection schema and consistency settings. Returned by `DescribeCollection()`.

```go
type Collection struct {
    ID int64
    Name string
    Schema *Schema
    PhysicalChannels []string
    VirtualChannels []string
    Loaded bool
    ConsistencyLevel ConsistencyLevel
    ShardNum int32
    Properties map[string]string
    UpdateTimestamp uint64
}
```

**FIELDS:**

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

## Example\{#example}

Demonstrates Collection usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

collection, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("books"))
if err != nil {
	// handle error
}
fmt.Println(collection.Name, collection.ConsistencyLevel)
```
