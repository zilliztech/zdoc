---
title: "Function | Go | v2"
slug: /go/go/v2-Collection-Function
sidebar_label: "Function"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Function インスタンスは、コレクションスキーマにアタッチできる組み込み関数（BM25、テキスト埋め込みなど）を定義します。 | Go | v2"
type: docx
token: CpbRdh7gOo7yrlxfgTyc65XJnug
sidebar_position: 17
keywords: 
  - Chroma vs Milvus
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - クラウド
  - Function
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Function

Function インスタンスは、コレクションスキーマにアタッチできる組み込み関数（BM25、テキスト埋め込みなど）を定義します。

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

**フィールド:**

- **Name** (*string*) -

    関数の名前です。

- **Description** (*string*) -

    関数の人間が読める形式の説明です。

- **Type** (*FunctionType*) -

    関数の種類です（BM25、Rerank など）。

- **InputFieldNames** (*[]string*) -

    関数が読み取る入力フィールドの名前です。

- **OutputFieldNames** (*[]string*) -

    関数が出力を書き込むフィールドの名前です。

- **Params** (*map[string]string*) -

    キーと値のペアで表される関数パラメーターです。

**ビルダーメソッド:**

- `WithName(name string)`

    関数の名前を設定します。

- `WithInputFields(inputFields ...string)`

    関数の入力フィールド名を設定します。

- `WithOutputFields(outputFields ...string)`

    関数の出力フィールド名を設定します。

- `WithType(funcType FunctionType)`

    関数のタイプ（BM25、MinHash、TextEmbedding、Rerank）を設定します。

- `WithParam(key string, value any)`

    関数パラメーターのキーと値のペアを設定します。

**メソッド:**

- `Clone() *Function`

    f のディープコピーを返します。

## 例\{#example}

Function の使用方法を示します。

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
