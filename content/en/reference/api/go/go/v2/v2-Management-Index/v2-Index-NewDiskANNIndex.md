---
title: "NewDiskANNIndex() | Go | v2"
slug: /go/go/v2-Index-NewDiskANNIndex
sidebar_label: "NewDiskANNIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This function creates a DiskANN index configuration for disk-based approximate nearest neighbor search on large-scale datasets. | Go | v2"
type: docx
token: HWG7dWY6XoKyapx5L5Mc69kLnld
sidebar_position: 6
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - NewDiskANNIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewDiskANNIndex()

This function creates a DiskANN index configuration for disk-based approximate nearest neighbor search on large-scale datasets.

```go
func NewDiskANNIndex(metricType MetricType) Index
```

**PARAMETERS:**

- **[metricType](./v2-Management-MetricType)** (*[MetricType](./v2-Management-MetricType)*)

    The distance metric type for similarity search (e.g., index.COSINE, index.L2, index.IP).

**RETURNS:**

*[Index](./v2-Management-Index)*

An index configuration instance. Pass this to `CreateIndex()` via the index option.

## Example\{#example}

```go
import (
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

// Create index configuration
idx := index.NewDiskANNIndex(index.COSINE)

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
