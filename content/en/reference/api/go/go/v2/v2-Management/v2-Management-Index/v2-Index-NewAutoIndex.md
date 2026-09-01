---
title: "NewAutoIndex() | Go | v2"
slug: /go/go/v2-Index-NewAutoIndex
sidebar_label: "NewAutoIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This function creates an AUTOINDEX configuration that automatically selects the best index algorithm based on data characteristics. | Go | v2"
type: docx
token: GDYxdLJ9HopKQoxJqknckyI1neb
sidebar_position: 2
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - NewAutoIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewAutoIndex()

This function creates an AUTOINDEX configuration that automatically selects the best index algorithm based on data characteristics.

```go
func NewAutoIndex(metricType MetricType) Index
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
idx := index.NewAutoIndex(index.COSINE)

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
