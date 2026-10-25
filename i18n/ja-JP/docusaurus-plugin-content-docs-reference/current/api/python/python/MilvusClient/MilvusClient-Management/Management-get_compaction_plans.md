---
title: "get_compaction_plans() | Python | MilvusClient"
slug: /python/python/Management-get_compaction_plans
sidebar_label: "get_compaction_plans()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の Compaction ジョブの Compaction プランを返します。これには、どのセグメントが結合されるかを示すマージプランが含まれます。 | Python | MilvusClient"
type: docx
token: XnCrdUF2MoACxExami4c5B5Hnph
sidebar_position: 18
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - クラウド
  - get_compaction_plans()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_compaction_plans()

この操作は、特定の Compaction ジョブの Compaction プランを返します。これには、どのセグメントが結合されるかを示すマージプランが含まれます。

## リクエスト構文\{#request-syntax}

```python
__init__(
    compaction_id: int,
    state: int,
    collection_name: str = ""
) -> None
```

**パラメーター:**

- **job_id** (*int*) -

    **[必須]**

    `compact()` によって返される Compaction ジョブの ID です。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。これを None に設定すると、応答が到着するかエラーが発生したときにこの操作がタイムアウトすることを示します。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

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
