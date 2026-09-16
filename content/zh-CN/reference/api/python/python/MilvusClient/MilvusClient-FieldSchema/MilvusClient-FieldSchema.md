---
title: "FieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "定义字段的名称、数据类型、描述以及其他 Schema 选项。 | Python | MilvusClient"
type: docx
token: OD8mdC5aXo0XHbxSthRczioXnaf
sidebar_position: 1
keywords: 
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - 混合向量搜索
  - zilliz
  - zilliz cloud
  - 云
  - FieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldSchema

定义字段的名称、数据类型、描述以及其他 Schema 选项。

## 请求语法\{#request-syntax}

```python
FieldSchema(
    name: str,
    dtype: DataType,
    description: str = "",
    **kwargs
)
```

**参数：**

- **name** (*str*) -<br/>
  **[必需]**<br/>
  字段的名称。

- **dtype** ([DataType](./Collections-DataType)) -<br/>
  **[必需]**<br/>
  字段的数据类型。

- **description** (*str*) -<br/>
  默认值：`""`<br/>
  字段的描述。

- **kwargs** (*Any*) -<br/>
  其他字段选项。

**返回类型：**

*FieldSchema*

**返回值：**

包含所配置的数据类型、约束、默认值和 nullable 元数据的字段 Schema 实例。

**异常：**

- **MilvusException**<br/>
  当提供的字段选项无效时抛出。请检查异常消息，了解具体无效的数据类型或字段约束。

## 示例\{#examples}

为 Collection Schema 创建字段定义。

```python
from pymilvus import CollectionSchema, DataType, FieldSchema

schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=3),
])
print(schema)
```
