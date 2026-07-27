---
title: "ColumnBinaryVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBinaryVectorArray
sidebar_label: "ColumnBinaryVectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "行に共有された次元を持つ Binary 値を含む ArrayOfVector 列を表します。 | Go | v2"
type: docx
token: VKeBdnkoXoI29txzTuncqsaDnte
sidebar_position: 3
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnBinaryVectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnBinaryVectorArray

行に共有された次元を持つ Binary 値を含む ArrayOfVector 列を表します。

```go
type ColumnBinaryVectorArray struct {
}
```

## リクエスト構文\{#request-syntax}

行指向の vector-array データから ColumnBinaryVectorArray を作成します。

```go
column.NewColumnBinaryVectorArray(fieldName string, dim int, data [][][]byte) *ColumnBinaryVectorArray
```

**メソッド:**

- `AppendValue(value any) error`

    これにより、`[]entity.BinaryVector` または `[][]byte` として提供された 1 行が追加されます。

**戻り値の型:**

*ColumnBinaryVectorArray*

**戻り値:**

struct 配列フィールド内の ArrayOfVector binary-vector データ用の列型。

## 例\{#example}

ColumnBinaryVectorArray の使用方法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnBinaryVectorArray("embeddings", 8, [][][]byte{{{0xff}}})
fmt.Println(values.Len())
```
