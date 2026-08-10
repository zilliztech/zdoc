---
title: "describe_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-describe_snapshot
sidebar_label: "describe_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
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

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_snapshot()

此操作会检索特定快照的详细元数据，包括源 Collection、Partition 名称、创建时间戳和存储位置。

## 请求语法\{#request-syntax}

```python
describe_snapshot(
    snapshot_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> SnapshotInfo
```

**参数：**

- **snapshot_name** (*str*) -<br/>
  **[必需]**<br/>
  要描述的快照名称。

- **timeout** (*Optional[float]*) -<br/>
  可选的时长（以秒为单位），用于允许 RPC 完成。

**返回类型：**

*SnapshotInfo*

**返回：**

一个包含快照元数据的 dataclass，具有以下字段：

```python
{
    'name': str,
    'description': str,
    'collection_name': str,
    'partition_names': List[str],
    'create_ts': int,
    's3_location': str
}
```

**参数：**

- **name** (*str*) - 

    快照名称。

- **description** (*str*) - 

    快照描述。

- **collection_name** (*str*) - 

    源 Collection 名称。

- **partition_names** (*List[str]*) - 

    快照中包含的 Partition 名称列表。

- **create_ts** (*int*) - 

    以毫秒为单位的创建时间戳。

- **s3_location** (*str*) - 

    快照数据的 S3 存储位置。

**异常：**

- **MilvusException**

    如果快照不存在或操作失败。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

info = client.describe_snapshot(snapshot_name="backup_20260418")
print(f"Snapshot: {info.name}")
print(f"Collection: {info.collection_name}")
print(f"Partitions: {info.partition_names}")
print(f"Created at: {info.create_ts}")
print(f"S3 location: {info.s3_location}")
```
