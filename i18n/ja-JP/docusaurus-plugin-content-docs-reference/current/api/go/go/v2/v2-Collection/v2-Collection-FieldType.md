---
title: "FieldType | Go | v2"
slug: /go/go/v2-Collection-FieldType
sidebar_label: "FieldType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションのフィールドでサポートされているデータ型を列挙します。 | Go | v2"
type: docx
token: Xq9Ydn3OJoYrHmxMVOLcMn9onHc
sidebar_position: 16
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - FieldType
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# FieldType

コレクションのフィールドでサポートされているデータ型を列挙します。

```go
type FieldType int32
```

**値:**

- **FieldTypeNone** = 0

    型が指定されていません。

- **FieldTypeBool** = 1

    Boolean 型。

- **FieldTypeInt8** = 2

    8 ビット整数型。

- **FieldTypeInt16** = 3

    16 ビット整数型。

- **FieldTypeInt32** = 4

    32 ビット整数型。

- **FieldTypeInt64** = 5

    64 ビット整数型。

- **FieldTypeFloat** = 10

    32 ビット浮動小数点型。

- **FieldTypeDouble** = 11

    64 ビット浮動小数点型。

- **FieldTypeTimestamptz** = 15

    タイムゾーン対応のタイムスタンプ型。

- **FieldTypeString** = 20

    文字列型（VarChar のエイリアス）。

- **FieldTypeVarChar** = 21

    可変長文字列型。

- **FieldTypeArray** = 22

    固定された要素型を持つ配列型。

- **FieldTypeJSON** = 23

    JSON ドキュメント型。

- **FieldTypeGeometry** = 24

    Geometry 空間型。

- **FieldTypeBinaryVector** = 100

    バイナリベクトル型。

- **FieldTypeFloatVector** = 101

    32 ビット浮動小数点ベクトル型。

- **FieldTypeFloat16Vector** = 102

    16 ビット浮動小数点ベクトル型。

- **FieldTypeBFloat16Vector** = 103

    Brain floating-point 16 ビットベクトル型。

- **FieldTypeSparseVector** = 104

    スパースベクトル型。

- **FieldTypeInt8Vector** = 105

    8 ビット整数ベクトル型。

- **FieldTypeStruct** = 201

    ネストされたフィールドを持つ Struct 型。

## Example\{#example}

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
)

// Use FieldType when defining collection fields
vectorField := entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(768)

pkField := entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true)

varcharField := entity.NewField().
    WithName("category").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(256)
```
