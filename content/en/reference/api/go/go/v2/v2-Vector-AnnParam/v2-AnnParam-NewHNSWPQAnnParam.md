---
title: "NewHNSWPQAnnParam | Go | v2"
slug: /go/go/v2-AnnParam-NewHNSWPQAnnParam
sidebar_label: "NewHNSWPQAnnParam"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a search parameter configuration shared by the HNSW quantized index family (HNSWSQ, HNSWPQ, HNSWPRQ), tuning search-time behavior of a quantized HNSW index. NewHNSWPRQAnnParam() and NewHNSWSQAnnParam() return configurations of the same type with the same builder methods. | Go | v2"
type: docx
token: Fq1YdfEGFof2dixygELcgaomnrb
sidebar_position: 12
keywords: 
  - Machine Learning
  - RAG
  - NLP
  - Neural Network
  - zilliz
  - zilliz cloud
  - cloud
  - NewHNSWPQAnnParam
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWPQAnnParam

This operation creates a search parameter configuration shared by the HNSW quantized index family (HNSW_SQ, HNSW_PQ, HNSW_PRQ), tuning search-time behavior of a quantized HNSW index. NewHNSWPRQAnnParam() and NewHNSWSQAnnParam() return configurations of the same type with the same builder methods.

```go
func NewHNSWPQAnnParam(ef int) *hnswQuantAnnParam
```

## Request Syntax\{#request-syntax}

Creates a quantized-HNSW search parameter configuration with the given search effort ef.

```go
NewHNSWPQAnnParam(ef int) *hnswQuantAnnParam
```

**PARAMETERS:**

- **ef** (*int*) -

    **[REQUIRED]**

**BUILDER METHODS:**

- `WithRefineK(refineK float64) *hnswQuantAnnParam`

    This sets the refinement factor applied to quantized candidate distances.

- `WithSeedEf(seedEf int) *hnswQuantAnnParam`

    This sets the seed search effort used to warm up the graph search.

- `Params() map[string]any`

    This returns the current search parameters as a map.

**RETURN TYPE:**

&ast;*hnswQuantAnnParam*

**RETURNS:**

Returns the quantized-HNSW search parameter configuration.

**PARAMETERS:**

- **annParam** (&ast;*hnswQuantAnnParam*) -

    The quantized-HNSW search parameter configuration. Pass it to the search or hybrid search option via WithAnnParam().

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewHNSWPQAnnParam usage.

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

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("books", 10, vectors).
	WithAnnParam(index.NewHNSWPQAnnParam(64)))
if err != nil {
	// handle error
}
```
