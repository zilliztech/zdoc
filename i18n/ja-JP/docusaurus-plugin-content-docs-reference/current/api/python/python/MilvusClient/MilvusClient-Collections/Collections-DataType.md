---
title: "DataType | Python | MilvusClient"
slug: /python/python/Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "以下の定数を提供する列挙型です。 | Python | MilvusClient"
type: docx
token: MKrAdumLvohQfDxgpMwcEB8dnqb
sidebar_position: 7
keywords: 
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - DataType
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# DataType

以下の定数を提供する列挙型です。

## Constants\{#constants}

- BOOL

    データ型を **Boolean** に設定します。

- INT8

    データ型を **Int8** に設定します。

- INT16

    データ型を **Int16** に設定します。

- INT32

    データ型を **Int32** に設定します。

- INT64

    データ型を **Int64** に設定します。

- FLOAT

    データ型を **Float** に設定します。

- DOUBLE

    データ型を **Double** に設定します。

- VARCHAR

    データ型を **Varchar** に設定します。

- TEXT

    データ型を **TEXT** に設定します。ドキュメント、パッセージ、チケット、ログなどの長いテキストコンテンツを保存するには、このスカラー型を使用します。**VARCHAR** とは異なり、TEXT では `max_length` は不要です。

- ARRAY

    データ型を **Array** に設定します。

- JSON

    データ型を **JSON** に設定します。

- GEOMETRY

    データ型を **Geometry** に設定します。

- TIMESTAMPTZ

    データ型を **TIMESTAMPTZ** に設定します。

- STRUCT

    Array フィールド内の要素のデータ型を **Struct** に設定します。

- FLOAT_VECTOR

    データ型を **Float Vector** に設定します。

- BINARY_VECTOR

    データ型を **Binary Vector** に設定します。

- FLOAT16_VECTOR

    データ型を **Float16 Vector** に設定します。

- BFLOAT16_VECTOR

    データ型を **BFloat16 Vector** に設定します。

- INT8_VECTOR

    データ型を **Int8 Vector** に設定します。このデータ型は、量子化された深層学習モデル（例: ResNet、EfficientNet）向けに設計されており、精度の損失を最小限に抑えながら、モデルサイズを削減し、推論を高速化します。

- SPARSE_FLOAT_VECTOR

    データ型を **Sparse Vector** に設定します。
