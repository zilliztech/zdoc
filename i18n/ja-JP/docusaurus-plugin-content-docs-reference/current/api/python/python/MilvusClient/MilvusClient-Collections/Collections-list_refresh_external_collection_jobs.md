---
title: "list_refresh_external_collection_jobs() | Python | MilvusClient"
slug: /python/python/Collections-list_refresh_external_collection_jobs
sidebar_label: "list_refresh_external_collection_jobs()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、外部コレクションのリフレッシュジョブを、すべてのコレクションまたは指定したコレクションについて一覧表示します。 | Python | MilvusClient"
type: docx
token: VkBFdLHwao9hVMxzRurcBYIynFh
sidebar_position: 29
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k 近傍アルゴリズム
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - list_refresh_external_collection_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_refresh_external_collection_jobs()

この操作では、外部コレクションのリフレッシュジョブを、すべてのコレクションまたは指定したコレクションについて一覧表示します。

<Admonition type="info" title="Notes">

この操作には、次のプロジェクトエンドポイントを使用して設定した MilvusClient が必要です。

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
def list_refresh_external_collection_jobs(
```

**パラメーター:**

- **collection_name** (*string*) -

    対象のコレクションの名前です。このパラメーターを指定しない場合、すべての外部コレクションのリフレッシュジョブが返されます。

- **timeout** (*float*) -

    この操作のタイムアウト期間です。これを None に設定すると、応答が到着したとき、またはエラーが発生したときにこの操作がタイムアウトすることを示します。

**戻り値の型:**

*List*

**戻り値:**

RefreshExternalCollectionJobInfo オブジェクトのリストです。各オブジェクトには、外部コレクションのリフレッシュジョブの詳細が記録されます。

**パラメーター:**

- **job_id** (*int*) -

    現在のリクエストで指定されたジョブ ID です。

- **collection_name** (*string*) -

    `refresh_external_collection()` で指定された外部コレクションの名前です。

- **state** (*string*) -

    指定したジョブの現在の状態です。使用できる値は次のとおりです。

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **progress** (*int*) -

    指定したジョブの現在の進捗です。値は 0 から 100 までの整数です。

- **external_source** (*str*) -

    `refresh_external_collection()` で指定された外部ソース URI です。

- **external_specs** (*str*) -

    `refresh_external_collection()` で指定された外部仕様です。

- **reason** (*str*) -

    リフレッシュ操作が失敗した場合のエラーメッセージです。通常は空の文字列です。

- **start_time** (*int*) -

    指定したジョブが開始されたタイムスタンプです。単位はミリ秒です。

- **end_time** (*int*) -  

    指定したジョブが終了したタイムスタンプです。単位はミリ秒です。

## 例\{#examples}

```python
import time

from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
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
        break
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        break

    time.sleep(2)
```


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
