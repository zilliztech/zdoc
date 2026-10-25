---
title: "ColumnBFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBFloat16VectorArray
sidebar_label: "ColumnBFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnBFloat16VectorArray インスタンスは、行が共有次元の bfloat16 ベクトル値を含む ArrayOfVector bfloat16 ベクトル列を表します。v3.0.0 では null 許容セマンティクスが適用されます。null 許容フラグと有効値の記録は、スタブではなく実際の操作です。 | Go | v2"
type: docx
token: OG2HdyPMzoO7y7xob6HcX1V0n7b
sidebar_position: 2
keywords: 
  - LLMs
  - 機械学習
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - クラウド
  - ColumnBFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ColumnBFloat16VectorArray

ColumnBFloat16VectorArray インスタンスは、行が共有次元の bfloat16 ベクトル値を含む ArrayOfVector bfloat16 ベクトル列を表します。v3.0.0 では null 許容セマンティクスが適用されます。null 許容フラグと有効値の記録は、スタブではなく実際の操作です。

```go
type ColumnBFloat16VectorArray struct {
}
```

**ビルダーメソッド:**

- `AppendValue(value any) error`

    これは、[]entity.BFloat16Vector または [][]byte として指定された 1 行を追加します。

- `IsNull(idx int) (bool, error)`

    指定されたインデックスにある行が null かどうかを返します。

- `Nullable() bool`

    列が null 値を受け入れるかどうかを返します。

- `SetNullable(nullable bool)`

    列が null 値を受け入れるかどうかを設定します。

- `ValidCount() int`

    null ではない行の数を返します。

- `ValidateNullable() error`

    内部の null 許容の記録を検証し、不一致がある場合はエラーを返します。

**メソッド:**

- `Slice(start, end int) Column`

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
