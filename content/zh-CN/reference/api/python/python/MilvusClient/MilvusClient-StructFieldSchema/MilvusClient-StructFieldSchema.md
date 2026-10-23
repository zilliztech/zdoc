---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "构造函数行为已变更。现有类页面已记录新增的 nullable 属性。 | Python | MilvusClient"
type: docx
token: R4vxd8dReoaZ85xZ23qctjfLnDh
sidebar_position: 3
keywords: 
  - Elastic 向量 Database
  - Pinecone 与 Milvus
  - Chroma 与 Milvus
  - Annoy 向量搜索
  - zilliz
  - zilliz cloud
  - 云
  - StructFieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

构造函数行为已变更。现有类页面已记录新增的 nullable 属性。

## 请求语法\{#request-syntax}

```python
StructFieldSchema(
```

**参数：**

- **nullable** （*bool*） -

    默认值：`False`

    用于允许 Struct 字段包含 null 值的标志。

- **description** （*str*） -

    默认值：`""`

    Struct 字段的说明。

**返回类型：**

*StructFieldSchema*

**返回：**

Struct 字段 Schema 实例，包含嵌套字段以及 nullable/default 元数据。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以了解确切的失败详情。当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以了解确切的失败详情。

## 示例\{#examples}

演示 StructFieldSchema 的用法。

```python
from pymilvus import CollectionSchema, DataType, FieldSchema, StructFieldSchema

chunk = StructFieldSchema(
    nullable=True,
    description="Optional chunk metadata",
)
chunk.add_field(
    "source",
    DataType.VARCHAR,
    max_length=128,
)

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
