---
title: "get_compaction_plans() | Python | MilvusClient"
slug: /python/python/Management-get_compaction_plans
sidebar_label: "get_compaction_plans()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、どのセグメントが結合されるかを示すマージプランを含め、特定の compaction ジョブの compaction プランを返します。 | Python | MilvusClient"
type: docx
token: Qa8ZdRkOKocH60xujcLcOxuBnkh
sidebar_position: 18
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
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

この操作は、どのセグメントが結合されるかを示すマージプランを含め、特定の compaction ジョブの compaction プランを返します。

<Admonition type="info" icon="📘" title="注意">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.get_compaction_plans(
    job_id: int,
    timeout: float = None
) -> CompactionPlans
```

**パラメータ:**

- **job_id** (*int*) -

    **[必須]**

    `compact()` によって返される compaction ジョブの ID。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが到着したとき、またはエラーが発生したときに、この操作はタイムアウトします。

**戻り値の型:**

*CompactionPlans*

**例外:**

- **MilvusException**

    この操作中にエラーが発生した場合、この例外が発生します。

## 例\{#example}

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
