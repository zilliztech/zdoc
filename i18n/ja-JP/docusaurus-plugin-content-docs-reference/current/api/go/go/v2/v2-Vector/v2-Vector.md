---
title: "Vector | Go | v2"
slug: /go/go/v2-Vector
sidebar_label: "Vector"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "vector データのインターフェース。実装には FloatVector、BinaryVector、Float16Vector、BFloat16Vector、Int8Vector、Text が含まれます。 | Go | v2"
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
  - クラウド
  - Vector
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Vector

vector データのインターフェースです。実装には FloatVector、BinaryVector、Float16Vector、BFloat16Vector、Int8Vector、Text が含まれます。

```go
type Vector interface {
    Dim() int
    Serialize() []byte
    FieldType() FieldType
}
```

**メソッド:**

- `Dim() int`

    vector の次元数を返します。

- `Serialize() []byte`

    vector データをバイト列にシリアライズします。

- `FieldType() FieldType`

    この vector タイプの FieldType 列挙値を返します。

## Vector 配列型\{#vector-array-types}

- `FloatVectorArray`

    複数の FloatVector 値を 1 つのクエリ vector スロットにまとめ、struct 配列の ArrayOfVector サブフィールドに対する MAX_SIM スタイルの検索に使用します。

- `Float16VectorArray`

    EmbListFloat16Vector 検索用に複数の Float16Vector 値をまとめます。

- `BFloat16VectorArray`

    EmbListBFloat16Vector 検索用に複数の BFloat16Vector 値をまとめます。

- `BinaryVectorArray`

    EmbListBinaryVector 検索用に複数の BinaryVector 値をまとめます。

- `Int8VectorArray`

    EmbListInt8Vector 検索用に複数の Int8Vector 値をまとめます。

## 例\{#example}

```go
// Vector is typically obtained from API calls or constructors
// TODO: Usage example
```
