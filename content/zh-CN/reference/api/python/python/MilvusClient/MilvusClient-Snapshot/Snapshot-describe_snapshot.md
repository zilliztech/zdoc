---
title: "describe_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-describe_snapshot
sidebar_label: "describe_snapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会检索特定快照的详细元数据，包括源 Collection、Partition 名称、创建时间戳和存储位置。 | Python | MilvusClient"
type: docx
token: GF0yd9S4RoImivxbIlPcicEynQb
sidebar_position: 2
keywords: 
  - 嵌入模型
  - 图像相似性搜索
  - 上下文窗口
  - 自然语言搜索
  - zilliz
  - zilliz cloud
  - 云
  - describe_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_snapshot()

此操作会检索特定快照的详细元数据，包括源 Collection、Partition 名称、创建时间戳和存储位置。

## 请求语法\{#request-syntax}

```python
describe_snapshot(
```

**参数：**

- **snapshot_name** （*str*） -

    **[必需]**

    要描述的快照的名称。

- **collection_name** （*str*） -

    **[必需]**

    快照所属的 Collection 的名称。

- **db_name** （*str*） -

    包含该 Collection 的 Database 的名称。如果此参数留空，则使用默认 Database。

- **timeout** （*Optional[float]*） -

    允许 RPC 运行的可选时长，单位为秒。

**返回类型：**

*SnapshotInfo*

**返回：**

一个包含快照元数据的 dataclass，具有以下字段：

**异常：**

- **MilvusException**

    如果快照不存在或操作失败。如果快照不存在或操作失败。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

info = client.describe_snapshot(
    snapshot_name="backup_20260418",
    collection_name="my_collection",
)
print(f"Snapshot: {info.name}")
print(f"Collection: {info.collection_name}")
print(f"Partitions: {info.partition_names}")
print(f"Created at: {info.create_ts}")
print(f"S3 location: {info.s3_location}")
```
