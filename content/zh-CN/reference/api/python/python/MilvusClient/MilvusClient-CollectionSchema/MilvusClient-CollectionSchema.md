---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema 实例表示集合的 schema。schema 概述了集合的结构。 | Python | MilvusClient"
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

**CollectionSchema** 实例表示集合的 schema。schema 概述了集合的结构。

```python
class pymilvus.CollectionSchema
```

## Constructor\{#constructor}

通过定义字段、数据类型和其他参数来构造集合的 schema。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**PARAMETERS:**

- **fields** (*list*) -

    **[REQUIRED]**

    由 **[FieldSchema](./ORM-FieldSchema)** 对象组成的列表，用于定义集合 schema 中的字段。

    <Admonition type="info" icon="📘" title="Note">

    什么是字段 schema？
    
        字段 schema 表示并包含单个字段的元数据，而 **CollectionSchema** 则将一组 FieldSchema 对象组织在一起，以定义完整的 schema。

    </Admonition>

- **description** (*string*) -

    schema 的描述。

    如果未提供描述，则会将其设置为空字符串。

- **external_source** (*str*) -

    外部数据源 URI，应为指向可访问外部卷的 `volume://` URI。例如，`volume://<volume-name>/path/to/folder/`..

- **external_spec** (*str*) -

    外部数据源规格，即一组次级参数：

    - **format** (*str*) - 

        目标源数据文件的格式。

        可选值包括 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **snapshot_id** (*str*) -

        Iceberg 表的 ID。仅在 `format` 为 `iceberg-table` 时适用。

- **kwargs** -

    - **auto_id** (*bool*) -

        是否允许主字段自动递增。

        将其设置为 **True** 会使主字段自动递增。在这种情况下，为避免出错，待插入的数据中不应包含主字段。

        此参数不适用于外部集合。

    - **enable_dynamic_field** (*bool*) -

        如果插入到目标集合的数据包含未在集合 schema 中定义的字段，是否允许 Zilliz Cloud 将这些未定义字段的值保存到动态字段中。

        当你将其设置为 **True** 时，Zilliz Cloud 会创建一个名为 **&#36;meta** 的字段，用于存储插入数据中任何未定义的字段及其值。

        此参数不适用于外部集合。

        <Admonition type="info" icon="📘" title="Note">

        什么是动态字段？
        
                如果插入到目标集合的数据包含未在集合 schema 中定义的字段，这些字段将以键值对的形式保存在动态字段中。

        </Admonition>

    - **primary_field** (*str*) -

        主字段的名称。

        该值应为 **fields** 中列出的某个字段名称。

        另外，你也可以在创建 **[FieldSchema](./ORM-FieldSchema)** 对象时设置 **is_primary**。

        此参数不适用于外部集合。

    - **partition_key_field** (*str*) -

        用作分区键的字段名称。

        该值应为 **fields** 中列出的某个字段名称。

        设置后，Zilliz Cloud 将管理当前集合中的所有分区。

        另外，你也可以在创建 **[FieldSchema](./ORM-FieldSchema)** 对象时设置 **is_partition_key**。

        此参数不适用于外部集合。

        <Admonition type="info" icon="📘" title="Note">

        什么是分区键？
        
                一旦某个字段被指定为分区键，Zilliz Cloud 会为该字段中的每个唯一值自动创建一个分区，并将实体相应地保存到这些分区中。
        
                这在基于特定键实现数据隔离时尤其有用，例如面向分区的多租户场景。
        
                另外，你也可以在创建 **CollectionSchema** 对象时设置 **partition_key_field**。

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        是否启用分区键隔离，以进一步提升基于分区键进行标量过滤时的搜索性能。详情请参见 [Use Partition Key Isolation](/docs/use-partition-key#use-partition-key-isolation)。

        此参数不适用于外部集合。

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

一个 **CollectionSchema** 对象。

**EXCEPTIONS:**

- **FieldsTypeException**: 

    当 **fields** 参数不是列表时，将引发此异常。

- **FieldTypeException**: 

    当 **fields** 列表中的某个字段不是 **[FieldSchema](./ORM-FieldSchema)** 对象时，将引发此异常。

- **PrimaryKeyException:**

    在以下情况下将引发此异常：

    - 已设置 **primary_field** 参数，但其值不是字符串。

    - 已设置 **primary_field** 参数，但其值不是任何已列出字段的名称。

- **PartitionKeyException:**

    在以下情况下将引发此异常： 

    - 已设置 **partition_key_field** 参数，但其值不是字符串。

    - 已设置 **partition_key_field** 参数，但其值不是任何已列出字段的名称。

- **AutoIDException:**

    - 已设置 **auto_id** 参数，但其值不是布尔值时，将引发此异常。

## Examples\{#examples}

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

## Methods\{#methods}

以下是 `CollectionSchema` 类的方法：

