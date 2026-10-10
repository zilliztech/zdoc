---
title: "ColumnBinaryVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBinaryVectorArray
sidebar_label: "ColumnBinaryVectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A ColumnBinaryVectorArray instance represents an ArrayOfVector binary-vector column whose rows contain binary-vector values with a shared dimension. Nullable semantics are enforced in v3.0.0 nullability flags and valid-value bookkeeping are real operations instead of stubs. | Go | v2"
type: docx
token: VKeBdnkoXoI29txzTuncqsaDnte
sidebar_position: 2
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnBinaryVectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnBinaryVectorArray

A ColumnBinaryVectorArray instance represents an ArrayOfVector binary-vector column whose rows contain binary-vector values with a shared dimension. Nullable semantics are enforced in v3.0.0: nullability flags and valid-value bookkeeping are real operations instead of stubs.

```go
type ColumnBinaryVectorArray struct {
}
```

**BUILDER METHODS:**

- `AppendValue(value any) error`

    This appends one row supplied as []entity.BinaryVector or [][]byte.

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

Demonstrates ColumnBinaryVectorArray usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnBinaryVectorArray("embeddings", 8, [][][]byte{{{0xff}}})
fmt.Println(values.Len())
```
