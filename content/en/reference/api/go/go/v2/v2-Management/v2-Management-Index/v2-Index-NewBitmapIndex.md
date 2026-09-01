---
title: "NewBitmapIndex() | Go | v2"
slug: /go/go/v2-Index-NewBitmapIndex
sidebar_label: "NewBitmapIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This function creates a bitmap index configuration for efficient filtering on low-cardinality scalar fields. | Go | v2"
type: docx
token: EhzHdkYfUoOsprxhtPNcmMPKnEc
sidebar_position: 5
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - NewBitmapIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewBitmapIndex()

This function creates a bitmap index configuration for efficient filtering on low-cardinality scalar fields.

```go
func NewBitmapIndex() Index
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
idx := index.NewBitmapIndex()

// Use with CreateIndex
createIdxOption := milvusclient.NewCreateIndexOption("collection_name", "vector_field", idx)
task, err := client.CreateIndex(ctx, createIdxOption)
```
