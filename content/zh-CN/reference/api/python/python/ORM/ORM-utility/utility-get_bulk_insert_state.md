---
title: "get_bulk_insert_state() | Python | ORM"
slug: /python/python/utility-get_bulk_insert_state
sidebar_label: "get_bulk_insert_state()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回指定批量插入任务的状态。 | Python | ORM"
type: docx
token: XzHhd3AdCo9DCsxawYycr69CnAb
sidebar_position: 13
keywords: 
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - zilliz
  - Zilliz Cloud
  - 云
  - get_bulk_insert_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# get_bulk_insert_state()

此操作返回指定批量插入任务的状态。

## 请求语法\{#request-syntax}

```python
get_bulk_insert_state(
    task_id: int,
    timeout: float | None,
    using: str = "default",
    **kwargs,
)
```

```python
from pymilvus import connections, utility
connections.connect()

task_id = utility.do_bulk_insert(
    collection_name="string",
    files=["string.npy", "string.npy"],
)

# Get bulk-insert task state
res = utility.get_bulk_insert_state(task_id=task_id)
```

**参数：**

- **task_id** （*int*） -<br/>
  **[必需]**

    **do_bulk_insert()** 函数返回的任务 ID。

- **using** （*str*）- 

    所用连接的别名。

    该值默认为 **default**，表示此操作使用默认连接。

- **timeout** （*float* | *None*）  

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

返回类型：

*[BulkInsertState](./utility-BulkInsertState)*

**返回：**
一个包含指定批量插入任务状态信息的 **[BulkInsertState](./utility-BulkInsertState)**。

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

**[BulkInsertState](./utility-BulkInsertState)** 对象包含以下字段：

- **task_id** （*int*）

    **do_bulk_insert()** 函数返回的任务 ID。

- **state** （*int*）

    以整数表示的指定 bulk_insert 任务的状态。可选值为以下整数：

    - **0**：表示任务处于待处理状态

    - **1**：表示任务失败。

    - **2**：表示任务已开始。

    - **5**：表示数据已持久化。

    - **6**：表示任务已完成。

    - **7**：表示任务失败且数据已清理。

    - **100**：表示任务处于未知状态。

- **state_name** （*str*）

    以整数表示的指定 bulk_insert 任务的状态。可选值为以下整数：

    - **Pending**：表示任务处于待处理状态

    - **Failed**：表示任务失败。

    - **Started**：表示任务已开始。

    - **Persisted**：表示数据已持久化。

    - **Completed**：表示任务已完成。

    - **FailedAndCleaned**：表示任务失败且数据已清理。

    - **Unknown**：表示任务处于未知状态。

- **row_count** （*int*）

    当前批量插入任务中插入的 Entity 数量。

- **progress** （*int*）

    当前批量插入任务的进度。

- **infos** （*dict*）

    包含当前批量插入任务相关信息的字典。可能的键如下：

    - **files** （*str*）

        以逗号分隔的字符串形式列出当前批量插入任务涉及的文件的名称。

    - **[Collection](./ORM-Collection)** （*str*）

        目标 Collection 的名称。

    - **[Partition](./ORM-Partition)** （*str*）

        目标 Partition 的名称。

    - **failed_reason** （*str*）

        任何批量插入失败的原因。如果任务成功，则此值为空字符串。

    - **progress_percent** （str）

        当前批量插入任务的进度百分比。

    - **persist_cost** （str）

        当前批量插入任务的持久化开销。

- **ids** （*list*） 

    以列表形式表示已插入 Entity 的 ID。

- **id_ranges** （*google._upb._message.RepeatedScalarContainer*）

- 范围内已插入 Entity 的 ID。

- **files** （str）

    以逗号分隔的字符串形式列出当前批量插入任务涉及的文件的名称。

- **create_timestamp** （int）

    当前批量插入任务创建时的时间戳。

- **create_time_str** （str）

    当前批量插入任务创建时的时间戳，采用人类可读的字符串格式。

- **collection_name** （str）

    目标 Collection 的名称。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Bulk-insert data
task_id = utility.do_bulk_insert(
    collection_name="test_collection",
    files=["data/id.npy", "data/vector.npy"],
) # 446781855410077319

# Get bulk-insert task state
res = utility.get_bulk_insert_state(task_id=task_id)

# <Bulk insert state:
#     - taskID          : 446781855410077319,
#     - state           : Completed,
#     - row_count       : 10000,
#     - infos           : {'files': 'data/id.npy,data/vector.npy', 'collection': 'test_collection_2', 'partition': '_default', 'failed_reason': '', 'progress_percent': '100', 'persist_cost': '0.34'},
#     - id_ranges       : [],
#     - create_ts       : 2024-01-06 22:24:07
# >
```

## 相关操作\{#related-operations}

以下操作与 `get_bulk_insert_state()` 相关：

- [BulkInsertState](./utility-BulkInsertState)

- [do_bulk_insert()](./utility-do_bulk_insert)

- [list_bulk_insert_tasks()](./utility-list_bulk_insert_tasks)
