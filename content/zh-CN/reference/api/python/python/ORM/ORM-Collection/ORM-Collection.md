---
title: "Collection | Python | ORM"
slug: /python/python/ORM-Collection
sidebar_label: "Collection"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Collection 实例表示一个 Milvus collection。 | Python | ORM"
type: docx
token: OSehdj15Ao3AUvxOIJucXzU8nWW
sidebar_position: 1
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - Collection
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Collection

**Collection** 实例表示一个 Milvus collection。

```python
class pymilvus.Collection
```

## 构造函数\{#constructor}

按名称、schema 和其他参数构造一个 collection。

```python
Collection(
    name: str,
    schema: CollectionSchema,
    using: str
) 
```

**参数：**

- **name** (*string*) - 

    **[必需]**

    要创建的 collection 名称。

- **schema** (*[CollectionSchema](./ORM-CollectionSchema)*) - 

    用于创建 collection 的 schema。 

    默认值为 **None**，表示使用默认 schema。

    <Admonition type="info" icon="📘" title="说明">

    什么是 schema？
    
        schema 负责组织目标 collection 中的数据。一个有效的 schema 应包含多个字段，其中必须包括主键、向量字段以及若干标量字段。

    </Admonition>

- **using** (*string*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **num_shards** (*int*) -

    在创建此 collection 时一并创建的 shard 数量。 

    该值默认为 **1**，表示随此 collection 一并创建一个 shard。

    <Admonition type="info" icon="📘" title="说明">

    什么是分片？
    
        分片是指将写入操作分布到不同节点，以充分利用 Milvus 集群在数据写入方面的并行计算能力。
    
        默认情况下，一个 collection 包含一个 shard。

    </Admonition>

- **consistency_level** (*int* | *str*)

    目标 collection 的一致性级别。

    该值默认为 **Bounded**（**1**），可选值包括 **Strong**（**0**）、**Bounded**（**1**）、**Session**（**2**）和 **Eventually**（**3**）。

    <Admonition type="info" icon="📘" title="说明">

    什么是一致性级别？
    
        在分布式数据库中，一致性特指这样一种属性：在给定时间写入或读取数据时，确保每个节点或副本对数据具有相同的视图。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认设置为 **Bounded Staleness**。
    
        你可以在执行向量相似性搜索或查询时轻松调整一致性级别，使其更适合你的应用。

    </Admonition>

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作才会超时。

**返回类型：**

*Collection*

**返回：**

一个 collection 对象。

**异常：**

- **SchemaNotReadyException**

    当提供的 schema 无效时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

# Create a collection using the user-defined schema
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

schema = CollectionSchema(
    fields = [primary_key, vector]
)

collection = Collection(
    name="test_01",
    schema=schema,
    using="default"
)
```

## 成员\{#members}

以下是 `Collection` 类的成员：

