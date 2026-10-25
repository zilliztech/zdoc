---
title: "alter_collection_properties() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_properties
sidebar_label: "alter_collection_properties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会修改指定 Collection 的属性。 | Python | MilvusClient"
type: docx
token: SJ1FdUQQnohtObxhNgpcHalMnUc
sidebar_position: 3
keywords: 
  - 什么是向量数据库
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - Zilliz
  - Zilliz Cloud
  - 云
  - alter_collection_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# alter_collection_properties()

此操作会修改指定 Collection 的属性。

<Admonition type="info" title="Note">

这不适用于外部 Collection。

</Admonition>

<Admonition type="info" title="Note">

这不适用于外部 Collection。

</Admonition>

<Admonition type="info" title="Note">

这不适用于外部 Collection。

</Admonition>

<Admonition type="info" title="Note">

这不适用于外部 Collection。

</Admonition>

<Admonition type="info" title="Note">

这不适用于外部 Collection。

</Admonition>

<Admonition type="info" title="Notes">

这不适用于外部 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
alter_collection_properties(
```

**参数：**

- **collection_name** (*str*) -

    目标 Collection 的名称。

- **properties** (*dict*) -

    以字典形式指定属性及其新值。可能的字典键如下：collection.ttl.seconds（int）：Collection 的生存时间（TTL），单位为秒。ttl_field（str）：用作 Entity 级 TTL 过期逻辑时间戳的 TIMESTAMPTZ 字段的名称。mmap.enabled（bool）：是否为 Collection 中所有字段的原始数据和索引启用 mmap。详情请参见支持 mmap 的数据存储。partitionkey.isolation（bool）：是否启用 Partition 键隔离。详情请参见使用 Partition 键。dynamicfield.enabled（bool）：是否启用动态字段。详情请参见动态字段。allow_insert_auto_id（str）：当已为 Collection 启用 AutoID 时，是否允许 Collection 接受用户提供的主键值。设置为 "true" 时：如果存在用户提供的主键，则插入、Upsert 和批量导入使用该主键；否则，主键值将自动生成。设置为 "false" 时：用户提供的主键值将被拒绝或忽略，并且主键值始终自动生成。该值默认为 "false"。timezone（str）：为 Collection 设置默认时区。该值必须是有效的 IANA 时区标识符（例如 Asia/Shanghai, America/Chicago, 或 UTC）。有关更多信息，请参见 TIMESTAMPZ 字段和查询。

- **timeout** (*Optional[float]*) -

    此操作的超时时长。将其设置为 None 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

*None*.

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常，尤其是在指定的别名不存在时。当此操作期间发生任何错误时，将引发此异常，尤其是在指定的别名不存在时。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# upsert properties
properties = {"collection.ttl.seconds": 500, "mmap.enabled": True}

client.alter_collection_properties(
    collection_name="collection_name", 
    properties = properties
)
```
