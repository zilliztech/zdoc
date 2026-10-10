---
title: "NewFMIndex | Go | v2"
slug: /go/go/v2-Index-NewFMIndex
sidebar_label: "NewFMIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an FM-index configuration for full-text search over large text collections. | Go | v2"
type: docx
token: Ssc4diNLwoorWTxbH6ecs2ZenAd
sidebar_position: 28
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - NewFMIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewFMIndex

This operation creates an FM-index configuration for full-text search over large text collections.

```go
func NewFMIndex() *FMIndex
```

## Request Syntax\{#request-syntax}

Creates an FM-index configuration.

```go
NewFMIndex() *FMIndex
```

**BUILDER METHODS:**

- `WithIndexName(name string) *FMIndex`

    This sets the index name.

- `WithSaSampleRate(rate int) *FMIndex`

    This sets the suffix-array sampling rate.

- `WithBlockBytes(blockBytes int) *FMIndex`

    This sets the block size in bytes.

**RETURN TYPE:**

&ast;*FMIndex*

**RETURNS:**

Returns the FM-index configuration instance.

**PARAMETERS:**

- **index** (&ast;*FMIndex*) -

    The FM-index configuration instance. Pass it to CreateIndex() via the index option.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewFMIndex usage.

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewFMIndex()))
if err != nil {
	// handle error
}
```
