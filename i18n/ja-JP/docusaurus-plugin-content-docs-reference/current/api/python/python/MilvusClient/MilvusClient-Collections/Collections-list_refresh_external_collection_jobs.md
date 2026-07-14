---
title: "list_refresh_external_collection_jobs() | Python | MilvusClient"
slug: /python/python/Collections-list_refresh_external_collection_jobs
sidebar_label: "list_refresh_external_collection_jobs()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべてまたは指定された collection の external collection refresh job を一覧表示します。 | Python | MilvusClient"
type: docx
token: VkBFdLHwao9hVMxzRurcBYIynFh
sidebar_position: 28
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k nearest neighbor algorithm
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

この操作は、すべてまたは指定された collection の external collection refresh job を一覧表示します。

<Admonition type="info" icon="📘" title="注意">

これには、次のように project endpoint を使用してセットアップされた MilvusClient が必要です。

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
def list_refresh_external_collection_jobs(
    collection_name: str = "",
    timeout: Optional[float] = None,
    **kwargs,
) -> List:
```

**PARAMETERS:**

- **collection_name** (*string*) -

    対象 collection の名前です。このパラメータを指定しない場合、すべての external collection の refresh job が返されます。

- **timeout** (*float*) - 

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*List*

**RETURNS:**

**RefreshExternalCollectionJobInfo** オブジェクトのリスト。各オブジェクトには、external collection refresh job の詳細が記録されます。

**PARAMETERS:**

- **job_id** (*int*) -

    現在のリクエストで指定された job ID です。

- **collection_name** (*string*) -

    `refresh_external_collection()` で指定された external collection の名前です。

- **state** (*string*) -

    指定された job の現在の状態です。指定可能な値は次のとおりです。

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **progress** (*int*) -

    指定された job の現在の進行状況です。値は 0 から 100 までの整数です。

- **external_source** (*str*) -

    `refresh_external_collection()` で指定された external source URI です。

- **external_specs** (*str*) -

    `refresh_external_collection()` で指定された external specs です。

- **reason** (*str*) -

    refresh 操作が失敗した場合のエラーメッセージです。通常時は空文字列です。

- **start_time** (*int*) -

    指定された job が開始した時刻のミリ秒タイムスタンプです。

- **end_time** (*int*) -  

    指定された job が終了した時刻のミリ秒タイムスタンプです。

## Example\{#example}

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

