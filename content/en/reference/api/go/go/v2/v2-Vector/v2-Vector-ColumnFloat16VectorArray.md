---
title: "ColumnFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloat16VectorArray
sidebar_label: "ColumnFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A ColumnFloat16VectorArray instance represents an ArrayOfVector float16-vector column whose rows contain float16-vector values with a shared dimension. Nullable semantics are enforced in v3.0.0 nullability flags and valid-value bookkeeping are real operations instead of stubs. | Go | v2"
type: docx
token: Ip2HdObkAodufpxSIoTcJ6rbnWf
sidebar_position: 3
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

A ColumnFloat16VectorArray instance represents an ArrayOfVector float16-vector column whose rows contain float16-vector values with a shared dimension. Nullable semantics are enforced in v3.0.0: nullability flags and valid-value bookkeeping are real operations instead of stubs.

```go
type ColumnFloat16VectorArray struct {
}
```

**BUILDER METHODS:**

- `AppendValue(value any) error`

    This appends one row supplied as []entity.Float16Vector or [][]byte.

- `IsNull(idx int) (bool, error)`

    This reports whether the row at the given index is null.

- `Nullable() bool`

    This reports whether the column accepts null values.

- `SetNullable(nullable bool)`

    This sets whether the column accepts null values.

- `ValidCount() int`

    This returns the number of non-null rows.

- `ValidateNullable() error`

    This verifies the internal nullable bookkeeping and returns an error on mismatch.

**METHODS:**

- `Slice(start, end int) Column`

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
