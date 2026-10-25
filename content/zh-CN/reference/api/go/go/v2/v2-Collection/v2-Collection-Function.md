---
title: "Function | Go | v2"
slug: /go/go/v2-Collection-Function
sidebar_label: "Function"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Function 实例定义可附加到 Collection Schema 的内置函数（例如 BM25、文本嵌入）。 | Go | v2"
type: docx
token: CpbRdh7gOo7yrlxfgTyc65XJnug
sidebar_position: 17
keywords: 
  - Chroma 与 Milvus
  - Annoy 向量搜索
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - Function
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Function

Function 实例定义可附加到 Collection Schema 的内置函数（例如 BM25、文本嵌入）。

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

**字段：**

- **Name** (*string*) -

    函数的名称。

- **Description** (*string*) -

    函数的人类可读描述。

- **Type** (*FunctionType*) -

    函数的类型，例如 BM25 或 Rerank。

- **InputFieldNames** (*[]string*) -

    函数读取的输入字段的名称。

- **OutputFieldNames** (*[]string*) -

    函数将其输出写入的字段的名称。

- **Params** (*map[string]string*) -

    以键值对形式表示的函数参数。

**构建器方法：**

- `WithName(name string)`

    设置函数的名称。

- `WithInputFields(inputFields ...string)`

    设置函数的输入字段名称。

- `WithOutputFields(outputFields ...string)`

    设置函数的输出字段名称。

- `WithType(funcType FunctionType)`

    设置函数类型（BM25、MinHash、TextEmbedding、Rerank）。

- `WithParam(key string, value any)`

    设置函数参数的键值对。

**方法：**

- `Clone() *Function`

    返回 f 的深拷贝。

## 示例\{#example}

演示 Function 的用法。

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
)

// Define a BM25 text embedding function on a VarChar field
fn := entity.NewFunction().
    WithName("bm25_fn").
    WithType(entity.FunctionTypeBM25).
    WithInputFields("text").
    WithOutputFields("sparse_vector")

schema := entity.NewSchema().
    WithName("my_collection").
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
    WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000).WithEnableAnalyzer(true)).
    WithField(entity.NewField().WithName("sparse_vector").WithDataType(entity.FieldTypeSparseVector)).
    WithFunction(fn)
```
