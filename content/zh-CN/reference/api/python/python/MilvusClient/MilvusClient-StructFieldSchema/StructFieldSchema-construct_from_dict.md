---
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/StructFieldSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从字典表示构造一个 StructFieldSchema 对象。 | Python | MilvusClient"
type: docx
token: KeoHdMDBCo3PByxKbWncifFMn9e
sidebar_position: 2
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - construct_from_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

此操作从字典表示构造一个 **[StructFieldSchema](./MilvusClient-StructFieldSchema)** 对象。

## 请求语法\{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

**参数：**

- **raw** (*dict*)

    一个字典，包含用于构造结构体数组字段中某个结构体元素 schema 的原始数据

**返回类型：**

*[StructFieldSchema](./MilvusClient-StructFieldSchema)*

**返回：**

一个 **[StructFieldSchema](./MilvusClient-StructFieldSchema)** 对象。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import DataType, FieldSchema, StructFieldSchema

vector = FieldSchema(
    name="vector_02",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

varchar = FieldSchema(
    name="varchar_02",
    dtype=DataType.VARCHAR,
    max_length=512
)

# Create dictionary representation 
schema_dict = {
    "fields": [     
        vector.to_dict(),
        varchar.to_dict()                
    ]
}  

# Reconstruct schema from dictionary 
schema = StructFieldSchema(name="struct_schema", fields=[vector]).construct_from_dict(schema_dict)  

print(schema)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}]}
```
