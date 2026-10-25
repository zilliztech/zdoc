---
title: "ColumnFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloat16VectorArray
sidebar_label: "ColumnFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnFloat16VectorArray インスタンスは、各行に共通の次元を持つ float16 ベクトル値が格納された ArrayOfVector の float16 ベクトル列を表します。v3.0.0 では Nullable セマンティクスが適用され、nullability フラグと有効値の記録はスタブではなく実際の操作です。 | Go | v2"
type: docx
token: Ip2HdObkAodufpxSIoTcJ6rbnWf
sidebar_position: 4
keywords: 
  - ベクトルデータベース比較
  - Faiss
  - 動画検索
  - AI ハルシネーション
  - zilliz
  - zilliz cloud
  - クラウド
  - ColumnFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ColumnFloat16VectorArray

ColumnFloat16VectorArray インスタンスは、各行に共通の次元を持つ float16 ベクトル値が格納された ArrayOfVector の float16 ベクトル列を表します。v3.0.0 では Nullable セマンティクスが適用され、nullability フラグと有効値の記録はスタブではなく実際の操作です。

```go
type ColumnFloat16VectorArray struct {
}
```

**ビルダーメソッド：**

- `AppendValue(value any) error`

    []entity.Float16Vector または [][]byte として指定された 1 行を追加します。

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

ColumnFloat16VectorArray の使用例を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnFloat16VectorArray("embeddings", 4, [][][]byte{{{0, 1, 2, 3}}})
fmt.Println(values.Len())
```
