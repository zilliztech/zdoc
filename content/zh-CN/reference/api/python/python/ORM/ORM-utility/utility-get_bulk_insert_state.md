---
title: "get_bulk_insert_state() | Python | ORM"
slug: /python/python/utility-get_bulk_insert_state
sidebar_label: "get_bulk_insert_state()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回指定批量导入任务的状态。 | Python | ORM"
type: docx
token: XzHhd3AdCo9DCsxawYycr69CnAb
sidebar_position: 13
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - get_bulk_insert_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# get_bulk_insert_state()

此操作返回指定批量导入任务的状态。

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

- **task_id** (*int*) -<br/>
  **[必需]**

    由 do_bulk_insert() 函数返回的任务 ID。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

返回类型：

*[BulkInsertState](./utility-BulkInsertState)*

**返回：**
一个 **[BulkInsertState](./utility-BulkInsertState)**，其中包含指定批量导入任务状态的信息。

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

**[BulkInsertState](./utility-BulkInsertState)** 对象包含以下字段

- **task_id** (*int*)

    由 **do_bulk_insert()** 函数返回的任务 ID。

- **state** (*int*)

    指定 bulk_insert 任务的整数状态。可能的取值如下：

    - **0**：表示任务处于待处理状态

    - **1**：表示任务失败。

    - **2**：表示任务已经开始。

    - **5**：表示数据已持久化。

    - **6**：表示任务已完成。

    - **7**：表示任务失败且数据已被清理。

    - **100**：表示任务处于未知状态。

- **state_name** (*str*)

    指定 bulk_insert 任务的整数状态。可能的取值为以下整数：

    - **Pending**：表示任务处于待处理状态

    - **Failed**：表示任务失败。

    - **Started**：表示任务已经开始。

    - **Persisted**：表示数据已持久化。

    - **Completed**：表示任务已完成。

    - **FailedAndCleaned**：表示任务失败且数据已被清理。

    - **Unknown**：表示任务处于未知状态。

- **row_count** (*int*)

    当前批量导入任务中已插入的实体数量。

- **progress** (*int*) 

    当前批量导入任务的进度。

- **infos** (*dict*)

    一个字典，包含当前批量导入任务的信息。可能的键如下：

    - **files** (*str*)

        当前批量导入任务涉及的文件名称，以逗号分隔的字符串表示。

    - **[collection](./ORM-Collection)** (*str*)

        目标集合的名称。

    - **[partition](./ORM-Partition)** (*str*)

        目标分区的名称。

    - **failed_reason** (*str*)

        批量导入失败的原因。如果任务成功，则该值为空字符串。

    - **progress_percent** (str)

        当前批量导入任务的百分比进度。

    - **persist_cost** (str)

        当前批量导入任务的持久化耗时。

- **ids** (*list*) 

    以列表形式表示已插入实体的 ID。

- **id_ranges** (*google._upb._message.RepeatedScalarContainer*)

- 已插入实体的 ID 范围。

- **files** (str)

    当前批量导入任务涉及的文件名称，以逗号分隔的字符串表示。

- **create_timestamp** (int)

    当前批量导入任务的创建时间戳。

- **create_time_str** (str)

    当前批量导入任务的创建时间戳，以人类可读的字符串形式表示。

- **collection_name** (str)

    目标集合的名称。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

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

