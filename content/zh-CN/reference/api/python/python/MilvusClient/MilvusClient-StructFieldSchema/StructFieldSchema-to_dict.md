---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/StructFieldSchema-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将 StructFieldSchema 对象转换为字典表示形式。 | Python | MilvusClient"
type: docx
token: Mq7idUip3ofMQmxj55XcB98nn0b
sidebar_position: 4
keywords: 
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - 开源向量数据库
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

此操作将 **[StructFieldSchema](./MilvusClient-StructFieldSchema)** 对象转换为字典表示形式。

## 请求语法\{#request-syntax}

```python
to_dict()
```

**参数：**

无

**返回类型：**

*dict*

**返回值：**

集合 schema 的字典表示形式。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import StructFieldSchema, FieldSchema, DataType  

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

varchar = FieldSchema(
    name="varchar",
    dtype=DataType.VARCHAR,
    max_length=512
)

# Create a StructFieldSchema with field schemas

schema = StructFieldSchema(
    name="struct_schema",
    fields = [vector, varchar]
)

# Call to_dict() to get a dictionary representation of the schema 

schema_dict = schema.to_dict()  
```
