---
title: "list_persistent_segments() | Python | MilvusClient"
slug: /python/python/Management-list_persistent_segments
sidebar_label: "list_persistent_segments()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、collection のすべての永続化された（フラッシュ済みの）segment を一覧表示します。行数、ソート状態、ストレージレベルに関する情報が含まれます。 | Python | MilvusClient"
type: docx
token: QsGNdp1t3oHaunxgIZGc3PdSnof
sidebar_position: 24
keywords: 
  - ベクトルデータベース比較
  - Faiss
  - 動画検索
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - クラウド
  - list_persistent_segments()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_persistent_segments()

この操作では、collection のすべての永続化された（フラッシュ済みの）segment を一覧表示します。行数、ソート状態、ストレージレベルに関する情報が含まれます。

<Admonition type="info" icon="📘" title="注意">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.list_persistent_segments(
    collection_name: str,
    timeout: float = None
) -> List[SegmentInfo]
```

**パラメータ:**

- **collection_name** (*str*) -

    **[必須]**

    collection の名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが到着するかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*List[SegmentInfo]*

**戻り値:**

segment_id、collection_id、collection_name、num_rows、is_sorted、state、level、および storage_version を含む永続 segment 情報オブジェクトのリスト。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

segments = client.list_persistent_segments(collection_name="my_collection")
for seg in segments:
    print(f"Segment {seg.segment_id}: {seg.num_rows} rows, level={seg.level}")
```
