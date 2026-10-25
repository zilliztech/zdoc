---
title: "ColumnFloatVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloatVectorArray
sidebar_label: "ColumnFloatVectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnFloatVectorArray インスタンスは、各行に共通の次元を持つ float ベクトル値が格納された ArrayOfVector の float ベクトル列を表します。v3.0.0 では Nullable セマンティクスが適用され、nullability フラグと有効値の記録はスタブではなく実際の操作です。 | Go | v2"
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
  - クラウド
  - ColumnFloatVectorArray
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ColumnFloatVectorArray

ColumnFloatVectorArray インスタンスは、各行に共通の次元を持つ float ベクトル値が格納された ArrayOfVector の float ベクトル列を表します。v3.0.0 では Nullable セマンティクスが適用され、nullability フラグと有効値の記録はスタブではなく実際の操作です。

```go
type ColumnFloatVectorArray struct {
}
```

**ビルダーメソッド：**

- `AppendValue(value any) error`

    []entity.FloatVector または [][]float32 として指定された 1 行を追加します。

- `IsNull(idx int) (bool, error)`

    指定されたインデックスにある行が null かどうかを報告します。

- `Nullable() bool`

    この列が null 値を受け入れるかどうかを報告します。

- `SetNullable(nullable bool)`

    列が null 値を受け入れるかどうかを設定します。

- `ValidCount() int`

    null 以外の行数を返します。

- `ValidateNullable() error`

    nullable の内部管理情報を検証し、不一致の場合はエラーを返します。

**メソッド：**

- `Slice(start, end int) Column`

## 例\{#example}

ColumnFloatVectorArray の使用例を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnFloatVectorArray("embeddings", 4, [][][]float32{{{0.1, 0.2, 0.3, 0.4}}})
fmt.Println(values.Len())
```
