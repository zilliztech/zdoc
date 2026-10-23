---
title: "FieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "定义字段的名称、数据类型、说明和其他 Schema 选项。 | Python | MilvusClient"
type: docx
token: OD8mdC5aXo0XHbxSthRczioXnaf
sidebar_position: 1
keywords: 
  - 向量搜索算法
  - 问答系统
  - LLM 作为评判者
  - 混合向量搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - FieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldSchema

定义字段的名称、数据类型、说明和其他 Schema 选项。

## 请求语法\{#request-syntax}

```python
FieldSchema(
```

**参数：**

- **name** （*str*） -

    **[必需]**

    字段的名称。

- **dtype** (*[DataType](../DataType.md*) -

    **[必需]**

    用于指定字段数据类型的选项。

- **description** （*str*） -

    默认值：`""`

    字段的说明。

- **kwargs** （*Any*） -

    其他字段选项。

**返回类型：**

*FieldSchema*

**返回：**

包含已配置的数据类型、约束、默认值和可空元数据的字段 Schema 实例。

**异常：**

- **MilvusException**

    当提供的字段选项无效时抛出。请查看异常消息，以了解无效的数据类型或字段约束。当提供的字段选项无效时抛出。请查看异常消息，以了解无效的数据类型或字段约束。

## 示例\{#examples}

为 Collection Schema 创建字段定义。

```python
from pymilvus import CollectionSchema, DataType, FieldSchema

schema = CollectionSchema(fields=[
    FieldSchema(
        name="id",
        dtype=DataType.INT64,
        is_primary=True,
    ),
    FieldSchema(
        name="vector",
        dtype=DataType.FLOAT_VECTOR,
        dim=3,
    ),
])
print(schema)
```
