---
title: "ColumnFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloat16VectorArray
sidebar_label: "ColumnFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents an ArrayOfVector column whose rows contain Float16 values with a shared dimension. | Go | v2"
type: docx
token: Ip2HdObkAodufpxSIoTcJ6rbnWf
sidebar_position: 4
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnFloat16VectorArray

Represents an ArrayOfVector column whose rows contain Float16 values with a shared dimension.

```go
type ColumnFloat16VectorArray struct {
}
```

## Request Syntax\{#request-syntax}

Creates a ColumnFloat16VectorArray from row-oriented vector-array data.

```go
column.NewColumnFloat16VectorArray(fieldName string, dim int, data [][][]byte) *ColumnFloat16VectorArray
```

**METHODS:**

- `AppendValue(value any) error`

    This appends one row supplied as []entity.Float16Vector or [][]byte.

**RETURN TYPE:**

*ColumnFloat16VectorArray*

**RETURNS:**

Column type for ArrayOfVector float16-vector data in struct array fields.

## Example\{#example}

Demonstrates ColumnFloat16VectorArray usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnFloat16VectorArray("embeddings", 4, [][][]byte{{{0, 1, 2, 3}}})
fmt.Println(values.Len())
```
