---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema 实例表示集合的 schema。schema 勾勒出集合的结构。 | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

**CollectionSchema** 实例表示集合的 schema。schema 勾勒出集合的结构。

```python
class pymilvus.CollectionSchema
```

## 构造函数\{#constructor}

通过定义字段、数据类型及其他参数来构造集合的 schema。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**参数：**

- **fields** (*list*) -

    **[必需]**

    一个 **[FieldSchema](./ORM-FieldSchema)** 对象列表，用于定义集合 schema 中的字段。

    <Admonition type="info" icon="📘" title="说明">

    什么是字段 schema？
    
        字段 schema 表示并包含单个字段的元数据，而 **CollectionSchema** 将一组 FieldSchema 对象组合起来，以定义完整的 schema。

    </Admonition>

- **description** (*string*) -

    schema 的描述。

    如果未提供描述，则会设置为空字符串。

- **external_source** (*str*) -

    外部数据源 URI，应为指向可访问外部卷的 `volume://` URI。例如，`volume://<volume-name>/path/to/folder/`。

- **external_spec** (*str*) -

    外部数据源规格，是一组次级参数：

    - **format** (*str*) - 

        目标源数据文件的格式。

        可选值包括 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **snapshot_id** (*str*) -

        Iceberg 表的 ID。仅当 `format` 为 `iceberg-table` 时适用。

- **kwargs** -

    - **auto_id** (*bool*) -

        是否允许主字段自动递增。

        将此参数设置为 **True** 会使主字段自动递增。在这种情况下，为避免出错，插入的数据中不应包含主字段。

        此参数不适用于外部集合。

    - **enable_dynamic_field** (*bool*) -

        当插入到目标集合的数据包含集合 schema 中未定义的字段时，是否允许 Zilliz Cloud 将这些未定义字段的值保存到动态字段中。

        当你将此参数设置为 **True** 时，Zilliz Cloud 会创建一个名为 **&#36;meta** 的字段，用于存储插入数据中所有未定义字段及其值。

        此参数不适用于外部集合。

        <Admonition type="info" icon="📘" title="说明">

        什么是动态字段？
        
                如果插入到目标集合的数据包含集合 schema 中未定义的字段，这些字段将以键值对的形式保存在动态字段中。

        </Admonition>

    - **primary_field** (*str*) -

        主字段的名称。

        该值应为 **fields** 中所列某个字段的名称。

        或者，你也可以在创建 **[FieldSchema](./ORM-FieldSchema)** 对象时设置 **is_primary**。

        此参数不适用于外部集合。

    - **partition_key_field** (*str*) -

        用作分区键的字段名称。

        该值应为 **fields** 中所列某个字段的名称。

        设置此参数后，Zilliz Cloud 会管理当前集合中的所有分区。

        或者，你也可以在创建 **[FieldSchema](./ORM-FieldSchema)** 对象时设置 **is_partition_key**。

        此参数不适用于外部集合。

        <Admonition type="info" icon="📘" title="说明">

        什么是分区键？
        
                一旦某个字段被指定为分区键，Zilliz Cloud 会自动为该字段中的每个唯一值创建一个分区，并相应地将实体保存到这些分区中。
        
                这在基于特定键实现数据隔离时尤其有用，例如面向分区的多租户场景。
        
                或者，你也可以在创建 **CollectionSchema** 对象时设置 **partition_key_field**。

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        是否启用分区键隔离，以进一步提升基于分区键进行标量过滤时的搜索性能。详情请参见 [使用分区键隔离](/docs/use-partition-key#use-partition-key-isolation)。

        此参数不适用于外部集合。

**返回类型：**

*CollectionSchema*

**返回值：**

一个 **CollectionSchema** 对象。

**异常：**

- **FieldsTypeException**: 

    当 **fields** 参数不是列表时，将引发此异常。

- **FieldTypeException**: 

    当 **fields** 列表中的某个字段不是 **[FieldSchema](./ORM-FieldSchema)** 对象时，将引发此异常。

- **PrimaryKeyException:**

    在以下情况下将引发此异常：

    - **primary_field** 参数已设置，但其值不是字符串。

    - **primary_field** 参数已设置，但其值不是任何已列出字段的名称。

- **PartitionKeyException:**

    在以下情况下将引发此异常： 

    - **partition_key_field** 参数已设置，但其值不是字符串。

    - **partition_key_field** 参数已设置，但其值不是任何已列出字段的名称。

- **AutoIDException:**

    - 如果 **auto_id** 参数已设置，但其值不是布尔值，则会引发此异常。

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

