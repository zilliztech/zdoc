---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Collection 的 Schema 由 CollectionSchema 实例表示。Schema 概述了 Collection 的结构。 | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - 幻觉 LLM
  - 多模态搜索
  - zilliz
  - zilliz cloud
  - 云
  - CollectionSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

**CollectionSchema** 实例表示 Collection 的 Schema。Schema 概述了 Collection 的结构。

```python
class pymilvus.CollectionSchema
```

## 构造函数\{#constructor}

通过定义字段、数据类型和其他参数来构造 Collection 的 Schema。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**参数：**

- **fields**（*list*）-

    **[必需]**

    由 **[FieldSchema](./ORM-FieldSchema)** 对象组成的列表，用于定义 Collection Schema 中的字段。

    <Admonition type="info" icon="📘" title="Note">

    什么是字段 Schema？
    
        字段 Schema 表示单个字段并包含其元数据，而 **CollectionSchema** 将一组 FieldSchema 对象组织在一起，以定义完整的 Schema。

    </Admonition>

- **description**（*string*）-

    Schema 的描述。

    如果未提供描述，则将其设为空字符串。

- **external_source**（*str*）-

    外部源 URI，应为指向可访问外部卷的 `volume://` URI。例如：`volume://<volume-name>/path/to/folder/`..

- **external_spec**（*str*）-

    外部源规格，它是一组二级参数：

    - **format**（*str*）- 

        目标源数据文件的格式。

        可能的值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **snapshot_id**（*str*）-

        Iceberg 表的 ID。仅当 `format` 为 `iceberg-table` 时适用。

- **kwargs** -

    - **auto_id**（*bool*）-

        是否允许主字段自动递增。

        将此项设置为 **True** 会使主字段自动递增。在这种情况下，为避免出错，待插入的数据中不应包含主字段。

        此参数不适用于外部 Collection。

    - **enable_dynamic_field**（*bool*）-

        如果插入到目标 Collection 的数据中包含 Collection Schema 中未定义的字段，是否允许 Zilliz Cloud 将这些未定义字段的值保存到动态字段中。

        当您将此项设置为 **True** 时，Zilliz Cloud 将创建一个名为 **&#36;meta** 的字段，用于存储插入数据中的所有未定义字段及其值。

        此参数不适用于外部 Collection。

        <Admonition type="info" icon="📘" title="Note">

        什么是动态字段？
        
                如果插入到目标 Collection 的数据中包含 Collection Schema 中未定义的字段，这些字段将作为键值对保存在动态字段中。

        </Admonition>

    - **primary_field**（*str*）-

        主字段的名称。

        该值应为 **fields** 中列出的某个字段名称。

        或者，您也可以在创建 **[FieldSchema](./ORM-FieldSchema)** 对象时设置 **is_primary**。

        此参数不适用于外部 Collection。

    - **partition_key_field**（*str*）-

        用作 Partition 键的字段名称。

        该值应为 **fields** 中列出的某个字段名称。

        设置此项后，Zilliz Cloud 将管理当前 Collection 中的所有 Partition。

        或者，您也可以在创建 **[FieldSchema](./ORM-FieldSchema)** 对象时设置 **is_partition_key**。

        此参数不适用于外部 Collection。

        <Admonition type="info" icon="📘" title="Note">

        什么是 Partition 键？
        
                一旦某个字段被指定为 Partition 键，Zilliz Cloud 会为该字段中的每个唯一值自动创建一个 Partition，并相应地将 Entity 保存到这些 Partition 中。
        
                这在基于特定键实现数据隔离时尤其有用，例如面向 Partition 的多租户。
        
                或者，您也可以在创建 **CollectionSchema** 对象时设置 **partition_key_field**。

        </Admonition>

    - **partition_key_isolation**（*bool*）-

        是否启用 Partition 键隔离，以进一步提升基于 Partition 键进行标量过滤时的搜索性能。详情请参见 [使用 Partition 键隔离](/docs/use-partition-key#use-partition-key-isolation)。

        此参数不适用于外部 Collection。

**返回类型：**

*CollectionSchema*

**返回值：**

一个 **CollectionSchema** 对象。

**异常：**

- **FieldsTypeException**：

    当 **fields** 参数不是列表时，将引发此异常。

- **FieldTypeException**：

    当 **fields** 列表中的某个字段不是 **[FieldSchema](./ORM-FieldSchema)** 对象时，将引发此异常。

- **PrimaryKeyException：**

    在以下情况下将引发此异常：

    - 已设置 **primary_field** 参数，但其值不是字符串。

    - 已设置 **primary_field** 参数，但其值不是任何已列出字段的名称。

- **PartitionKeyException：**

    在以下情况下将引发此异常：

    - 已设置 **partition_key_field** 参数，但其值不是字符串。

    - 已设置 **partition_key_field** 参数，但其值不是任何已列出字段的名称。

- **AutoIDException：**

    - 如果已设置 **auto_id** 参数，但其值不是布尔值，则将引发此异常。

## 示例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

# Define fields in a schema
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768
)

# Construct a schema with the predefined fields
schema = CollectionSchema(
    fields=[primary_key, vector],
    description="example_schema"
)
```

## 方法\{#methods}

以下是 `CollectionSchema` 类的方法：

