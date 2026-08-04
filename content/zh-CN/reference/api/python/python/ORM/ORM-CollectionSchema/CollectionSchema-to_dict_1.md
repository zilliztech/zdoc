---
title: "to_dict() | Python | ORM"
slug: /python/python/CollectionSchema-to_dict_1
sidebar_label: "to_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将 CollectionSchema 对象转换为字典表示。 | Python | ORM"
type: docx
token: GfTadfqhAo64XDxc643ci4Zwnwb
sidebar_position: 4
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_dict()

此操作将 CollectionSchema 对象转换为字典表示。

## 请求语法\{#request-syntax}

```python
to_dict()
```

**参数：**

无

**返回类型：**

*dict*

**返回值：**

CollectionSchema 的字典表示。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType  

# Create field schemas
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

# Create a CollectionSchema with field schemas

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Call to_dict() to get a dictionary representation of the schema 

schema_dict = schema.to_dict()  
print(schema_dict)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}]}
```

