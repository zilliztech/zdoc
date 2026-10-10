---
title: "NewHNSWSQIndex | Go | v2"
slug: /go/go/v2-Index-NewHNSWSQIndex
sidebar_label: "NewHNSWSQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an HNSW index configuration with scalar quantization (HNSWSQ), compressing vectors with scalar quantization on top of the HNSW graph. | Go | v2"
type: docx
token: DF4UdECmLoD4mkxNi8scrntlnmf
sidebar_position: 31
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - NewHNSWSQIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWSQIndex

This operation creates an HNSW index configuration with scalar quantization (HNSW_SQ), compressing vectors with scalar quantization on top of the HNSW graph.

```go
func NewHNSWSQIndex(metricType MetricType, m int, efConstruction int, sqType string) *hnswSQIndex
```

## Request Syntax\{#request-syntax}

Creates an HNSW_SQ index configuration with the graph parameters m and efConstruction and the scalar-quantization type sqType.

```go
NewHNSWSQIndex(metricType MetricType, m int, efConstruction int, sqType string) *hnswSQIndex
```

**PARAMETERS:**

- **metricType** ([MetricType](./v2-Management-MetricType)) -

    **[REQUIRED]**

- **m** (*int*) -

    **[REQUIRED]**

- **efConstruction** (*int*) -

    **[REQUIRED]**

- **sqType** (*string*) -

    **[REQUIRED]**

**BUILDER METHODS:**

- `WithRefineType(refineType string) *hnswSQIndex`

    This sets the refinement strategy applied to quantized distances.

**RETURN TYPE:**

&ast;*hnswSQIndex*

**RETURNS:**

Returns the HNSW_SQ index configuration instance.

**PARAMETERS:**

- **index** (&ast;*hnswSQIndex*) -

    The HNSW_SQ index configuration instance. Pass it to CreateIndex() via the index option.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewHNSWSQIndex usage.

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewHNSWSQIndex(entity.MetricTypeL2, 16, 200, "SQ8")))
if err != nil {
	// handle error
}
```
