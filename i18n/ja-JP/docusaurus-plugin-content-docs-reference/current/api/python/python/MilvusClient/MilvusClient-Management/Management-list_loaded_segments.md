---
title: "list_loaded_segments() | Python | MilvusClient"
slug: /python/python/Management-list_loaded_segments
sidebar_label: "list_loaded_segments()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、コレクションに現在ロードされているすべてのセグメントを一覧表示します。行数、ソート状態、ストレージレベル、メモリサイズに関する情報も含まれます。 | Python | MilvusClient"
type: docx
token: QWlfd7SO1ojpdHxM968coTYQnYg
sidebar_position: 24
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - クラウド
  - list_loaded_segments()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_loaded_segments()

この操作では、コレクションに現在ロードされているすべてのセグメントを一覧表示します。これには、行数、ソート状態、ストレージレベル、メモリサイズに関する情報が含まれます。

<Admonition type="info" title="Notes">

これは管理対象のコレクションにのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.list_loaded_segments(
    collection_name: str,
    timeout: float = None
) -> List[LoadedSegmentInfo]
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    コレクションの名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*List[LoadedSegmentInfo]*

**戻り値:**

segment_id、collection_id、collection_name、num_rows、is_sorted、state、level、storage_version、mem_size を含む、ロード済みのセグメント情報オブジェクトのリスト。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

segments = client.list_loaded_segments(collection_name="my_collection")
for seg in segments:
    print(f"Segment {seg.segment_id}: {seg.num_rows} rows, mem={seg.mem_size}")
```
