---
title: "list_loaded_segments() | Python | MilvusClient"
slug: /python/python/Management-list_loaded_segments
sidebar_label: "list_loaded_segments()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出某个 Collection 当前已加载的所有 Segment，包括行数、排序状态、存储级别和内存大小等信息。 | Python | MilvusClient"
type: docx
token: QWlfd7SO1ojpdHxM968coTYQnYg
sidebar_position: 24
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - 云
  - list_loaded_segments()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_loaded_segments()

此操作会列出某个 Collection 当前已加载的所有 Segment，包括行数、排序状态、存储级别和内存大小等信息。

<Admonition type="info" icon="📘" title="Notes">

这仅适用于托管 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.list_loaded_segments(
    collection_name: str,
    timeout: float = None
) -> List[LoadedSegmentInfo]
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    Collection 的名称。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*List[LoadedSegmentInfo]*

**返回：**

已加载 Segment 信息对象的列表，包含 segment_id、collection_id、collection_name、num_rows、is_sorted、state、level、storage_version 和 mem_size。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

segments = client.list_loaded_segments(collection_name="my_collection")
for seg in segments:
    print(f"Segment {seg.segment_id}: {seg.num_rows} rows, mem={seg.mem_size}")
```
