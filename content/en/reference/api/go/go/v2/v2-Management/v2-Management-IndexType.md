---
title: "IndexType | Go | v2"
slug: /go/go/v2-Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Enumerates the supported index algorithms for vector and scalar fields. | Go | v2"
type: docx
token: GppedViHro8TJMxQCZ3cJRKRnHg
sidebar_position: 16
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - IndexType
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# IndexType

Enumerates the supported index algorithms for vector and scalar fields.

```go
type IndexType string
```

**VALUES:**

- **AUTOINDEX** = "AUTOINDEX"

    Automatically selects the best index type.

- **Trie** = "Trie"

    Trie index for string fields.

- **Sorted** = "STL_SORT"

    Sorted index for scalar fields.

- **Inverted** = "INVERTED"

    Inverted index for scalar fields.

- **BITMAP** = "BITMAP"

    Bitmap index for low-cardinality scalar fields.

- **RTREE** = "RTREE"

    R-tree index for spatial data.

## Example\{#example}

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v2/index"
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

// Create an HNSW index on a float vector field
hnswIndex := index.NewHNSWIndex(index.MetricTypeL2, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding", hnswIndex))
if err != nil {
    // handle error
}

// Create an IVF_FLAT index
ivfIndex := index.NewIvfFlatIndex(index.MetricTypeL2, 128)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding2", ivfIndex))
if err != nil {
    // handle error
}
```
