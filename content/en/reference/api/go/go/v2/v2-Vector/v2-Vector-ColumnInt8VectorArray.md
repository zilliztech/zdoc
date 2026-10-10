---
title: "ColumnInt8VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnInt8VectorArray
sidebar_label: "ColumnInt8VectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A ColumnInt8VectorArray instance represents an ArrayOfVector int8-vector column whose rows contain int8-vector values with a shared dimension. Nullable semantics are enforced in v3.0.0 nullability flags and valid-value bookkeeping are real operations instead of stubs. | Go | v2"
type: docx
token: Snk1duMEtoe1VexGeJYcXW7VnXe
sidebar_position: 5
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

A ColumnInt8VectorArray instance represents an ArrayOfVector int8-vector column whose rows contain int8-vector values with a shared dimension. Nullable semantics are enforced in v3.0.0: nullability flags and valid-value bookkeeping are real operations instead of stubs.

```go
type ColumnInt8VectorArray struct {
}
```

**BUILDER METHODS:**

- `AppendValue(value any) error`

    This appends one row supplied as []entity.Int8Vector or [][]int8.

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

Demonstrates ColumnInt8VectorArray usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnInt8VectorArray("embeddings", 4, [][][]int8{{{1, 2, 3, 4}}})
fmt.Println(values.Len())
```
