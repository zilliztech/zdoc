---
title: "ColumnFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloat16VectorArray
sidebar_label: "ColumnFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "行に共通の次元を持つ Float16 値を含む ArrayOfVector カラムを表します。 | Go | v2"
type: docx
token: Ip2HdObkAodufpxSIoTcJ6rbnWf
sidebar_position: 4
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnFloat16VectorArray

行に共通の次元を持つ Float16 値を含む ArrayOfVector カラムを表します。

```go
type ColumnFloat16VectorArray struct {
}
```

## リクエスト構文\{#request-syntax}

行指向の vector-array データから ColumnFloat16VectorArray を作成します。

```go
column.NewColumnFloat16VectorArray(fieldName string, dim int, data [][][]byte) *ColumnFloat16VectorArray
```

**メソッド:**

- `AppendValue(value any) error`

    これにより、`[]entity.Float16Vector` または `[][]byte` として渡された 1 行が追加されます。

**戻り値の型:**

*ColumnFloat16VectorArray*

**戻り値:**

struct 配列フィールド内の ArrayOfVector float16-vector データ用の column 型。

## 例\{#example}

ColumnFloat16VectorArray の使用方法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnFloat16VectorArray("embeddings", 4, [][][]byte{{{0, 1, 2, 3}}})
fmt.Println(values.Len())
```
