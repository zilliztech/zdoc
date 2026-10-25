---
title: "ColumnInt8VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnInt8VectorArray
sidebar_label: "ColumnInt8VectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnInt8VectorArray インスタンスは、行に共通の次元を持つ int8 ベクトル値を含む ArrayOfVector int8 ベクトル列を表します。Nullable セマンティクスは v3.0.0 で適用されます。null 許容フラグと有効値の記録は、スタブではなく実際の操作です。 | Go | v2"
type: docx
token: Snk1duMEtoe1VexGeJYcXW7VnXe
sidebar_position: 6
keywords: 
  - LLM
  - 機械学習
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - クラウド
  - ColumnInt8VectorArray
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ColumnInt8VectorArray

ColumnInt8VectorArray インスタンスは、行に共通の次元を持つ int8 ベクトル値を含む ArrayOfVector int8 ベクトル列を表します。Nullable セマンティクスは v3.0.0 で適用されます。null 許容フラグと有効値の記録は、スタブではなく実際の操作です。

```go
type ColumnInt8VectorArray struct {
}
```

**ビルダーメソッド：**

- `AppendValue(value any) error`

    []entity.Int8Vector または [][]int8 として指定された 1 行を追加します。

- `IsNull(idx int) (bool, error)`

    指定されたインデックスの行が null かどうかを報告します。

- `Nullable() bool`

    この列が null 値を受け入れるかどうかを報告します。

- `SetNullable(nullable bool)`

    この列が null 値を受け入れるかどうかを設定します。

- `ValidCount() int`

    null でない行の数を返します。

- `ValidateNullable() error`

    内部の null 許容ブックキーピングを検証し、不一致の場合はエラーを返します。

**メソッド：**

- `Slice(start, end int) Column`

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
