---
title: "DataType | Node.js"
slug: /node/node/Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "这是一个提供以下常量的枚举。 | Node.js"
type: docx
token: AtLEdt0ZWoUbHoxkfvHcq1ZunUg
sidebar_position: 6
keywords: 
  - 检索增强生成
  - 大语言模型
  - 向量化
  - k 近邻算法
  - zilliz
  - zilliz cloud
  - 云
  - DataType
  - nodejs30
displayed_sidebar: nodeSidebar

---

# DataType

定义 Milvus 字段支持的逻辑数据类型。

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

**常量：**

- **None** (0)

    将数据类型设置为 **None**。

- **Bool** (1)

    将数据类型设置为 **Boolean**。

- **Int8** (2)

    将数据类型设置为 **Int8**。

- **Int16** (3)

    将数据类型设置为 **Int16**。

- **Int32** (4)

    将数据类型设置为 **Int32**。

- **Int64** (5)

    将数据类型设置为 **Int64**。

- **Float** (10)

    将数据类型设置为 **Float**。

- **Double** (11)

    将数据类型设置为 **Double**。

- **VarChar** (21)

    将数据类型设置为 **VarChar**，即具有指定最大长度的变长字符串。

- **Array** (22)

    将数据类型设置为 **Array**。

- **JSON** (23)

    将数据类型设置为 **JSON**。

- **Geometry** (24)

    将数据类型设置为 **Geometry**。

- **Text** (25)

    将数据类型设置为 **Text**，即没有 `max_length` 限制的变长字符串。这需要 **StorageV3**。

- **Timestamptz** (26)

    将数据类型设置为 **Timestamptz**。

- **BinaryVector** (100)

    将数据类型设置为 **BinaryVector**。

- **FloatVector** (101)

    将数据类型设置为 **FloatVector**。

- **Float16Vector** (102)

    将数据类型设置为 **Float16Vector**。

- **BFloat16Vector** (103)

    将数据类型设置为 **BFloat16Vector**。

- **SparseFloatVector** (104)

    将数据类型设置为 **SparseFloatVector**。

- **Int8Vector** (105)

    将数据类型设置为 **Int8Vector**。

- **ArrayOfVector** (106)

    将数据类型设置为 **ArrayOfVector**。

- **Struct** (201)

    将数据类型设置为 **Struct**。请注意，这仅适用于 **Array** 字段中的元素。

## 示例\{#example}

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
