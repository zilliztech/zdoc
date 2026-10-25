---
title: "list_compaction_tasks() | Python | MilvusClient"
slug: /python/python/Management-list_compaction_tasks
sidebar_label: "list_compaction_tasks()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションにまだ保持されているすべての Compaction タスクを一覧表示します。 | Python | MilvusClient"
type: docx
token: G3gAdImCAoH7wCxiur7co8JTnz8
sidebar_position: 27
keywords: 
  - ベクトルデータベース
  - IVF
  - knn
  - 画像検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - list_compaction_tasks()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_compaction_tasks()

この操作は、コレクションにまだ保持されているすべての Compaction タスクを一覧表示します。

## Request Syntax\{#request-syntax}

```python
list_compaction_tasks(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> CompactionPlans
```

**PARAMETERS:**

- **collection_name** (*str*) -

    対象コレクションの名前です。

- **timeout** (*float | None*) -

    Default: `None`

    この操作のタイムアウト時間（秒）です。

**RETURN TYPE:**

*CompactionPlans*

**RETURNS:**

plans リストに保持されている Compaction タスクを含む CompactionPlans オブジェクトです。各 plan は、その識別子と、CompactionTaskState 列挙型からのタスク状態（Executing、Completed、Failed、Timeout など）を公開します。レスポンスにはコレクション名も含まれます。

**PARAMETERS:**

- **collection_name** (*str*) -

    一覧表示されたタスクが属する対象コレクションの名前です。

- **state** (*State*) -

    Compaction ジョブの全体的な状態です。指定できる値は、UndefiedState、Executing、Completed です。

- **plans** (*list[Plan]*) -

    保持されている Compaction タスクです。各 Plan オブジェクトには、以下に示すメンバーが含まれます。

    - **plan_id** (*int*) -

        この Compaction タスクの ID です。

    - **task_id** (*int*) -

        plan_id のエイリアスです。

    - **trigger_id** (*int*) -

        Compaction トリガーの ID です。

    - **collection_id** (*int*) -

        Compaction の対象となるコレクションの ID です。

    - **partition_id** (*int*) -

        Compaction の対象となるパーティションの ID です。

    - **channel** (*str*) -

        セグメントが属する挿入チャネルです。

    - **compaction_type** (*CompactionType*) -

        この Compaction のタイプです。

    - **state** (*CompactionTaskState*) -

        この Compaction タスクの状態です。

    - **failure_reason** (*str*) -

        このタスクが失敗した理由、または空の文字列です。

    - **sources** (*list*) -

        マージするソースセグメントの ID です。

    - **target** (*int*) -

        ターゲットセグメントの ID です。

    - **targets** (*list[int]*) -

        ターゲットセグメントの ID です。サーバーが複数のターゲットを返さない場合は、target にフォールバックします。

**EXCEPTIONS:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
plans = client.list_compaction_tasks(collection_name="docs")
print(
    plans.collection_name,
    len(plans.plans),
)
```
