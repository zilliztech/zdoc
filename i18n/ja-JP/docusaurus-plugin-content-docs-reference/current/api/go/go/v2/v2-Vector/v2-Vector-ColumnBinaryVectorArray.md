---
title: "ColumnBinaryVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBinaryVectorArray
sidebar_label: "ColumnBinaryVectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnBinaryVectorArray インスタンスは、行に共通の次元を持つバイナリベクトル値を含む ArrayOfVector バイナリベクトル列を表します。v3.0.0 では null 許容セマンティクスが適用されます。null 許容フラグと有効値の記録は、スタブではなく実際の操作です。 | Go | v2"
type: docx
token: VKeBdnkoXoI29txzTuncqsaDnte
sidebar_position: 2
keywords: 
  - ベクトル検索
  - kNN アルゴリズム
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - クラウド
  - ColumnBinaryVectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnBinaryVectorArray

ColumnBinaryVectorArray インスタンスは、行に共通の次元を持つバイナリベクトル値を含む ArrayOfVector バイナリベクトル列を表します。v3.0.0 では null 許容セマンティクスが適用されます。null 許容フラグと有効値の記録は、スタブではなく実際の操作です。

```go
type ColumnBinaryVectorArray struct {
}
```

**ビルダーメソッド：**

- `AppendValue(value any) error`

    これは、[]entity.BinaryVector または [][]byte として指定された 1 行を追加します。

- `IsNull(idx int) (bool, error)`

    指定されたインデックスにある行が null かどうかを報告します。

- `Nullable() bool`

    この列が null 値を受け入れるかどうかを報告します。

- `SetNullable(nullable bool)`

    この列が null 値を受け入れるかどうかを設定します。

- `ValidCount() int`

    null ではない行の数を返します。

- `ValidateNullable() error`

    内部の null 許容の記録を検証し、不一致がある場合はエラーを返します。

**メソッド：**

- `Slice(start, end int) Column`

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
