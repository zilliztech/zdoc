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

    Sets the data type to **Float ベクトル**.

- BINARY_VECTOR

    Sets the data type to **Binary ベクトル**.

- FLOAT16_VECTOR

    Sets the data type to **Float16 ベクトル**.

- BFLOAT16_VECTOR

    Sets the data type to **BFloat16 ベクトル**.

- INT8_VECTOR

    Sets the data type to **Int8 ベクトル**. This data type is designed for quantized deep learning models (e.g., ResNet, EfficientNet), which reduces model size and speeds up inference with minimal precision loss.

- SPARSE_FLOAT_VECTOR

    Sets the data type to **Sparse ベクトル**.
