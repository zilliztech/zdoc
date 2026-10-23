---
title: "get_refresh_external_collection_progress() | Python | MilvusClient"
slug: /python/python/Collections-get_refresh_external_collection_progress
sidebar_label: "get_refresh_external_collection_progress()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定した外部コレクションのリフレッシュジョブの進捗状況を返します。 | Python | MilvusClient"
type: docx
token: HITBdKb0HotcK0xCKsycEeuqnXe
sidebar_position: 28
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - hnsw アルゴリズム
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

この操作は、指定した外部コレクションのリフレッシュジョブの進捗状況を返します。

<Admonition type="info" title="Notes">

これには、次のようにプロジェクトエンドポイントを使用して設定された MilvusClient が必要です：

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
def get_refresh_external_collection_progress(
```

**パラメーター:**

- **job_id** (*int*) -

    **[必須]**

    refresh_external_collection() によって返されるジョブ ID です。

- **timeout** (*float*) -

    この操作のタイムアウト時間です。None に設定すると、応答が到着するかエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*RefreshExternalCollectionJobInfo*

**戻り値:**

指定した外部コレクションのリフレッシュジョブの詳細を記録する RefreshExternalCollectionJobInfo オブジェクトです。

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

    指定したジョブの現在の進捗状況です。値は 0 から 100 までの整数です。

- **external_source** (*str*) -

    `refresh_external_collection()` で指定された外部ソース URI です。

- **external_specs** (*str*) -

    `refresh_external_collection()` で指定された外部仕様です。

- **reason** (*str*) -

    リフレッシュ操作が失敗した場合のエラープロンプトです。通常の場合は空文字列です。

- **start_time** (*int*) -

    指定したジョブが開始するタイムスタンプ（ミリ秒）です。

- **end_time** (*int*) -  

    指定したジョブが終了するタイムスタンプ（ミリ秒）です。

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
