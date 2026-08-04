---
title: "set_properties() | Python | ORM"
slug: /python/python/Collection-set_properties
sidebar_label: "set_properties()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为集合设置属性。 | Python | ORM"
type: docx
token: ECmAdaYKboPTNlxqkLxcUEZ4nrh
sidebar_position: 27
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - set_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# set_properties()

此操作为集合设置属性。

## 请求语法\{#request-syntax}

```python
set_properties(
    properties: dict, 
    timeout: float | None, 
    kwargs
)
```

**参数：**

- **properties** (dict) -

    以字典形式提供的一组集合属性。目前，您可以设置以下属性：

    - **collection.ttl.seconds**

        设置此属性后，当前集合中的数据会在指定时间后过期。集合中过期的数据将被清理，并且不会参与搜索或查询。

    - **mmap.enabled**

        是否在集合级别启用内存映射存储。更多信息，请参见[配置内存映射](https://milvus.io/docs/mmap.md#Configure-memory-mapping)。

- **timeout** (*float*)  -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时结束。

**返回类型：**

*NoneType*

**返回：**

无

## 示例\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Set the TTL for the data in the collection
collection.set_properties(
    properties={
        "collection.ttl.seconds": 60
    }
)
```

## 相关操作\{#related-operations}

以下操作与 `insert()` 相关：

- [describe()](./Collection-describe)

- [drop()](./Collection-drop)

- [flush()](./Collection-flush)

- [get_replicas()](./Collection-get_replicas)

