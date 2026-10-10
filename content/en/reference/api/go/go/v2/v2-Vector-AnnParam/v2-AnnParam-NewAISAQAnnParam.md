---
title: "NewAISAQAnnParam | Go | v2"
slug: /go/go/v2-AnnParam-NewAISAQAnnParam
sidebar_label: "NewAISAQAnnParam"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an AISAQ search parameter configuration, tuning search-time behavior of an AISAQ index. | Go | v2"
type: docx
token: D61ndr0TSocZRbxxLnRcfXr3nVg
sidebar_position: 11
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - NewAISAQAnnParam
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewAISAQAnnParam

This operation creates an AISAQ search parameter configuration, tuning search-time behavior of an AISAQ index.

```go
func NewAISAQAnnParam(searchList int) *aisaqAnnParam
```

## Request Syntax\{#request-syntax}

Creates an AISAQ search parameter configuration with the given search-list length.

```go
NewAISAQAnnParam(searchList int) *aisaqAnnParam
```

**PARAMETERS:**

- **searchList** (*int*) -

    **[REQUIRED]**

**BUILDER METHODS:**

- `WithBeamwidth(beamwidth int) *aisaqAnnParam`

    This sets the search beam width.

- `WithPQReadPageCacheSize(bytes int) *aisaqAnnParam`

    This sets the page-cache size used for product-quantization reads.

- `WithVectorsBeamwidth(beamwidth int) *aisaqAnnParam`

    This sets the beam width used for vector reads.

- `Params() map[string]any`

    This returns the current search parameters as a map.

**RETURN TYPE:**

&ast;*aisaqAnnParam*

**RETURNS:**

Returns the AISAQ search parameter configuration.

**PARAMETERS:**

- **annParam** (&ast;*aisaqAnnParam*) -

    The AISAQ search parameter configuration. Pass it to the search or hybrid search option via WithAnnParam().

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewAISAQAnnParam usage.

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
	WithAnnParam(index.NewAISAQAnnParam(64)))
if err != nil {
	// handle error
}
```
