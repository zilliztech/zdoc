---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "StructFieldSchema 实例用于描述包含一个或多个子字段的结构体类型字段。| Python | MilvusClient"
type: docx
token: ZnKKd2PsyoRc1MxtC1BcJQjgnBh
sidebar_position: 3
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy 向量搜索
  - zilliz
  - zilliz cloud
  - cloud
  - StructFieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

**StructFieldSchema** 实例用于描述包含一个或多个子字段的结构体类型字段。

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
  用于控制该结构体字段是否允许包含空值的标志。

- **description** (*str*) -<br/>
  默认值：`""`<br/>
  该结构体字段的描述信息。

**返回类型：**

*StructFieldSchema*

**返回值：**

包含嵌套字段及 nullable/default 元数据的结构体字段 Schema 实例。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以获取具体的失败详情。

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
