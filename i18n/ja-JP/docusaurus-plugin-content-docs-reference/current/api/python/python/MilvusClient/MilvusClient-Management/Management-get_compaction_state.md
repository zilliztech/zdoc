---
title: "get_compaction_state() | Python | MilvusClient"
slug: /python/python/Management-get_compaction_state
sidebar_label: "get_compaction_state()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "`compact()` を呼び出した後に compaction が完了したことを確認するために使用します。この操作は compaction ジョブの現在の状態を返します。 | Python | MilvusClient"
type: docx
token: MSDVdu103obklexX8GvcW5cWnCf
sidebar_position: 19
keywords: 
  - ハイブリッドベクトル検索
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - get_compaction_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compaction_state()

この操作は compaction ジョブの現在の状態を返します。`compact()` を呼び出した後に、compaction が完了したことを確認するために使用します。

<Admonition type="info" icon="📘" title="注記">

このメソッドは以前は `get_compact_state()` という名前でした。動作は同一です。

</Admonition>

<Admonition type="info" icon="📘" title="注記">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.get_compaction_state(
    job_id: int,
    timeout: float = None
) -> str
```

**パラメータ:**

- **job_id** (*int*) -

    **[必須]**

    `compact()` によって返される compaction ジョブの ID。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、応答が到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*str*

**戻り値:**

compaction ジョブの状態名。取り得る値は `"UndefiedState"`、`"Executing"`、`"Completed"` です。

**例外:**

- **MilvusException**

    ジョブ ID が無効な場合、またはサーバーでエラーが発生した場合にこの例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# compaction を開始してその状態を確認する
job_id = client.compact(collection_name="my_collection")
state = client.get_compaction_state(job_id=job_id)
print(state)  # "Executing" or "Completed"
```

