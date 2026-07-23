---
title: "get_bulk_insert_state() | Python | ORM"
slug: /python/python/utility-get_bulk_insert_state
sidebar_label: "get_bulk_insert_state()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された bulk-insert タスクの状態を返します。 | Python | ORM"
type: docx
token: XzHhd3AdCo9DCsxawYycr69CnAb
sidebar_position: 13
keywords: 
  - milvus open source
  - Milvus はどのように動作するか
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

この操作は、指定された bulk-insert タスクの状態を返します。

## Request syntax\{#request-syntax}

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

**PARAMETERS:**

- **task_id** (*int*) -<br/>
  **[REQUIRED]**

    **do_bulk_insert()** 関数によって返されるタスク ID。

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

RETURN TYPE:

*[BulkInsertState](./utility-BulkInsertState)*

**RETURNS:**
指定された bulk-insert タスクの状態に関する情報を含む **[BulkInsertState](./utility-BulkInsertState)**。

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

**[BulkInsertState](./utility-BulkInsertState)** オブジェクトには、以下のフィールドがあります

- **task_id** (*int*)

    **do_bulk_insert()** 関数によって返されるタスク ID。

- **state** (*int*)

    指定された bulk_insert タスクの状態を整数で表したものです。取り得る値は以下の整数です。

    - **0**: タスクが保留状態であることを示します

    - **1**: タスクが失敗したことを示します。

    - **2**: タスクがすでに開始されていることを示します。

    - **5**: データが永続化されたことを示します。

    - **6**: タスクが完了したことを示します。

    - **7**: タスクが失敗し、データがクリーンアップされたことを示します。

    - **100**: タスクが不明な状態にあることを示します。

- **state_name** (*str*)

    指定された bulk_insert タスクの状態名です。取り得る値は以下のとおりです。

    - **Pending**: タスクが保留状態であることを示します

    - **Failed**: タスクが失敗したことを示します。

    - **Started**: タスクがすでに開始されていることを示します。

    - **Persisted**: データが永続化されたことを示します。

    - **Completed**: タスクが完了したことを示します。

    - **FailedAndCleaned**: タスクが失敗し、データがクリーンアップされたことを示します。

    - **Unknown**: タスクが不明な状態にあることを示します。

- **row_count** (*int*)

    現在の bulk-insert タスクで挿入されたエンティティ数。

- **progress** (*int*) 

    現在の bulk-insert タスクの進行状況。

- **infos** (*dict*)

    現在の bulk-insert タスクに関する情報を含む辞書です。取り得るキーは以下のとおりです。

    - **files** (*str*)

        現在の bulk-insert タスクに含まれるファイル名を、カンマ区切りの文字列で表したものです。

    - **[collection](./ORM-Collection)** (*str*)

        対象 collection の名前。

    - **[partition](./ORM-Partition)** (*str*)

        対象 partition の名前。

    - **failed_reason** (*str*)

        bulk-insert が失敗した場合の理由。タスクが成功した場合、これは空文字列です。

    - **progress_percent** (str)

        現在の bulk-insert タスクの進行状況をパーセンテージで表したものです。

    - **persist_cost** (str)

        現在の bulk-insert タスクの永続化コスト。

- **ids** (*list*) 

    挿入されたエンティティの ID を格納したリスト。

- **id_ranges** (*google._upb._message.RepeatedScalarContainer*)

- 挿入されたエンティティの ID 範囲。

- **files** (str)

    現在の bulk-insert タスクに含まれるファイル名を、カンマ区切りの文字列で表したものです。

- **create_timestamp** (int)

    現在の bulk-insert タスクが作成された時点のタイムスタンプ。

- **create_time_str** (str)

    現在の bulk-insert タスクが作成された時点のタイムスタンプを、人が読める文字列で表したものです。

- **collection_name** (str)

    対象 collection の名前。

**EXCEPTIONS:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合、この例外がスローされます。

## Examples\{#examples}

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

## Related operations\{#related-operations}

以下の操作は `get_bulk_insert_state()` に関連しています。

- [BulkInsertState](./utility-BulkInsertState)

- [do_bulk_insert()](./utility-do_bulk_insert)

- [list_bulk_insert_tasks()](./utility-list_bulk_insert_tasks)

