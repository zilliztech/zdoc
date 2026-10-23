---
title: "list_segments() | Python | MilvusClient"
slug: /python/python/Management-list_segments
sidebar_label: "list_segments()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出 Collection 中仍保留在请求的生命周期状态下的 Segment。 | Python | MilvusClient"
type: docx
token: XQaYdrunfo03uZxNvv9csRTGnYc
sidebar_position: 28
keywords: 
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - RAG 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - list_segments()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_segments()

此操作会列出 Collection 中仍保留在请求的生命周期状态下的 Segment。

## 请求语法\{#request-syntax}

```python
list_segments(
    collection_name: str,
    states: Optional[Sequence[SegmentState]] = None,
    timeout: Optional[float] = None,
    **kwargs
) -> List[SegmentInfo]
```

**参数：**

- **collection_name** （*str*） -

    目标 Collection 的名称。

- **states** （*Sequence[SegmentState] | None*） -

    该值默认为 `None`。

    用于筛选的生命周期状态，例如包含 SegmentState.Sealed 的列表。省略时，将返回所有保留的状态。

- **timeout** （*float | None*） -

    该值默认为 `None`。

    此操作的超时时间，单位为秒。

**返回类型：**

*list[SegmentInfo]*

**返回：**

一个 SegmentInfo 对象列表，用于描述保留的 Segment，包括每个 Segment 的标识符和生命周期状态。

**参数：**

- **segment_id** （*int*） -

    Segment 的 ID。

- **collection_id** （*int*） -

    Segment 所属 Collection 的 ID。

- **collection_name** （*str*） -

    Segment 所属 Collection 的名称。

- **num_rows** （*int*） -

    Segment 中的行数。

- **is_sorted** （*bool*） -

    指示 Segment 中的数据是否已排序的标志。

- **state** （*SegmentState*） -

    Segment 的生命周期状态。

- **level** （*SegmentLevel*） -

    Segment 的存储级别。

- **storage_version** （*int*） -

    Segment 的存储版本。

- **partition_id** （*int*） -

    Segment 所属 Partition 的 ID。在 PyMilvus v3.0.2 或更高版本中可用。

- **insert_channel** （*str*） -

    Segment 数据写入的插入通道。在 PyMilvus v3.0.2 或更高版本中可用。

- **compaction_from** （*list[int]*） -

    此 Segment 经 Compaction 生成时来源的 Segment 的 ID。在 PyMilvus v3.0.2 或更高版本中可用。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient, SegmentState

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
segments = client.list_segments(
    collection_name="docs",
    states=[SegmentState.Sealed],
)
for s in segments:
    print(
        s.segment_id,
        s.state,
    )
```
