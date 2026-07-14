---
title: "DataType | Java | v2"
slug: /java/java/v2-Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "以下の定数を提供する列挙型です。 | Java | v2"
type: docx
token: RZ8idPxaho5yMoxJzGdc7QAcnNf
sidebar_position: 10
keywords: 
  - Serverless ベクトルデータベース
  - milvus オープンソース
  - milvus はどのように動作するか
  - Zilliz ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - DataType
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# DataType

以下の定数を提供する列挙型です。

## Constants\{#constants}

- None(0)

    データ型を **NoneType** に設定します。

- Bool(1)

    データ型を **Boolean** に設定します。

- Int8(2)

    データ型を **Int8** に設定します。

- Int16(3)

    データ型を **Int16** に設定します。

- Int32(4)

    データ型を **Int32** に設定します。

- Int64(5)

    データ型を **Int64** に設定します。

- Float(10)

    データ型を **Float** に設定します。

- Double(11)

    データ型を **Double** に設定します。

- VarChar(21)

    データ型を **VarChar** に設定します。

- Array(22)

    データ型を **Array** に設定します。

- JSON(23)

    データ型を **JSON** に設定します。

- Geometry(24)

    データ型を **Geometry** に設定します。

- Timestamptz(26)

    データ型を **Timestamptz** に設定します。

- BinaryVector(100)

    データ型を **Binary Vector** に設定します。

- FloatVector(101)

    データ型を **Float Vector** に設定します。

- Float16Vector(102)

    データ型を **Float16 Vector** に設定します。

- BFloat16Vector(103)

    データ型を **BFloat16 Vector** に設定します。

- SparseFloatVector(104)

    データ型を **Sparse Vector** に設定します。

- Inv8Vector(105)

    データ型を **Int8 Vector** に設定します。

- Struct(201)

    データ型を **Struct** に設定します。これは **Array** フィールドの要素型である必要があります。
