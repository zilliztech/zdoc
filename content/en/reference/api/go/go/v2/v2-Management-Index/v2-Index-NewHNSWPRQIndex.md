---
title: "NewHNSWPRQIndex | Go | v2"
slug: /go/go/v2-Index-NewHNSWPRQIndex
sidebar_label: "NewHNSWPRQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an HNSW index configuration with product residual quantization (HNSWPRQ), refining compressed distances with residual quantization stages. | Go | v2"
type: docx
token: NBFFdeNtcoQFP4xUj3vccXWGnJe
sidebar_position: 30
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - NewHNSWPRQIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWPRQIndex

This operation creates an HNSW index configuration with product residual quantization (HNSW_PRQ), refining compressed distances with residual quantization stages.

```go
func NewHNSWPRQIndex(metricType MetricType, m int, efConstruction int, pqM int, nrq int, nbits int) *hnswPRQIndex
```

## Request Syntax\{#request-syntax}

Creates an HNSW_PRQ index configuration with the graph parameters m and efConstruction, product-quantization parameter pqM, and residual-quantization parameters nrq and nbits.

```go
NewHNSWPRQIndex(metricType MetricType, m int, efConstruction int, pqM int, nrq int, nbits int) *hnswPRQIndex
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

- **nrq** (*int*) -

    **[REQUIRED]**

- **nbits** (*int*) -

    **[REQUIRED]**

**BUILDER METHODS:**

- `WithRefineType(refineType string) *hnswPRQIndex`

    This sets the refinement strategy applied to quantized distances.

**RETURN TYPE:**

&ast;*hnswPRQIndex*

**RETURNS:**

Returns the HNSW_PRQ index configuration instance.

**PARAMETERS:**

- **index** (&ast;*hnswPRQIndex*) -

    The HNSW_PRQ index configuration instance. Pass it to CreateIndex() via the index option.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewHNSWPRQIndex usage.

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewHNSWPRQIndex(entity.MetricTypeL2, 16, 200, 8, 2, 8)))
if err != nil {
	// handle error
}
```
