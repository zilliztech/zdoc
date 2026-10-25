---
title: "get_compaction_plans() | Python | MilvusClient"
slug: /python/python/Management-get_compaction_plans
sidebar_label: "get_compaction_plans()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回特定 Compaction 作业的 Compaction 计划，包括显示哪些 Segment 将被合并的合并计划。 | Python | MilvusClient"
type: docx
token: XnCrdUF2MoACxExami4c5B5Hnph
sidebar_position: 18
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - Zilliz
  - Zilliz Cloud
  - 云
  - get_compaction_plans()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_compaction_plans()

此操作返回特定 Compaction 作业的 Compaction 计划，包括显示哪些 Segment 将被合并的合并计划。

## 请求语法\{#request-syntax}

```python
__init__(
    compaction_id: int,
    state: int,
    collection_name: str = ""
) -> None
```

**参数：**

- **job_id** (*int*) -

    **[必需]**

    由 `compact()` 返回的 Compaction 作业 ID。

- **timeout** (*float | None*) -

    此操作的超时时间。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息，以了解确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
plans = client.get_compaction_plans(compaction_id="449019091")
print(
    plans.collection_name,
    plans.state,
)
for plan in plans.plans:
    print(
        plan.plan_id,
        plan.trigger_id,
    )
```
