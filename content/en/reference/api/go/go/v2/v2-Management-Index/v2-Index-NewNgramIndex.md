---
title: "NewNgramIndex | Go | v2"
slug: /go/go/v2-Index-NewNgramIndex
sidebar_label: "NewNgramIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an n-gram index configuration over a text field, tokenizing text into overlapping n-grams bounded by minGram and maxGram for substring matching. | Go | v2"
type: docx
token: L4Trd2cEUoe8zQxtAb8cDNr7nkc
sidebar_position: 32
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - NewNgramIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewNgramIndex

This operation creates an n-gram index configuration over a text field, tokenizing text into overlapping n-grams bounded by minGram and maxGram for substring matching.

```go
func NewNgramIndex(minGram, maxGram int) Index
```

## Request Syntax\{#request-syntax}

Creates an n-gram index configuration with the given minimum and maximum gram lengths.

```go
NewNgramIndex(minGram int, maxGram int) Index
```

**PARAMETERS:**

- **minGram** (*int*) -

    **[REQUIRED]**

- **maxGram** (*int*) -

    **[REQUIRED]**

**RETURN TYPE:**

[Index](./v2-Management-Index)

**RETURNS:**

Returns the n-gram index configuration instance.

**PARAMETERS:**

- **index** ([Index](./v2-Management-Index)) -

    The n-gram index configuration instance. Pass it to CreateIndex() via the index option.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates NewNgramIndex usage.

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewNgramIndex(3, 8)))
if err != nil {
	// handle error
}
```
