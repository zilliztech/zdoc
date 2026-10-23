---
title: "list_compaction_tasks() | Python | MilvusClient"
slug: /python/python/Management-list_compaction_tasks
sidebar_label: "list_compaction_tasks()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出某个 Collection 仍保留的所有 Compaction 任务。 | Python | MilvusClient"
type: docx
token: G3gAdImCAoH7wCxiur7co8JTnz8
sidebar_position: 27
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - list_compaction_tasks()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_compaction_tasks()

此操作会列出某个 Collection 仍保留的所有 Compaction 任务。

## 请求语法\{#request-syntax}

```python
list_compaction_tasks(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> CompactionPlans
```

**参数：**

- **collection_name** （*str*） -

    目标 Collection 的名称。

- **timeout** （*float* | *None*） -

    该值默认为 `None`。

    此操作的超时时间，单位为秒。

**返回类型：**

*CompactionPlans*

**返回：**

返回一个 CompactionPlans 对象，其 plans 列表包含仍保留的 Compaction 任务。每个 plan 会提供其标识符，以及来自 CompactionTaskState 枚举的任务状态（例如 Executing、Completed、Failed 或 Timeout）。响应中还会包含 Collection 名称。

**参数：**

- **collection_name** （*str*） -

    所列任务所属的目标 Collection 的名称。

- **state** （*State*） -

    Compaction 作业的整体状态。可选值为 UndefiedState、Executing 和 Completed。

- **plans** （*list[Plan]*） -

    仍保留的 Compaction 任务。每个 Plan 对象包含下列成员。

    - **plan_id** （*int*） -

        此 Compaction 任务的 ID。

    - **task_id** （*int*） -

        plan_id 的别名。

    - **trigger_id** （*int*） -

        Compaction 触发器的 ID。

    - **collection_id** （*int*） -

        正在进行 Compaction 的 Collection 的 ID。

    - **partition_id** （*int*） -

        正在进行 Compaction 的 Partition 的 ID。

    - **channel** （*str*） -

        这些 Segment 所属的插入通道。

    - **compaction_type** （*CompactionType*） -

        此 Compaction 的类型。

    - **state** （*CompactionTaskState*） -

        此 Compaction 任务的状态。

    - **failure_reason** （*str*） -

        此任务失败的原因，或空字符串。

    - **sources** （*list*） -

        要合并的源 Segment 的 ID。

    - **target** （*int*） -

        目标 Segment 的 ID。

    - **targets** （*list[int]*） -

        目标 Segment 的 ID。当服务器未返回多个目标时，回退到 target。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息，以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
plans = client.list_compaction_tasks(collection_name="docs")
print(
    plans.collection_name,
    len(plans.plans),
)
```
