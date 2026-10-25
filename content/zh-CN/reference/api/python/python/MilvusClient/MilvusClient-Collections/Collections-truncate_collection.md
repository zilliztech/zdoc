---
title: "truncate_collection() | Python | MilvusClient"
slug: /python/python/Collections-truncate_collection
sidebar_label: "truncate_collection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会移除所有 Entity，同时保留 Collection 的 Schema、约束和索引。相比删除 Entity，此操作更高效，因为它会从搜索和查询中隐藏当前时间戳之前已 flush 的所有 Entity，并在后台删除这些 Entity。 | Python | MilvusClient"
type: docx
token: QsIndHtmXohzARxrQdBcVTJun9g
sidebar_position: 25
keywords: 
  - Zilliz
  - milvus 向量 Database
  - milvus Database
  - milvus 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - truncate_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# truncate_collection()

此操作会移除所有 Entity，同时保留 Collection 的 Schema、约束和索引。相比删除 Entity，此操作更高效，因为它会从搜索和查询中隐藏当前时间戳之前已 flush 的所有 Entity，并在后台删除这些 Entity。

<Admonition type="info" title="Notes">

这不适用于外部 Collection。

</Admonition>

<Admonition type="info" title="Note">

这不适用于外部 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
truncate_collection(
```

**参数：**

- **collection_name** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **timeout** （*float*） -

    RPC 请求的超时时间（以秒为单位）。如果为 None，调用将无限期等待。

**返回类型：**

*None*

**返回值：**

无。

**异常：**

- **CollectionNotExists**

    当指定的 Collection 不存在时，将引发此异常。当指定的 Collection 不存在时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.truncate_collection(
    collection_name="my_collection"
)
```
