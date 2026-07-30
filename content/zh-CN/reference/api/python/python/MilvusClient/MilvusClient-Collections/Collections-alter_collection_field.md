---
title: "alter_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_field
sidebar_label: "alter_collection_field()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更改指定集合字段的参数。 | Python | MilvusClient"
type: docx
token: JdR3dVpCaoq6s2xSFmsc0e13nnh
sidebar_position: 2
keywords: 
  - 什么是向量嵌入
  - 向量数据库教程
  - 向量数据库如何工作
  - 向量数据库对比
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_collection_field()

此操作会更改指定集合字段的参数。

## 请求语法\{#request-syntax}

```python
alter_collection_field(
    collection_name: str, 
    field_name: str, 
    field_params: Dict,
    db_name="",
    timeout: Optional[float] = None,
    **kwargs,
)
```

**参数：**

- **collection_name** (*str*) -

    目标集合的名称。

- **field_name** (*str*) -

    目标字段的名称。

- **field_params** (*dict*) -

    要更改的字段参数。未提及的属性保持不变。可用参数会因字段类型而异。

    - **mmap_enabled** (*bool*) -

        是否让 Milvus 将字段数据映射到内存中，而不是将其完全加载到内存。详情请参阅 MMap-enabled Data Storage。

- **timeout** (*Optional[float]*) - 

    此操作的超时时长。

    将其设置为 None 表示当收到任何响应或发生任何错误时，此操作即超时结束。

<Admonition type="info" icon="📘" title="说明">

您必须在加载集合之前修改字段设置。对已加载集合中的字段进行修改会返回错误。若要更改已加载集合中的设置，请先释放集合，再修改字段，然后重新加载。

</Admonition>

**返回类型：**

*NoneType*

**返回：**

*None*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常，尤其是在指定别名不存在时。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# upsert properties
field_params = {"max_length": 1500}

client.alter_collection_field(
    collection_name="collection_name", 
    field_name="my_varchar",
    field_params=field_params
)
```

