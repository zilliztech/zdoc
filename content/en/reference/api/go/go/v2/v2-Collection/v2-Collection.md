---
title: "Collection | Go | v2"
slug: /go/go/v2-Collection
sidebar_label: "Collection"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents a collection description returned by DescribeCollection, including schema, shards, and properties. | Go | v2"
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

Represents a collection description returned by DescribeCollection, including schema, shards, and properties.

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

- **ID** (*int64*)

    collection id

- **Name** (*string*)

    collection name

- **[Schema](./v2-Collection-Schema)** (**[Schema](./v2-Collection-Schema)*)

    collection schema, with fields schema and primary key definition

- **PhysicalChannels** (*[]string*)

    The physical channels.

- **VirtualChannels** (*[]string*)

    The virtual channels.

- **Loaded** (*bool*)

    Whether the resource is loaded into memory.

- **[ConsistencyLevel](./v2-Collection-ConsistencyLevel)** (*[ConsistencyLevel](./v2-Collection-ConsistencyLevel)*)

    The consistency level for read operations.

- **ShardNum** (*int32*)

    The number of shards for data distribution.

- **Properties** (*map[string]string*)

    Custom key-value properties.

- **UpdateTimestamp** (*uint64*)

    The last update timestamp for change detection.