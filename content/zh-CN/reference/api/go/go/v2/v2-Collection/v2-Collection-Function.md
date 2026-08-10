---
title: "Function | Go | v2"
slug: /go/go/v2-Collection-Function
sidebar_label: "Function"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "定义可附加到 Collection Schema 的内置函数（例如 BM25、文本嵌入）。 | Go | v2"
type: docx
token: G4dTdejt8otbQWxUqvucwKnBnYg
sidebar_position: 17
keywords: 
  - Chroma vs Milvus
  - Annoy 向量搜索
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

定义可附加到 Collection Schema 的内置函数（例如 BM25、文本嵌入）。

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

## 构造函数\{#constructor}

```go
entity.NewFunction().
    WithName(name).
    WithInputFields(inputFields).
    WithOutputFields(outputFields).
    WithType(funcType).
    // ...
```

**构建器方法：**

- `WithName(name string)`

    设置函数名称。

- `WithInputFields(inputFields ...string)`

    设置函数的输入字段名称。

- `WithOutputFields(outputFields ...string)`

    设置函数的输出字段名称。

- `WithType(funcType FunctionType)`

    设置函数类型（BM25、TextEmbedding、Rerank）。

- `WithParam(key string, value any)`

    设置函数参数的键值对。

## 示例\{#example}

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
