---
title: "FieldSchema | Python | ORM"
slug: /python/python/ORM-FieldSchema
sidebar_label: "FieldSchema"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "FieldSchema 实例用于定义集合中特定字段的数据类型及其相关属性。 | Python | ORM"
type: docx
token: EVKhdy0vwoSLSux2RW2c660unjh
sidebar_position: 2
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - FieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldSchema

**FieldSchema** 实例用于定义集合中特定字段的数据类型及其相关属性。

```python
class pymilvus.FieldSchema
```

## Constructor\{#constructor}

通过定义字段名称、数据类型和其他参数来构造字段的 schema。

```python
FieldSchema(
    name: str,
    dtype: DataType,
    **kwargs,
)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    字段名称。

- **dtype** (*[DataType](./Collections-DataType)*) -

    **[REQUIRED]**

    字段的数据类型。

    为不同字段选择数据类型时，可以从以下选项中进行选择：

    - 主键字段：使用 **DataType.INT64** 或 **DataType.VARCHAR**。

    - 标量字段：可从多种选项中选择，包括 **DataType.BOOL**、**DataType.INT8**、**DataType.INT16**、**DataType.INT32**、**DataType.INT64**、**DataType.FLOAT**、**DataType.DOUBLE**、**DataType.VARCHAR**、**DataType.JSON** 和 **DataType.ARRAY**。

    - 向量字段：选择 **DataType.BINARY_VECTOR** 或 **DataType.FLOAT_VECTOR**。

- **description** (*string*) -

    字段的描述。

- **kwargs** -

    - **is_primary** (*bool*)

        当前字段是否为主字段。

        将其设置为 **True** 会使当前字段成为主字段。

        或者，也可以在创建 **[CollectionSchema](./MilvusClient-CollectionSchema)** 对象时设置 **primary_field**。

    - **auto_id** (*bool*)

        是否允许主字段自动递增。

        将其设置为 **True** 会使主字段自动递增。在这种情况下，为避免出错，插入的数据中不应包含主字段。

        请在 `is_primary` 设置为 `True` 的字段中设置此参数。

    - **is_partition_key** (*bool*) 

        当前字段是否作为分区键。

        将其设置为 **True** 会使当前字段作为分区键。在这种情况下，Zilliz Cloud 会管理当前集合中的所有分区。

        <Admonition type="info" icon="📘" title="说明">

        什么是分区键？
        
                一旦某个字段被指定为分区键，Zilliz Cloud 会根据该字段中的每个唯一值自动创建分区，并将实体相应地保存到这些分区中。
        
                当你需要基于某个特定键实现数据隔离时，这尤其有用，例如面向分区的多租户。
        
                或者，也可以在创建 **[CollectionSchema](./MilvusClient-CollectionSchema)** 对象时设置 **partition_key_field**。

        </Admonition>

    - **max_length** (*int*)

        值可包含的最大字符数。

        如果此字段的 **dtype** 为 **DataType.VARCHAR**，则此项为必需。

    - **dim** (*int*)

        值应具有的维度数量。

        如果此字段的 **dtype** 设置为 **DataType.FLOAT_VECTOR**，则此项为必需。

**RETURN TYPE:**

*FieldSchema*

**RETURNS:**

一个 **FieldSchema** 对象。

**Exceptions:**

- **AutoIDException**

    如果 **auto_id** 参数的值不是布尔值，则会引发此异常。

- **DataTypeNotSupportException**

    如果 **dtype** 参数的值不受支持，则会引发此异常。

- **PrimaryKeyException**

    在以下情况下会引发此异常：

    - **is_primary** 参数的值不是布尔值，或

    - 设置了 **auto_id** 参数但未设置 **is_primary** 参数。

- **PartitionKeyException**

    如果 **is_partition_key** 参数被设置为非布尔值，则会引发此异常。

- **MilvusException**

    当此操作过程中发生任何错误时，将引发此异常。

## Methods\{#methods}

以下是 `FieldSchema` 类的方法：
