---
title: "ColumnBFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBFloat16VectorArray
sidebar_label: "ColumnBFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents an ArrayOfVector column whose rows contain BFloat16 values with a shared dimension. | Go | v2"
type: docx
token: OG2HdyPMzoO7y7xob6HcX1V0n7b
sidebar_position: 2
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnBFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnBFloat16VectorArray

Represents an ArrayOfVector column whose rows contain BFloat16 values with a shared dimension.

```go
type ColumnBFloat16VectorArray struct {
}
```

## Request Syntax\{#request-syntax}

Creates a ColumnBFloat16VectorArray from row-oriented vector-array data.

```go
column.NewColumnBFloat16VectorArray(fieldName string, dim int, data [][][]byte) *ColumnBFloat16VectorArray
```

**METHODS:**

- `AppendValue(value any) error`

    This appends one row supplied as []entity.BFloat16Vector or [][]byte.

**RETURN TYPE:**

*ColumnBFloat16VectorArray*

**RETURNS:**

Column type for ArrayOfVector bfloat16-vector data in struct array fields.

## Example\{#example}

Demonstrates ColumnBFloat16VectorArray usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnBFloat16VectorArray("embeddings", 4, [][][]byte{{{0, 1, 2, 3}}})
fmt.Println(values.Len())
```
