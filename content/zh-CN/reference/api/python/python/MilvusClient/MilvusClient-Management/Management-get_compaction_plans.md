---
title: "get_compaction_plans() | Python | MilvusClient"
slug: /python/python/Management-get_compaction_plans
sidebar_label: "get_compaction_plans()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回特定 Compaction 作业的 Compaction 计划，包括显示哪些 Segment 将被合并的合并计划。 | Python | MilvusClient"
type: docx
token: Qa8ZdRkOKocH60xujcLcOxuBnkh
sidebar_position: 18
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - zilliz
  - zilliz cloud
  - cloud
  - get_compaction_plans()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compaction_plans()

此操作返回特定 Compaction 作业的 Compaction 计划，包括显示哪些 Segment 将被合并的合并计划。

<Admonition type="info" icon="📘" title="Notes">

这仅适用于托管 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.get_compaction_plans(
    job_id: int,
    timeout: float = None
) -> CompactionPlans
```

**参数：**

- **job_id** (*int*) -

    **[必需]**

    由 `compact()` 返回的 Compaction 作业 ID。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*CompactionPlans*

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

job_id = client.compact(collection_name="my_collection")
plans = client.get_compaction_plans(job_id=job_id)
print(plans)
```
