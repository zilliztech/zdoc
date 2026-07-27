---
title: "ColumnInt8VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnInt8VectorArray
sidebar_label: "ColumnInt8VectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "行に共有次元を持つ Int8 値を含む ArrayOfVector 列を表します。 | Go | v2"
type: docx
token: Snk1duMEtoe1VexGeJYcXW7VnXe
sidebar_position: 6
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

行に共有次元を持つ Int8 値を含む ArrayOfVector 列を表します。

```go
type ColumnInt8VectorArray struct {
}
```

## リクエスト構文\{#request-syntax}

行指向の vector-array データから ColumnInt8VectorArray を作成します。

```go
column.NewColumnInt8VectorArray(fieldName string, dim int, data [][][]int8) *ColumnInt8VectorArray
```

**メソッド:**

- `AppendValue(value any) error`

    これにより、[]entity.Int8Vector または [][]int8 として指定された 1 行が追加されます。

**戻り値の型:**

*ColumnInt8VectorArray*

**戻り値:**

struct array フィールド内の ArrayOfVector int8-vector データ用の列型です。

## 例\{#example}

ColumnInt8VectorArray の使用方法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnInt8VectorArray("embeddings", 4, [][][]int8{{{1, 2, 3, 4}}})
fmt.Println(values.Len())
```
