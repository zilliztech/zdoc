---
title: "NewInvertedIndex() | Go | v2"
slug: /go/go/v2-Index-NewInvertedIndex
sidebar_label: "NewInvertedIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This function creates an inverted index configuration for efficient scalar field filtering. | Go | v2"
type: docx
token: TxKwd5bEqoHUuLxqENic3Uv6nhg
sidebar_position: 14
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - NewInvertedIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewInvertedIndex()

This function creates an inverted index configuration for efficient scalar field filtering.

```go
func NewInvertedIndex() Index
```

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
idx := index.NewInvertedIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
