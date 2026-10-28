---
title: "pin_snapshot_data() | Python | MilvusClient"
slug: /python/python/Snapshot-pin_snapshot_data
sidebar_label: "pin_snapshot_data()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在一段时间内固定快照数据，以便您导出或备份文件时 Collection 的垃圾回收不会移除这些数据。 | Python | MilvusClient"
type: docx
token: NqWDdRxKYoi6uTxHaYEcafx9nGc
sidebar_position: 7
keywords: 
  - Milvus
  - Zilliz
  - Milvus 向量 Database
  - Milvus Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - pin_snapshot_data()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# pin_snapshot_data()

此操作会在一段时间内固定快照数据，以便您导出或备份文件时 Collection 的垃圾回收不会移除这些数据。

## 请求语法\{#request-syntax}

```python
pin_snapshot_data(
```

**参数：**

- **snapshot_name**（*str*） -

    要固定的快照名称。

- **collection_name**（*str*） -

    拥有该快照的 Collection。

- **db_name**（*str*） -

    Database 名称。留空则使用当前活动的 Database。

- **ttl_seconds**（*int*） -

    用于指定固定有效期的选项，单位为秒。0 表示使用服务器默认的 TTL。

- **timeout**（*Optional[float]*） -

    此操作的超时时间，单位为秒。

- **kwargs**（*dict*） -

    传递给底层 RPC 的其他请求选项。

**返回类型：**

*int*

**返回：**

用于通过 unpin_snapshot_data() 释放此固定的 pin_id。

**异常：**

- **MilvusException**

    当无法固定快照或请求失败时引发。当无法固定快照或请求失败时引发。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

pin_id = client.pin_snapshot_data(
    snapshot_name="backup_20260509",
    collection_name="products",
    ttl_seconds=3600,
)

# Copy snapshot data to external storage here.

client.unpin_snapshot_data(pin_id=pin_id)
```
