---
title: "NewAISAQIndex | Go | v2"
slug: /go/go/v2-Index-NewAISAQIndex
sidebar_label: "NewAISAQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an AISAQ index configuration for a vector field. AISAQ layers inverted-file organization with product-quantized auxiliary storage; tune it through its builder methods. | Go | v2"
type: docx
token: DIoqdCpn0o0y2sxi2QtcIGsynbc
sidebar_position: 27
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - NewAISAQIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewAISAQIndex

This operation creates an AISAQ index configuration for a vector field. AISAQ layers inverted-file organization with product-quantized auxiliary storage; tune it through its builder methods.

```go
func NewAISAQIndex(metricType MetricType) *aisaqIndex
```

## Request Syntax\{#request-syntax}

Creates an AISAQ index configuration with the given metric type.

```go
NewAISAQIndex(metricType MetricType) *aisaqIndex
```

**PARAMETERS:**

- **metricType** ([MetricType](./v2-Management-MetricType)) -

    **[REQUIRED]**

**BUILDER METHODS:**

- `WithInlinePQ(inlinePQ int) *aisaqIndex`

    This sets the inline product-quantization level.

- `WithNumEntryPoints(numEntryPoints int) *aisaqIndex`

    This sets the number of entry points.

- `WithPQCacheSize(bytes int) *aisaqIndex`

    This sets the product-quantization cache size in bytes.

- `WithPQReadIOEngine(engine string) *aisaqIndex`

    This sets the IO engine used for product-quantization reads.

- `WithPQReadPageCacheSize(bytes int) *aisaqIndex`

    This sets the page-cache size used for product-quantization reads.

- `WithRearrange(rearrange bool) *aisaqIndex`

    This sets whether data rearrangement is enabled.

**RETURN TYPE:**

&ast;*aisaqIndex*

**RETURNS:**

Returns the AISAQ index configuration instance.

**PARAMETERS:**

- **index** (&ast;*aisaqIndex*) -

    The AISAQ index configuration instance. Pass it to CreateIndex() via the index option.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewAISAQIndex usage.

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewAISAQIndex(entity.MetricTypeIP)))
if err != nil {
	// handle error
}
```
