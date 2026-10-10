---
title: "ColumnFloatVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloatVectorArray
sidebar_label: "ColumnFloatVectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A ColumnFloatVectorArray instance represents an ArrayOfVector float-vector column whose rows contain float-vector values with a shared dimension. Nullable semantics are enforced in v3.0.0 nullability flags and valid-value bookkeeping are real operations instead of stubs. | Go | v2"
type: docx
token: FEsedrkZpoiR3YxNgL4csDP4nEe
sidebar_position: 4
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

A ColumnFloatVectorArray instance represents an ArrayOfVector float-vector column whose rows contain float-vector values with a shared dimension. Nullable semantics are enforced in v3.0.0: nullability flags and valid-value bookkeeping are real operations instead of stubs.

```go
type ColumnFloatVectorArray struct {
}
```

**BUILDER METHODS:**

- `AppendValue(value any) error`

    This appends one row supplied as []entity.FloatVector or [][]float32.

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

Demonstrates ColumnFloatVectorArray usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnFloatVectorArray("embeddings", 4, [][][]float32{{{0.1, 0.2, 0.3, 0.4}}})
fmt.Println(values.Len())
```
