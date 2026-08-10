---
title: "Collection | Python | ORM"
slug: /python/python/ORM-Collection
sidebar_label: "Collection"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Collection 实例表示一个 Milvus Collection。 | Python | ORM"
type: docx
token: OSehdj15Ao3AUvxOIJucXzU8nWW
sidebar_position: 1
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - 云
  - Collection
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Collection

**Collection** 实例表示一个 Milvus Collection。

```python
class pymilvus.Collection
```

## 构造函数\{#constructor}

通过名称、Schema 和其他参数构造一个 Collection。

```python
Collection(
    name: str,
    schema: CollectionSchema,
    using: str
) 
```

**参数：**

- **name** (*string*) - 

    **[必填]**

    要创建的 Collection 的名称。

- **schema** (*[CollectionSchema](./ORM-CollectionSchema)*) - 

    用于创建 Collection 的 Schema。 

    默认值为 **None**，表示使用默认 Schema。

    <Admonition type="info" icon="📘" title="Note">

    什么是 Schema？
    
        Schema 负责组织目标 Collection 中的数据。一个有效的 Schema 应包含多个字段，其中必须包括主键字段、向量字段以及多个标量字段。

    </Admonition>

- **using** (*string*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **num_shards** (*int*) -

    在创建此 Collection 时一同创建的分片数量。 

    该值默认为 **1**，表示随此 Collection 一同创建一个分片。

    <Admonition type="info" icon="📘" title="Note">

    什么是分片？
    
        分片是指将写操作分发到不同节点，以最大限度利用 Milvus 集群在数据写入方面的并行计算能力。
    
        默认情况下，一个 Collection 包含一个分片。

    </Admonition>

- **consistency_level** (*int* | *str*)

    目标 Collection 的一致性级别。

    该值默认为 **Bounded**（**1**），可选值包括 **Strong**（**0**）、**Bounded**（**1**）、**Session**（**2**）和 **Eventually**（**3**）。

    <Admonition type="info" icon="📘" title="Note">

    什么是一致性级别？
    
        在分布式 Database 中，一致性特指这样一种属性：在某一时刻进行数据写入或读取时，确保每个节点或副本看到的数据视图相同。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认级别为 **Bounded Staleness**。
    
        在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作才会超时。

**返回类型：**

*Collection*

**返回值：**

一个 Collection 对象。

**异常：**

- **SchemaNotReadyException**

    当提供的 Schema 无效时，将引发此异常。

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

