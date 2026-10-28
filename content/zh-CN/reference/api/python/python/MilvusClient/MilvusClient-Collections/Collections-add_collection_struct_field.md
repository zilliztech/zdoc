---
title: "add_collection_struct_field() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_struct_field
sidebar_label: "add_collection_struct_field()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 添加一个新的可空结构体字段。 | Python | MilvusClient"
type: docx
token: M97RdhP3Co4QadxrDFGcpV8EnYe
sidebar_position: 26
keywords: 
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - zilliz
  - zilliz cloud
  - 云
  - add_collection_struct_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_collection_struct_field()

此操作会向现有 Collection 添加一个新的可空结构体字段。

<Admonition type="info" title="Note">

向现有 Collection 添加结构体字段时，需要将 nullable 设置为 True，因为现有 Entity 没有新字段的值。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.add_collection_struct_field(
    collection_name: str,
    field_name: str,
    struct_schema: StructFieldSchema,
    max_capacity: int,
    desc: Optional[str] = None,
    timeout: Optional[float] = None
)
```

**参数：**

- **collection_name**（*str*）-

    **[必需]**

    Collection 的名称。

- **field_name**（*str*）-

    **[必需]**

    新结构体字段的名称。

- **struct_schema** (*[StructFieldSchema](./MilvusClient-StructFieldSchema)*) -

    **[必需]**

    要添加的结构体字段的 Schema。其名称会被 field_name 覆盖。

- **max_capacity**（*int*）-

    **[必需]**

    结构体字段可容纳的最大元素数量。

- **desc**（*Optional[str]*）-

    字段的简短描述。

- **timeout**（*float | None*）-

    此操作的超时时长。将其设置为 None 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

None。

**异常：**

- **ParamError**

    当 **struct_schema** 不是 `StructFieldSchema` 实例或 **nullable** 未设置为 **True** 时引发。当 **struct_schema** 不是 `StructFieldSchema` 实例或 **nullable** 未设置为 **True** 时引发。

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient, DataType, StructFieldSchema

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# The target collection must exist first
client.create_collection(
    collection_name="my_collection",
    dimension=5,
)

# Build the struct field schema
struct_schema = StructFieldSchema(nullable=True)
struct_schema.add_field(
    "name",
    DataType.VARCHAR,
    max_length=64,
)
struct_schema.add_field("age", DataType.INT32)

client.add_collection_struct_field(
    collection_name="my_collection",
    field_name="profile",
    struct_schema=struct_schema,
    max_capacity=10,
)
```
