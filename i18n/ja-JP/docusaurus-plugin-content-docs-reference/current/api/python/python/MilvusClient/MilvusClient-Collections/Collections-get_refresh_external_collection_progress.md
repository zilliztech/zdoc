---
title: "get_refresh_external_collection_progress() | Python | MilvusClient"
slug: /python/python/Collections-get_refresh_external_collection_progress
sidebar_label: "get_refresh_external_collection_progress()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された external collection の更新ジョブの進行状況を返します。 | Python | MilvusClient"
type: docx
token: HITBdKb0HotcK0xCKsycEeuqnXe
sidebar_position: 27
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - クラウド
  - get_refresh_external_collection_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_refresh_external_collection_progress()

この操作は、指定された external collection の更新ジョブの進行状況を返します。

<Admonition type="info" icon="📘" title="注意">

これには、以下のように project endpoint を使用して設定された MilvusClient が必要です。

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
def get_refresh_external_collection_progress(
    job_id: int,
    timeout: Optional[float] = None,
    **kwargs,
) -> RefreshExternalCollectionJobInfo:
```

**パラメーター:**

- **job_id** (*int*) -

    **[必須]**

    `refresh_external_collection()` によって返されるジョブ ID。

- **timeout** (*float*) - 

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*RefreshExternalCollectionJobInfo*

**戻り値:**

指定された external collection の更新ジョブの詳細を記録する **RefreshExternalCollectionJobInfo** オブジェクト。

**パラメーター:**

- **job_id** (*int*) -

    現在のリクエストで指定されたジョブ ID。

- **collection_name** (*string*) -

    `refresh_external_collection()` で指定された external collection の名前。

- **state** (*string*) -

    指定されたジョブの現在の状態。指定可能な値は次のとおりです。

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **progress** (*int*) -

    指定されたジョブの現在の進捗。値は 0 から 100 までの整数です。

- **external_source** (*str*) -

    `refresh_external_collection()` で指定された external source URI。

- **external_specs** (*str*) -

    `refresh_external_collection()` で指定された external specs。

- **reason** (*str*) -

    更新操作が失敗した場合のエラープロンプト。通常時は空文字列です。

- **start_time** (*int*) -

    指定されたジョブが開始される時点のミリ秒単位のタイムスタンプ。

- **end_time** (*int*) -  

    指定されたジョブが終了する時点のミリ秒単位のタイムスタンプ。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_PROJECT_ENDPOINT",
    token="YOUR_API_KEY"
)

job_id = client.refresh_external_collection(
    collection_name="test_collection"
)

while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")

    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        return job_id
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        return job_id

    time.sleep(2)
```

