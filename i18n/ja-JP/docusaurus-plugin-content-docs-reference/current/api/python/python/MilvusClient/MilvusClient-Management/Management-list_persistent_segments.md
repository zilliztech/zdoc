---
title: "list_persistent_segments() | Python | MilvusClient"
slug: /python/python/Management-list_persistent_segments
sidebar_label: "list_persistent_segments()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのすべての永続的な（フラッシュ済みの）セグメントを一覧表示します。行数、ソート状態、ストレージレベルに関する情報も含まれます。 | Python | MilvusClient"
type: docx
token: EvBwdrnRHoExdlxVKcLcZyeQnHg
sidebar_position: 25
keywords: 
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - AI ハルシネーション
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

この操作は、コレクションのすべての永続的な（フラッシュ済みの）セグメントを一覧表示します。行数、ソート状態、ストレージレベルに関する情報も含まれます。

<Admonition type="info" title="Notes">

これは管理対象のコレクションにのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
list_persistent_segments(
    collection_name: str,
    timeout: Optional[float] = None,
    states: Optional[Sequence[SegmentState]] = None,
    **kwargs
) -> List[SegmentInfo]
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    コレクションの名前です。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。これを None に設定すると、レスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*list[SegmentInfo]*

**戻り値:**

永続セグメント情報オブジェクトのリストです。各 SegmentInfo オブジェクトには、以下に示すメンバーが含まれます。

**パラメーター:**

- **segment_id** (*int*) -

    セグメントの ID です。

- **collection_id** (*int*) -

    セグメントが属するコレクションの ID です。

- **collection_name** (*str*) -

    セグメントが属するコレクションの名前です。

- **num_rows** (*int*) -

    セグメント内の行数です。

- **is_sorted** (*bool*) -

    セグメント内のデータがソートされているかどうかを示すフラグです。

- **state** (*SegmentState*) -

    セグメントのライフサイクル状態です。

- **level** (*SegmentLevel*) -

    セグメントのストレージレベルです。

- **storage_version** (*int*) -

    セグメントのストレージバージョンです。

- **partition_id** (*int*) -

    セグメントが属するパーティションの ID です。PyMilvus v3.0.2 以降で使用できます。

- **insert_channel** (*str*) -

    セグメントデータの書き込み先となった挿入チャネルです。PyMilvus v3.0.2 以降で使用できます。

- **compaction_from** (*list[int]*) -

    このセグメントの Compaction 元となったセグメントの ID です。PyMilvus v3.0.2 以降で使用できます。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient, SegmentState

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
segments = client.list_persistent_segments(
    collection_name="docs",
    states=[SegmentState.Sealed],
)
```
