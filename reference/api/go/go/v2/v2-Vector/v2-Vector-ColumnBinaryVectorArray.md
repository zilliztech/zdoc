---
title: "ColumnBinaryVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBinaryVectorArray
sidebar_label: "ColumnBinaryVectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents an ArrayOfVector column whose rows contain Binary values with a shared dimension. | Go | v2"
type: docx
token: VKeBdnkoXoI29txzTuncqsaDnte
sidebar_position: 3
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

Represents an ArrayOfVector column whose rows contain Binary values with a shared dimension.

```go
type ColumnBinaryVectorArray struct {
}
```

## Request Syntax\{#request-syntax}

Creates a ColumnBinaryVectorArray from row-oriented vector-array data.

```go
column.NewColumnBinaryVectorArray(fieldName string, dim int, data [][][]byte) *ColumnBinaryVectorArray
```

**METHODS:**

- `AppendValue(value any) error`

    This appends one row supplied as []entity.BinaryVector or [][]byte.

**RETURN TYPE:**

*ColumnBinaryVectorArray*

**RETURNS:**

Column type for ArrayOfVector binary-vector data in struct array fields.

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
