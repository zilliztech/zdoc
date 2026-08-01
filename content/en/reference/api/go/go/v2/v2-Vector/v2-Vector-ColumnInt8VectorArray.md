---
title: "ColumnInt8VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnInt8VectorArray
sidebar_label: "ColumnInt8VectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents an ArrayOfVector column whose rows contain Int8 values with a shared dimension. | Go | v2"
type: docx
token: Snk1duMEtoe1VexGeJYcXW7VnXe
sidebar_position: 6
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnInt8VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnInt8VectorArray

Represents an ArrayOfVector column whose rows contain Int8 values with a shared dimension.

```go
type ColumnInt8VectorArray struct {
}
```

## Request Syntax\{#request-syntax}

Creates a ColumnInt8VectorArray from row-oriented vector-array data.

```go
column.NewColumnInt8VectorArray(fieldName string, dim int, data [][][]int8) *ColumnInt8VectorArray
```

**METHODS:**

- `AppendValue(value any) error`

    This appends one row supplied as []entity.Int8Vector or [][]int8.

**RETURN TYPE:**

*ColumnInt8VectorArray*

**RETURNS:**

Column type for ArrayOfVector int8-vector data in struct array fields.

## Example\{#example}

Demonstrates ColumnInt8VectorArray usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnInt8VectorArray("embeddings", 4, [][][]int8{{{1, 2, 3, 4}}})
fmt.Println(values.Len())
```
