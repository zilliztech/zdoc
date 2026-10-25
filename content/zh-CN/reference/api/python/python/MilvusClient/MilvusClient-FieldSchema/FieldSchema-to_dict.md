---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/FieldSchema-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作将 FieldSchema 对象转换为字典表示。 | Python | MilvusClient"
type: docx
token: DkqSdCSOJo5DI1xZ7z3cTZuUnAc
sidebar_position: 3
keywords: 
  - 大语言模型
  - 向量化
  - k 最近邻算法
  - ANNS
  - zilliz
  - Zilliz Cloud
  - 云
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# to_dict()

此操作将 FieldSchema 对象转换为字典表示。

## 请求语法\{#request-syntax}

```python
to_dict()
```

**返回类型：**

*dict*

**返回：**

字段 Schema 的字典表示。

**异常：**

- **MilvusException**

    如果此操作期间发生任何错误，将引发此异常。如果此操作期间发生任何错误，将引发此异常。

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
    dim=768
)

# Get dictionary representation
primary_key_dict = primary_key.to_dict()
vector_dict = vector.to_dict()

print(primary_key_dict)
print(vector_dict)

# Output
# {'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}
# {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}
```
