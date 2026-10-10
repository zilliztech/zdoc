---
title: "NewHNSWPQIndex | Go | v2"
slug: /go/go/v2-Index-NewHNSWPQIndex
sidebar_label: "NewHNSWPQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an HNSW index configuration with product quantization (HNSWPQ), compressing vectors with product quantization on top of the HNSW graph. | Go | v2"
type: docx
token: CSCNdLVEGoURMaxD9iXcw11onhE
sidebar_position: 29
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - NewHNSWPQIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWPQIndex

This operation creates an HNSW index configuration with product quantization (HNSW_PQ), compressing vectors with product quantization on top of the HNSW graph.

```go
func NewHNSWPQIndex(metricType MetricType, m int, efConstruction int, pqM int, nbits int) *hnswPQIndex
```

## Request Syntax\{#request-syntax}

Creates an HNSW_PQ index configuration with the graph parameters m and efConstruction and the product-quantization parameters pqM and nbits.

```go
NewHNSWPQIndex(metricType MetricType, m int, efConstruction int, pqM int, nbits int) *hnswPQIndex
```

**PARAMETERS:**

- **metricType** ([MetricType](./v2-Management-MetricType)) -

    **[REQUIRED]**

- **m** (*int*) -

    **[REQUIRED]**

- **efConstruction** (*int*) -

    **[REQUIRED]**

- **pqM** (*int*) -

    **[REQUIRED]**

- **nbits** (*int*) -

    **[REQUIRED]**

**BUILDER METHODS:**

- `WithRefineType(refineType string) *hnswPQIndex`

    This sets the refinement strategy applied to quantized distances.

**RETURN TYPE:**

&ast;*hnswPQIndex*

**RETURNS:**

Returns the HNSW_PQ index configuration instance.

**PARAMETERS:**

- **index** (&ast;*hnswPQIndex*) -

    The HNSW_PQ index configuration instance. Pass it to CreateIndex() via the index option.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewHNSWPQIndex usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewHNSWPQIndex(entity.MetricTypeL2, 16, 200, 8, 8)))
if err != nil {
	// handle error
}
```
