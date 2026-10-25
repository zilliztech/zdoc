---
title: "ベクトル | Go | v2"
slug: /go/go/v2-Vector
sidebar_label: "ベクトル"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ベクトルデータのインターフェースです。実装には、FloatVector、BinaryVector、Float16Vector、BFloat16Vector、Int8Vector、Text があります。 | Go | v2"
type: docx
token: CE0odAFVdoh2ehxNFRecD8WEn3f
sidebar_position: 21
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - ベクトル
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ベクトル

ベクトルデータのインターフェースです。実装には、FloatVector、BinaryVector、Float16Vector、BFloat16Vector、Int8Vector、Text があります。

```go
type Vector interface {
    Dim() int
    Serialize() []byte
    FieldType() FieldType
}
```

**メソッド：**

- `Dim() int`

    ベクトルの次元数を返します。

- `Serialize() []byte`

    ベクトルデータをバイト列にシリアル化します。

- `FieldType() FieldType`

    このベクトル型の FieldType 列挙値を返します。

## ベクトル配列型\{#vector-array-types}

- `FloatVectorArray`

    複数の FloatVector 値を 1 つのクエリベクトルスロットにまとめ、構造体配列の ArrayOfVector サブフィールドに対して MAX_SIM 形式の検索を実行できるようにします。

- `Float16VectorArray`

    EmbListFloat16Vector 検索用に、複数の Float16Vector 値をまとめます。

- `BFloat16VectorArray`

    EmbListBFloat16Vector 検索用に、複数の BFloat16Vector 値をまとめます。

- `BinaryVectorArray`

    EmbListBinaryVector 検索用に、複数の BinaryVector 値をまとめます。

- `Int8VectorArray`

    EmbListInt8Vector 検索用に、複数の Int8Vector 値をまとめます。

## 例\{#example}

```go
// Vector is typically obtained from API calls or constructors
// TODO: Usage example
```
