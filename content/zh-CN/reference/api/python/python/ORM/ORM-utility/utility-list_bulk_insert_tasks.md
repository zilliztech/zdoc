---
title: "list_bulk_insert_tasks() | Python | ORM"
slug: /python/python/utility-list_bulk_insert_tasks
sidebar_label: "list_bulk_insert_tasks()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有批量插入任务。 | Python | ORM"
type: docx
token: T1CGdXeVkoG2yAxkualc1jVonRb
sidebar_position: 23
keywords: 
  - 深度学习
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - zilliz
  - zilliz cloud
  - 云
  - list_bulk_insert_tasks()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_bulk_insert_tasks()

此操作会列出所有批量插入任务。

## 请求语法\{#request-syntax}

```python
list_bulk_insert_tasks(
    limit: int = 0,
    collection_name: list[str] | None,
    timeout: float | None,
    using: str = "default",
)
```

**参数：**

- **limit** （*int*） -

    要返回的任务数量。

    该值默认为 **0**，表示不设限制。

- **collection_name** （*list[str]*） -

    Collection 名称列表。

    该值默认为 **None**，表示包含所有 Collection。

- **using** （*str*） - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** （*float* | *None*）  

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

**返回类型：**

*list*

**返回：**
**[BulkInsertState](./utility-BulkInsertState)** 对象列表。

```python
├── BulkInsertState
│   ├── task_id 
│   ├── state 
│   ├── state_name   
│   ├── row_count
│   ├── progress
│   └── infos
│       ├── files
│       ├── collection
│       ├── partition
│       ├── failed_reason
│       ├── progress_percent
│       └── persist_cost
│   ├── ids
│   ├── id_ranges
│   ├── files
│   ├── create_timestamp
│   ├── create_time_str
│   └── collection_name
```

- **task_id** （*int*）

    由 **do_bulk_insert()** 函数返回的任务 ID。

- **state** （*int*）

    指定 bulk_insert 任务的整数状态。可能值为以下整数：

    - **0**：表示任务处于待处理状态。

    - **1**：表示任务失败。

    - **2**：表示任务已启动。

    - **5**：表示数据已持久化。

    - **6**：表示任务已完成。

    - **7**：表示任务失败且数据已清理。

    - **100**：表示任务处于未知状态。

- **state_name** （*str*）

    指定 bulk_insert 任务的整数状态。可能值为以下整数：

    - **Pending**：表示任务处于待处理状态。

    - **Failed**：表示任务失败。

    - **Started**：表示任务已启动。

    - **Persisted**：表示数据已持久化。

    - **Completed**：表示任务已完成。

    - **FailedAndCleaned**：表示任务失败且数据已清理。

    - **Unknown**：表示任务处于未知状态。

- **row_count** （*int*）

    当前批量插入任务中插入的 Entity 数量。

- **progress** （*int*） 

    当前批量插入任务的进度。

- **infos** （*dict*）

    包含当前批量插入任务信息的字典。可能的键如下：

    - **files** （*str*）

        当前批量插入任务所涉及文件的名称，以逗号分隔字符串表示。

    - **[Collection](./ORM-Collection)** （*str*）

        目标 Collection 的名称。

    - **[Partition](./ORM-Partition)** （*str*）

        目标 Partition 的名称。

    - **failed_reason** （*str*）

        任何批量插入失败的原因。如果任务成功，则为空字符串。

    - **progress_percent** （str）

        当前批量插入任务的进度百分比。

    - **persist_cost** （str）

        当前批量插入任务的持久化开销。

- **ids** （*list*） 

    已插入 Entity 的 ID 列表。

- **id_ranges** （*google._upb._message.RepeatedScalarContainer*）

- 以范围表示的已插入 Entity 的 ID。

- **files** （str）

    当前批量插入任务所涉及文件的名称，以逗号分隔字符串表示。

- **create_timestamp** （int）

    当前批量插入任务的创建时间戳。

- **create_time_str** （str）

    当前批量插入任务的创建时间戳，以人类可读字符串表示。

- **collection_name** （str）

    目标 Collection 的名称。

**异常：**

- **MilvusException**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# List all bulk-insert tasks
res = utility.list_bulk_insert_tasks()
```

## 相关操作\{#related-operations}

以下操作与 `list_bulk_insert_state()` 相关：

- [BulkInsertState](./utility-BulkInsertState)

- [do_bulk_insert()](./utility-do_bulk_insert)

- [get_bulk_insert_state()](./utility-get_bulk_insert_state)

