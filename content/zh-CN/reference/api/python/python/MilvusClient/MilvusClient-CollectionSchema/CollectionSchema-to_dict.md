---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/CollectionSchema-to_dict
sidebar_label: "to_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将 CollectionSchema 对象转换为字典表示形式。 | Python | MilvusClient"
type: docx
token: NnIxd6VYso9IBPx6bJDcJJmUnNd
sidebar_position: 4
keywords: 
  - 向量数据库如何工作
  - 向量数据库对比
  - openai 向量数据库
  - 自然语言处理数据库
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

此操作将 CollectionSchema 对象转换为字典表示形式。

## 请求语法\{#request-syntax}

```python
to_dict()
```

**参数：**

无

**返回类型：**

*dict*

**返回：**

集合 schema 的字典表示形式。

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

