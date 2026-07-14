---
title: "Function | Go | v2"
slug: /go/go/v2-Collection-Function
sidebar_label: "Function"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "collection スキーマにアタッチできる組み込み関数（例: BM25、text embedding）を定義します。 | Go | v2"
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

collection スキーマにアタッチできる組み込み関数（例: BM25、text embedding）を定義します。

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

**ビルダーメソッド:**

- `WithName(name string)`

    関数の名前を設定します。

- `WithInputFields(inputFields ...string)`

    関数の入力フィールド名を設定します。

- `WithOutputFields(outputFields ...string)`

    関数の出力フィールド名を設定します。

- `WithType(funcType FunctionType)`

    関数タイプ（BM25、TextEmbedding、Rerank）を設定します。

- `WithParam(key string, value any)`

    関数パラメータのキーと値のペアを設定します。

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
