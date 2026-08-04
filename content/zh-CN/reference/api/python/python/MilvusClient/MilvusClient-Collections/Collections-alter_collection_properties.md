---
title: "alter_collection_properties() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_properties
sidebar_label: "alter_collection_properties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更改指定集合的属性。 | Python | MilvusClient"
type: docx
token: SJ1FdUQQnohtObxhNgpcHalMnUc
sidebar_position: 3
keywords: 
  - 什么是向量数据库
  - 什么是向量数据库
  - 向量数据库对比
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_collection_properties()

此操作会更改指定集合的属性。

<Admonition type="info" icon="📘" title="说明">

这不适用于外部集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
alter_collection_properties(
    self, 
    collection_name: str, 
    properties: dict, 
    timeout: Optional[float] = None, 
    **kwargs
)
```

**参数：**

- **collection_name** (*str*) -

    目标集合的名称。

- **properties** (*dict*) -

    以字典形式指定属性及其新值。可用的字典键如下：

    - **collection.ttl.seconds** (*int*) -

        集合的生存时间（TTL），单位为秒。

    - **ttl_field** (*str*)

        用作实体级 TTL 过期逻辑时间戳的 `TIMESTAMPTZ` 字段名称。

    - **mmap.enabled** (*bool*) -

        是否为集合中所有字段的原始数据和索引启用 mmap。详情请参见 [Use mmap](/docs/use-mmap)。

    - **partitionkey.isolation** (bool) -

        是否启用分区键隔离。详情请参见 [Use Partition Key](/docs/use-partition-key)。

    - **dynamicfield.enabled** (bool) -

        是否启用动态字段。详情请参见 [Dynamic Field](/docs/enable-dynamic-field)。

- **timeout** (*Optional[float]*) - 

    此操作的超时时长。

    将其设置为 None 表示当收到任意响应或发生任意错误时，此操作即超时结束。

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
properties = {"collection.ttl.seconds": 500, "mmap.enabled": true}

client.alter_collection_properties(
    collection_name="collection_name", 
    properties = properties
)
```

