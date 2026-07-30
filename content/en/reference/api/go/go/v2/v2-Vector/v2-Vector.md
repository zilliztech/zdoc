---
title: "Vector | Go | v2"
slug: /go/go/v2-Vector
sidebar_label: "Vector"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Interface for vector data. Implementations include FloatVector, BinaryVector, Float16Vector, BFloat16Vector, Int8Vector, and Text. | Go | v2"
type: docx
token: CE0odAFVdoh2ehxNFRecD8WEn3f
sidebar_position: 16
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - Vector
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Vector

Interface for vector data. Implementations include FloatVector, BinaryVector, Float16Vector, BFloat16Vector, Int8Vector, and Text.

```go
type Vector interface {
    Dim() int
    Serialize() []byte
    FieldType() FieldType
}
```

**METHODS:**

- `Dim() int`

    Returns the dimensionality of the vector.

- `Serialize() []byte`

    Serializes the vector data to bytes.

- `FieldType() FieldType`

    Returns the FieldType enum value for this vector type.

## Vector Array Types\{#vector-array-types}

- `FloatVectorArray`

    This groups multiple FloatVector values into one query vector slot for MAX_SIM-style search against ArrayOfVector sub-fields of struct arrays.

- `Float16VectorArray`

    This groups multiple Float16Vector values for EmbListFloat16Vector search.

- `BFloat16VectorArray`

    This groups multiple BFloat16Vector values for EmbListBFloat16Vector search.

- `BinaryVectorArray`

    This groups multiple BinaryVector values for EmbListBinaryVector search.

- `Int8VectorArray`

    This groups multiple Int8Vector values for EmbListInt8Vector search.

## Example\{#example}

```go
// Vector is typically obtained from API calls or constructors
// TODO: Usage example
```
