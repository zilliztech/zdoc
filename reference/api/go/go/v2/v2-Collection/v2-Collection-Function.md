---
title: "Function | Go | v2"
slug: /go/go/v2-Collection-Function
sidebar_label: "Function"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Defines a built-in function (e.g., BM25, text embedding) that can be attached to a collection schema. | Go | v2"
type: docx
token: G4dTdejt8otbQWxUqvucwKnBnYg
sidebar_position: 17
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - Function
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Function

Defines a built-in function (e.g., BM25, text embedding) that can be attached to a collection schema.

```go
type Function struct {
    Name string
    Description string
    Type FunctionType
    InputFieldNames []string
    OutputFieldNames []string
    Params map[string]string
}
```

## Constructor\{#constructor}

```go
entity.NewFunction().
    WithName(name).
    WithInputFields(inputFields).
    WithOutputFields(outputFields).
    WithType(funcType).
    // ...
```

**BUILDER METHODS:**

- `WithName(name string)`

    Sets the name of the function.

- `WithInputFields(inputFields ...string)`

    Sets the input field names for the function.

- `WithOutputFields(outputFields ...string)`

    Sets the output field names for the function.

- `WithType(funcType FunctionType)`

    Sets the function type (BM25, TextEmbedding, Rerank).

- `WithParam(key string, value any)`

    Sets a function parameter key-value pair.

## Example\{#example}

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
)

// Define a BM25 text embedding function on a VarChar field
fn := entity.NewFunction().
    WithName("bm25_fn").
    WithFunctionType(entity.FunctionTypeBM25).
    WithInputFields("text").
    WithOutputFields("sparse_vector")

schema := entity.NewSchema().
    WithName("my_collection").
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
    WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000).WithEnableAnalyzer(true)).
    WithField(entity.NewField().WithName("sparse_vector").WithDataType(entity.FieldTypeSparseVector)).
    WithFunction(fn)
```
