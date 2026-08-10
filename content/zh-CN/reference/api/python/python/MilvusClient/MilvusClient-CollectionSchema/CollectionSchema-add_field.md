---
title: "add_field() | Python | MilvusClient"
slug: /python/python/CollectionSchema-add_field
sidebar_label: "add_field()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向 Collection 的 Schema 添加一个字段。 | Python | MilvusClient"
type: docx
token: N3Fbd0ZZVoFo8DxJ9r8cNgcCnOd
sidebar_position: 1
keywords: 
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - 云
  - add_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_field()

此操作会向 Collection 的 Schema 添加一个字段。

## 请求语法\{#request-syntax}

```python
add_field(
    field_name: str,
    datatype: DataType,
    **kwargs
)
```

**参数：**

- **field_name** (*string*) - 

    **[必需]**

    字段名称。

- **[datatype](./Collections-DataType)** (*[DataType](./Collections-DataType)*) - 

    **[必需]**

    字段的数据类型。

    为不同字段选择数据类型时，您可以从以下选项中进行选择：

    - 主键字段：使用 **DataType.INT64** 或 **DataType.VARCHAR**。

    - 标量字段：可从多种选项中选择，包括 

        - **DataType.BOOL**，

        - **DataType.INT8**，

        - **DataType.INT16**，

        - **DataType.INT32**，

        - **DataType.INT64**，

        - **DataType.FLOAT**，

        - **DataType.DOUBLE**，

        - **DataType.VARCHAR**，

        - **DataType.TEXT**

    - 复合字段：可从多种选项中选择，包括 

        - **DataType.JSON**

        - **DataType.ARRAY**

    - 向量字段：选择 **DataType.BINARY_VECTOR**、**DataType.FLOAT_VECTOR**、**DataType.FLOAT16_VECTOR**、**DataType.BFLOAT16_VECTOR**、**DataType.SPARSE_FLOAT_VECTOR** 或 **DataType.INT8_VECTOR**。

- **is_primary** (*bool*) -

    当前字段是否为 Collection 中的主字段。

    这不适用于外部 Collection。

    <Admonition type="info" icon="📘" title="Notes">

    - 每个 Collection 只有一个主字段。
    
    - 主字段的数据类型应为 **DataType.INT64** 或 **DataType.VARCHAR**。

    </Admonition>

- **max_length** (*int*) -

    允许插入的字符串的最大字节长度。请注意，多字节字符（例如 Unicode 字符）每个可能占用多个字节，因此请确保插入字符串的字节长度不超过指定限制。取值范围：[1, 65,535]。

    对于 DataType.VARCHAR 字段，此参数为必需。对于 DataType.TEXT 字段，请省略此参数。

- **element_type** (*str*) -

    字段值中元素的数据类型。

    对于 **DataType.ARRAY** 字段，此参数为必需。

- **max_capacity** (*int*) -

    Array 字段值中的元素数量。

    对于 **DataType.ARRAY** 字段，此参数为必需。

- **dim** (*int*) -

    向量嵌入的维度。该值应为大于 1 的整数。

    对于 **DataType.FLOAT_VECTOR**、**DataType.BINARY_VECTOR**、**DataType.FLOAT16_VECTOR** 或 **DataType.BFLOAT16_VECTOR** 类型的字段，此参数为必需。如果您使用 **DataType.SPARSE_FLOAT_VECTOR**，请省略此参数。

- **is_partition_key** (*bool*) -

    当前字段是否用作 Partition 键。每个 Collection 可以有一个 Partition 键。

    这不适用于外部 Collection。

    <Admonition type="info" icon="📘" title="Note">

    什么是 Partition 键？
    
        为支持面向 Partition 的多租户，您可以将某个字段设置为 Partition 键字段，以便 Zilliz Cloud 对字段值进行哈希，并据此将 Entity 分配到指定数量的 Partition 中。
    
        检索 Entity 时，请确保在布尔表达式中使用 Partition 键字段，以筛选出具有特定字段值的 Entity。
    
        有关详细信息，请参阅 [使用 Partition 键](/docs/use-partition-key) 和 [多租户](https://milvus.io/docs/multi_tenancy.md)。

    </Admonition>

**返回类型：**

*[CollectionSchema](./MilvusClient-CollectionSchema)*

**返回值：**

**[CollectionSchema](./MilvusClient-CollectionSchema)** 对象包含已添加到 Schema 中的字段。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import DataType, FieldSchema, CollectionSchema

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Add the primary key field
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True
)

# Add the vector field
schema.add_field(
    field_name="vector",
    datatype=FLOAT_VECTOR,
    dim=768
)

# Add a scalar field to the schema
schema.add_field(
    field_name="scalar_01",
    datatype=DataType.INT32
)

# Add a TEXT field for long source content
schema.add_field(
    field_name="content",
    datatype=DataType.TEXT,
    enable_analyzer=True
)

# {
#     'auto_id': False, 
#     'description': '', 
#     'fields': [
#         {
#             'name': 'id', 
#             'description': '', 
#             'type': <DataType.INT64: 5>, 
#             'is_primary': True, 
#             'auto_id': False
#         }, 
#         {
#             'name': 'vector', 
#             'description': '', 
#             'type': <DataType.FLOAT_VECTOR: 101>, 
#             'params': {'dim': 768}
#        }, 
#        {
#             'name': 'scalar_01', 
#             'description': '', 
#             'type': <DataType.INT32: 4>
#        }
#     ]
# }
```
