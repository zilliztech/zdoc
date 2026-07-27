---
title: "ColumnBFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBFloat16VectorArray
sidebar_label: "ColumnBFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "行に共有次元を持つ BFloat16 値を含む ArrayOfVector 列を表します。 | Go | v2"
type: docx
token: OG2HdyPMzoO7y7xob6HcX1V0n7b
sidebar_position: 2
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnBFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnBFloat16VectorArray

行に共有次元を持つ BFloat16 値を含む ArrayOfVector 列を表します。

```go
type ColumnBFloat16VectorArray struct {
}
```

## リクエスト構文\{#request-syntax}

行指向の vector-array データから ColumnBFloat16VectorArray を作成します。

```go
column.NewColumnBFloat16VectorArray(fieldName string, dim int, data [][][]byte) *ColumnBFloat16VectorArray
```

**メソッド:**

- `AppendValue(value any) error`

    これにより、`[]entity.BFloat16Vector` または `[][]byte` として指定された 1 行が追加されます。

**戻り値の型:**

*ColumnBFloat16VectorArray*

**戻り値:**

struct array フィールド内の ArrayOfVector bfloat16-vector データ用の列型です。

## 例\{#example}

ColumnBFloat16VectorArray の使用方法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnBFloat16VectorArray("embeddings", 4, [][][]byte{{{0, 1, 2, 3}}})
fmt.Println(values.Len())
```
