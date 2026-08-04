---
title: "ColumnFloatVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloatVectorArray
sidebar_label: "ColumnFloatVectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "行に共有次元を持つ Float 値を含む ArrayOfVector カラムを表します。 | Go | v2"
type: docx
token: FEsedrkZpoiR3YxNgL4csDP4nEe
sidebar_position: 5
keywords: 
  - ハイブリッド検索
  - lexical search
  - 最近傍検索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnFloatVectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnFloatVectorArray

行に共有次元を持つ Float 値を含む ArrayOfVector カラムを表します。

```go
type ColumnFloatVectorArray struct {
}
```

## リクエスト構文\{#request-syntax}

行指向の vector-array データから ColumnFloatVectorArray を作成します。

```go
column.NewColumnFloatVectorArray(fieldName string, dim int, data [][][]float32) *ColumnFloatVectorArray
```

**メソッド:**

- `AppendValue(value any) error`

    これにより、[]entity.FloatVector または [][]float32 として渡された 1 行が追加されます。

**戻り値の型:**

*ColumnFloatVectorArray*

**戻り値:**

struct array フィールド内の ArrayOfVector float-vector データ用のカラム型です。

## 例\{#example}

ColumnFloatVectorArray の使用方法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnFloatVectorArray("embeddings", 4, [][][]float32{{{0.1, 0.2, 0.3, 0.4}}})
fmt.Println(values.Len())
```
