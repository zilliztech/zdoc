---
title: "FieldType | Node.js"
slug: /node/node/Collections-FieldType
sidebar_label: "FieldType"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作描述 Collection Schema 支持的字段类型。 | Node.js"
type: origin
token: shared-Collections-FieldType
keywords: 
  - 字段类型
  - Schema
  - Zilliz
  - Zilliz Cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FieldType

描述 Collection Schema 中的一个字段。

<NextChannel action="exclude">

```typescript
export type FieldType = {
  name: string;
  description?: string;
  data_type: DataType | keyof typeof DataTypeMap;
  element_type?: DataType | keyof typeof DataTypeMap;
  is_primary_key?: boolean;
  is_partition_key?: boolean;
  is_function_output?: boolean;
  is_clustering_key?: boolean;
  type_params?: Partial<Record<TypeParamKey, TypeParam>>;
  autoID?: boolean;
  default_value?: number | string;
  nullable?: boolean;
  external_field?: string;
  fields?: FieldType[];
} & Partial<Record<TypeParamKey, TypeParam>>;
```

</NextChannel>

<NextChannel action="include">

```typescript
export type FieldType = {
  name: string;
  description?: string;
  data_type: DataType | keyof typeof DataTypeMap;
  element_type?: DataType | keyof typeof DataTypeMap;
  is_primary_key?: boolean;
  is_partition_key?: boolean;
  is_function_output?: boolean;
  is_clustering_key?: boolean;
  type_params?: Partial<Record<TypeParamKey, TypeParam>>;
  autoID?: boolean;
  default_value?: number | string | boolean;
  nullable?: boolean;
  element_nullable?: boolean;
  external_field?: string;
  fields?: FieldType[];
} & Partial<Record<TypeParamKey, TypeParam>>;
```

</NextChannel>

**字段：**

<NextChannel action="exclude">

- **name** (*string*) -

    字段名称。

- **description** (*string*) -

    字段的可选描述。

- **data_type** (*DataType | keyof typeof DataTypeMap*) -

    字段的数据类型。

- **element_type** (*DataType | keyof typeof DataTypeMap*) -

    数组字段的元素类型。

- **is_primary_key** (*boolean*) -

    该字段是否为主键。

- **is_partition_key** (*boolean*) -

    该字段是否为 Partition 键。

- **is_function_output** (*boolean*) -

    该字段是否由函数填充（例如文本嵌入输出）。

- **is_clustering_key** (*boolean*) -

    该字段是否为聚簇键。

- **type_params** (*Partial&lt;Record&lt;TypeParamKey, TypeParam&gt;&gt;*) -

    维度或最大长度等类型参数。

- **autoID** (*boolean*) -

    主键值是否自动生成。

- **default_value** (*number | string*) -

    字段的默认值。

- **nullable** (*boolean*) -

    该字段是否接受 null 值。

- **external_field** (*string*) -

    外部字段映射名称。

- **fields** (*FieldType[]*) -

    用于 struct 字段的嵌套字段。

</NextChannel>

<NextChannel action="include">

- **name** (*string*) -

    字段名称。

- **description** (*string*) -

    字段的可选描述。

- **data_type** (*DataType | keyof typeof DataTypeMap*) -

    字段的数据类型。

- **element_type** (*DataType | keyof typeof DataTypeMap*) -

    数组字段的元素类型。

- **is_primary_key** (*boolean*) -

    该字段是否为主键。

- **is_partition_key** (*boolean*) -

    该字段是否为 Partition 键。

- **is_function_output** (*boolean*) -

    该字段是否由函数填充（例如文本嵌入输出）。

- **is_clustering_key** (*boolean*) -

    该字段是否为聚簇键。

- **type_params** (*Partial&lt;Record&lt;TypeParamKey, TypeParam&gt;&gt;*) -

    维度或最大长度等类型参数。

- **autoID** (*boolean*) -

    主键值是否自动生成。

- **default_value** (*number | string | boolean*) -

    字段的默认值。

- **nullable** (*boolean*) -

    该字段是否接受 null 值。

- **element_nullable** (*boolean*) -

    StructArray 字段的 Array 子字段中的元素是否接受 null 值。仅适用于 StructArray 字段的 Array 子字段。

- **external_field** (*string*) -

    外部字段映射名称。

- **fields** (*FieldType[]*) -

    用于 struct 字段的嵌套字段。

</NextChannel>

## 示例\{#example}

```javascript
import { MilvusClient, DataType, FieldType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const fields = [
    { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
    { name: 'text', data_type: DataType.VarChar, type_params: { max_length: 512 } },
    { name: 'vector', data_type: DataType.FloatVector, type_params: { dim: 8 } },
];

await milvusClient.createCollection({
    collection_name: 'my_collection',
    fields,
});
```
