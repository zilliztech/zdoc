---
title: "list_bulk_insert_tasks() | Python | ORM"
slug: /python/python/utility-list_bulk_insert_tasks
sidebar_label: "list_bulk_insert_tasks()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべての bulk-insert タスクを一覧表示します。 | Python | ORM"
type: docx
token: T1CGdXeVkoG2yAxkualc1jVonRb
sidebar_position: 23
keywords: 
  - Deep Learning
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - クラウド
  - list_bulk_insert_tasks()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_bulk_insert_tasks()

この操作は、すべての bulk-insert タスクを一覧表示します。

## Request syntax\{#request-syntax}

```python
list_bulk_insert_tasks(
    limit: int = 0,
    collection_name: list[str] | None,
    timeout: float | None,
    using: str = "default",
)
```

**PARAMETERS:**

- **limit** (*int*) -

    返されるタスク数です。

    値のデフォルトは **0** で、制限がないことを示します。 

- **collection_name** (*list[str]*) -

    collection 名のリストです。

    値のデフォルトは **None** で、すべての collection が含まれることを示します。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返るか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**RETURN TYPE:**

*list*

**RETURNS:**
**[BulkInsertState](./utility-BulkInsertState)** オブジェクトのリストです。

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

- **task_id** (*int*)

    **do_bulk_insert()** 関数によって返されるタスク ID です。

- **state** (*int*)

    指定された bulk_insert タスクの状態を整数で表したものです。使用可能な値は次の整数です。

    - **0**: タスクが保留状態であることを示します

    - **1**: タスクが失敗したことを示します。

    - **2**: タスクがすでに開始されていることを示します。

    - **5**: データが永続化されたことを示します。

    - **6**: タスクが完了したことを示します。

    - **7**: タスクが失敗し、データがクリーンアップされたことを示します。

    - **100**: タスクが不明な状態であることを示します。

- **state_name** (*str*)

    指定された bulk_insert タスクの状態名です。使用可能な値は次のとおりです。

    - **Pending**: タスクが保留状態であることを示します

    - **Failed**: タスクが失敗したことを示します。

    - **Started**: タスクがすでに開始されていることを示します。

    - **Persisted**: データが永続化されたことを示します。

    - **Completed**: タスクが完了したことを示します。

    - **FailedAndCleaned**: タスクが失敗し、データがクリーンアップされたことを示します。

    - **Unknown**: タスクが不明な状態であることを示します。

- **row_count** (*int*)

    現在の bulk-insert タスクで挿入されたエンティティ数です。

- **progress** (*int*) 

    現在の bulk-insert タスクの進行状況です。

- **infos** (*dict*)

    現在の bulk-insert タスクに関する情報を含む辞書です。使用可能なキーは次のとおりです。

    - **files** (*str*)

        現在の bulk-insert タスクに関係するファイル名を、カンマ区切りの文字列で表したものです。

    - **[collection](./ORM-Collection)** (*str*)

        対象 collection の名前です。

    - **[partition](./ORM-Partition)** (*str*)

        対象 partition の名前です。

    - **failed_reason** (*str*)

        bulk-insert が失敗した場合の理由です。タスクが成功した場合、これは空文字列です。

    - **progress_percent** (str)

        現在の bulk-insert タスクの進行状況をパーセンテージで表したものです。

    - **persist_cost** (str)

        現在の bulk-insert タスクの永続化コストです。

- **ids** (*list*) 

    挿入されたエンティティの ID を格納したリストです。

- **id_ranges** (*google._upb._message.RepeatedScalarContainer*)

- 挿入されたエンティティの ID 範囲です。

- **files** (str)

    現在の bulk-insert タスクに関係するファイル名を、カンマ区切りの文字列で表したものです。

- **create_timestamp** (int)

    現在の bulk-insert タスクが作成された時点のタイムスタンプです。

- **create_time_str** (str)

    現在の bulk-insert タスクが作成された時点のタイムスタンプを、人が読める文字列で表したものです。

- **collection_name** (str)

    対象 collection の名前です。

**EXCEPTIONS:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合に、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# List all bulk-insert tasks
res = utility.list_bulk_insert_tasks()
```

## Related operations\{#related-operations}

次の操作は `list_bulk_insert_state()` に関連しています。

- [BulkInsertState](./utility-BulkInsertState)

- [do_bulk_insert()](./utility-do_bulk_insert)

- [get_bulk_insert_state()](./utility-get_bulk_insert_state)

