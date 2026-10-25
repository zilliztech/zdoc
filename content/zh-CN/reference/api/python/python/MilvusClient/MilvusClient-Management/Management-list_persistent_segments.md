---
title: "list_persistent_segments() | Python | MilvusClient"
slug: /python/python/Management-list_persistent_segments
sidebar_label: "list_persistent_segments()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出 Collection 中所有持久化（已落盘）的 Segment，包括行数、排序状态和存储层级信息。 | Python | MilvusClient"
type: docx
token: EvBwdrnRHoExdlxVKcLcZyeQnHg
sidebar_position: 25
keywords: 
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - AI 幻觉
  - Zilliz
  - Zilliz Cloud
  - 云
  - list_persistent_segments()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_persistent_segments()

此操作会列出 Collection 中所有持久化（已落盘）的 Segment，包括行数、排序状态和存储层级信息。

<Admonition type="info" title="Notes">

此功能仅适用于托管 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
list_persistent_segments(
    collection_name: str,
    timeout: Optional[float] = None,
    states: Optional[Sequence[SegmentState]] = None,
    **kwargs
) -> List[SegmentInfo]
```

**参数：**

- **collection_name** （*str*） -

    **[必需]**

    Collection 的名称。

- **timeout** （*float* | *None*） -

    此操作的超时时间。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

**返回类型：**

*list[SegmentInfo]*

**返回：**

由持久化 Segment 信息对象组成的列表。每个 SegmentInfo 对象包含下列成员。

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

    Segment 的存储层级。

- **storage_version** （*int*） -

    Segment 的存储版本。

- **partition_id** （*int*） -

    Segment 所属 Partition 的 ID。适用于 PyMilvus v3.0.2 或更高版本。

- **insert_channel** （*str*） -

    Segment 数据写入的插入通道。适用于 PyMilvus v3.0.2 或更高版本。

- **compaction_from** （*list[int]*） -

    此 Segment 由哪些 Segment 经 Compaction 生成，即这些 Segment 的 ID。适用于 PyMilvus v3.0.2 或更高版本。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息，以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient, SegmentState

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
segments = client.list_persistent_segments(
    collection_name="docs",
    states=[SegmentState.Sealed],
)
```
