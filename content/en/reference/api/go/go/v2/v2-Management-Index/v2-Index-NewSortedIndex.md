---
title: "NewSortedIndex() | Go | v2"
slug: /go/go/v2-Index-NewSortedIndex
sidebar_label: "NewSortedIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This function creates a sorted index configuration for range-based scalar field queries. | Go | v2"
type: docx
token: JTQrddtCJoJBjwxrKZrcn1lPnEe
sidebar_position: 23
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - NewSortedIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewSortedIndex()

This function creates a sorted index configuration for range-based scalar field queries.

```go
func NewSortedIndex() Index
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
idx := index.NewSortedIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
