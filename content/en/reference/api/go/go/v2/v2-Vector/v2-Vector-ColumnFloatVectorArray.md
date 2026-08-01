---
title: "ColumnFloatVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloatVectorArray
sidebar_label: "ColumnFloatVectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents an ArrayOfVector column whose rows contain Float values with a shared dimension. | Go | v2"
type: docx
token: FEsedrkZpoiR3YxNgL4csDP4nEe
sidebar_position: 5
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnFloatVectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnFloatVectorArray

Represents an ArrayOfVector column whose rows contain Float values with a shared dimension.

```go
type ColumnFloatVectorArray struct {
}
```

## Request Syntax\{#request-syntax}

Creates a ColumnFloatVectorArray from row-oriented vector-array data.

```go
column.NewColumnFloatVectorArray(fieldName string, dim int, data [][][]float32) *ColumnFloatVectorArray
```

**METHODS:**

- `AppendValue(value any) error`

    This appends one row supplied as []entity.FloatVector or [][]float32.

**RETURN TYPE:**

*ColumnFloatVectorArray*

**RETURNS:**

Column type for ArrayOfVector float-vector data in struct array fields.

## Example\{#example}

Demonstrates ColumnFloatVectorArray usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnFloatVectorArray("embeddings", 4, [][][]float32{{{0.1, 0.2, 0.3, 0.4}}})
fmt.Println(values.Len())
```
