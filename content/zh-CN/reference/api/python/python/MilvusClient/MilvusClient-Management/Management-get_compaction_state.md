---
title: "get_compaction_state() | Python | MilvusClient"
slug: /python/python/Management-get_compaction_state
sidebar_label: "get_compaction_state()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作返回压缩作业的当前状态。在调用 `compact()` 后，使用此操作可验证压缩是否已完成。 | Python | MilvusClient"
type: docx
token: MSDVdu103obklexX8GvcW5cWnCf
sidebar_position: 19
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - get_compaction_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compaction_state()

此操作返回压缩作业的当前状态。在调用 `compact()` 后，使用此操作可验证压缩是否已完成。

<Admonition type="info" icon="📘" title="说明">

此方法此前名为 `get_compact_state()`。其行为完全相同。

</Admonition>

<Admonition type="info" icon="📘" title="说明">

这仅适用于托管集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.get_compaction_state(
    job_id: int,
    timeout: float = None
) -> str
```

**参数：**

- **job_id** (*int*) -

    **[必需]**

    `compact()` 返回的压缩作业 ID。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*str*

**返回值：**

压缩作业的状态名称。可能的值包括 `"UndefiedState"`、`"Executing"` 和 `"Completed"`。

**异常：**

- **MilvusException**

    当作业 ID 无效或服务器遇到错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Start compaction and check its state
job_id = client.compact(collection_name="my_collection")
state = client.get_compaction_state(job_id=job_id)
print(state)  # "Executing" or "Completed"
```

