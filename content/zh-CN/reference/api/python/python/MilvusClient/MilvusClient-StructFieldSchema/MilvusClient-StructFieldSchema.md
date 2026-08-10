---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "构造函数行为已更改。现有类页面中记录了新的 nullable 属性。| Python | MilvusClient"
type: docx
token: ZnKKd2PsyoRc1MxtC1BcJQjgnBh
sidebar_position: 3
keywords: 
  - Elastic 向量 Database
  - Pinecone 与 Milvus 对比
  - Chroma 与 Milvus 对比
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

构造函数行为已更改。现有类页面中记录了新的 nullable 属性。

## 请求语法\{#request-syntax}

```python
StructFieldSchema(
    nullable: bool = False,
    description: str = "",
)
```

**参数：**

- **nullable** (*bool*) -<br/>
  默认值：`False`<br/>
  允许结构字段包含 null 值的标志。

- **description** (*str*) -<br/>
  默认值：`""`<br/>
  结构字段的描述。

**返回类型：**

*StructFieldSchema*

**返回：**

包含嵌套字段和 nullable/default 元数据的结构字段 Schema 实例。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败详情。

## 示例\{#examples}

演示 StructFieldSchema 的用法。

```python
from pymilvus import CollectionSchema, DataType, FieldSchema, StructFieldSchema

chunk = StructFieldSchema(nullable=True, description="Optional chunk metadata")
chunk.add_field("source", DataType.VARCHAR, max_length=128)

schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=3),
])
print(schema)
```
