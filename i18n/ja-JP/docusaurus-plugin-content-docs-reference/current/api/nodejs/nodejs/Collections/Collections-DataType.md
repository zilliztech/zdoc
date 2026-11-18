---
title: "DataType | Node.js"
slug: /node/node/Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "これは、以下の定数を提供する列挙型です。 | Node.js"
type: docx
token: AtLEdt0ZWoUbHoxkfvHcq1ZunUg
sidebar_position: 6
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - DataType
  - nodejs30
displayed_sidebar: nodeSidebar

---

# DataType

Milvus のフィールドでサポートされる論理データ型を定義します。

```typescript
export enum DataType {
  None = 0,
  Bool = 1,
  Int8 = 2,
  Int16 = 3,
  Int32 = 4,
  Int64 = 5,

  Float = 10,
  Double = 11,

  VarChar = 21, // variable-length strings with a specified maximum length
  Array = 22,
  JSON = 23,
  Geometry = 24,
  Text = 25, // variable-length strings without a max_length limit; requires StorageV3
  Timestamptz = 26,

  BinaryVector = 100,
  FloatVector = 101,
  Float16Vector = 102,
  BFloat16Vector = 103,
  SparseFloatVector = 104,
  Int8Vector = 105,
  ArrayOfVector = 106,

  Struct = 201,
}
```

**定数：**

- **None** (0)

    データ型を **None** に設定します。

- **Bool** (1)

    データ型を **Boolean** に設定します。

- **Int8** (2)

    データ型を **Int8** に設定します。

- **Int16** (3)

    データ型を **Int16** に設定します。

- **Int32** (4)

    データ型を **Int32** に設定します。

- **Int64** (5)

    データ型を **Int64** に設定します。

- **Float** (10)

    データ型を **Float** に設定します。

- **Double** (11)

    データ型を **Double** に設定します。

- **VarChar** (21)

    データ型を、指定した最大長を持つ可変長文字列である **VarChar** に設定します。

- **Array** (22)

    データ型を **Array** に設定します。

- **JSON** (23)

    データ型を **JSON** に設定します。

- **Geometry** (24)

    データ型を **Geometry** に設定します。

- **Text** (25)

    データ型を、`max_length` の制限がない可変長文字列である **Text** に設定します。このデータ型には **StorageV3** が必要です。

- **Timestamptz** (26)

    データ型を **Timestamptz** に設定します。

- **BinaryVector** (100)

    データ型を **BinaryVector** に設定します。

- **FloatVector** (101)

    データ型を **FloatVector** に設定します。

- **Float16Vector** (102)

    データ型を **Float16Vector** に設定します。

- **BFloat16Vector** (103)

    データ型を **BFloat16Vector** に設定します。

- **SparseFloatVector** (104)

    データ型を **SparseFloatVector** に設定します。

- **Int8Vector** (105)

    データ型を **Int8Vector** に設定します。

- **ArrayOfVector** (106)

    データ型を **ArrayOfVector** に設定します。

- **Struct** (201)

    データ型を **Struct** に設定します。これは **Array** フィールド内の要素にのみ適用されることに注意してください。

## 例\{#example}

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

await milvusClient.createCollection({
    collection_name: 'my_collection',
    fields: [
        { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
        { name: 'text', data_type: DataType.VarChar, type_params: { max_length: 512 } },
        { name: 'vector', data_type: DataType.FloatVector, type_params: { dim: 8 } },
    ],
});
```
