---
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/CollectionSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作根据字典表示构造一个 CollectionSchema 对象。 | Python | MilvusClient"
type: docx
token: Ld10d5YWJofvgGxtwYscGlWunDg
sidebar_position: 3
keywords: 
  - 廉价向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - zilliz
  - zilliz cloud
  - 云
  - construct_from_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

此操作根据字典表示构造一个 **[CollectionSchema](./MilvusClient-CollectionSchema)** 对象。

## 请求语法\{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

**参数：**

- **raw** (*dict*)

    一个包含用于构造 Collection Schema 的原始数据的字典。

**返回类型：**

*[CollectionSchema](./MilvusClient-CollectionSchema)*

**返回值：**

一个 **[CollectionSchema](./MilvusClient-CollectionSchema)** 对象。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import DataType, FieldSchema, CollectionSchema

# Define fields and create a schema
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

# Create dictionary representation 
schema_dict = {
    "fields": [     
        primary_key.to_dict(),
        vector.to_dict()                
    ]
}  

# Reconstruct schema from dictionary 
schema = CollectionSchema.construct_from_dict(schema_dict)  
# schema is now a CollectionSchema instance reconstructed from the dictionary 
print(schema)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}]}
```

