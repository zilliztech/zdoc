---
title: "Vector | Go | v2"
slug: /go/go/v2-Vector
sidebar_label: "Vector"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ベクトルデータ用のインターフェースです。実装には FloatVector、BinaryVector、Float16Vector、BFloat16Vector、Int8Vector、Text が含まれます。 | Go | v2"
type: docx
token: CE0odAFVdoh2ehxNFRecD8WEn3f
sidebar_position: 21
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - cloud
  - Vector
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Vector

ベクトルデータ用のインターフェースです。実装には FloatVector、BinaryVector、Float16Vector、BFloat16Vector、Int8Vector、Text が含まれます。

```go
type Vector interface {
    Dim() int
    Serialize() []byte
    FieldType() FieldType
}
```

**メソッド:**

- `Dim() int`

    ベクトルの次元数を返します。

- `Serialize() []byte`

    ベクトルデータをバイト列にシリアライズします。

- `FieldType() FieldType`

    このベクトル型に対応する FieldType 列挙値を返します。

## Vector 配列型\{#vector-array-types}

- `FloatVectorArray`

    これは複数の FloatVector 値を 1 つのクエリベクトルスロットにまとめ、struct 配列の ArrayOfVector サブフィールドに対する MAX_SIM スタイル検索に使用します。

- `Float16VectorArray`

    これは複数の Float16Vector 値を EmbListFloat16Vector 検索用にまとめます。

- `BFloat16VectorArray`

    これは複数の BFloat16Vector 値を EmbListBFloat16Vector 検索用にまとめます。

- `BinaryVectorArray`

    これは複数の BinaryVector 値を EmbListBinaryVector 検索用にまとめます。

- `Int8VectorArray`

    これは複数の Int8Vector 値を EmbListInt8Vector 検索用にまとめます。

## 例\{#example}

```go
// Vector is typically obtained from API calls or constructors
// TODO: Usage example
```
