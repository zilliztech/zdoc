---
title: "list_segments() | Python | MilvusClient"
slug: /python/python/Management-list_segments
sidebar_label: "list_segments()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定したライフサイクル状態にまだ保持されているコレクションのセグメントを一覧表示します。 | Python | MilvusClient"
type: docx
token: XQaYdrunfo03uZxNvv9csRTGnYc
sidebar_position: 28
keywords: 
  - オープンソースのベクトルデータベース
  - オープンソースのベクトル DB
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - list_segments()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_segments()

この操作は、指定したライフサイクル状態にまだ保持されているコレクションのセグメントを一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_segments(
    collection_name: str,
    states: Optional[Sequence[SegmentState]] = None,
    timeout: Optional[float] = None,
    **kwargs
) -> List[SegmentInfo]
```

**パラメーター:**

- **collection_name** (*str*) -

    対象のコレクションの名前。

- **states** (*Sequence[SegmentState] | None*) -

    デフォルト: `None`

    フィルターに使用するライフサイクル状態。たとえば、SegmentState.Sealed を含むリストです。省略した場合は、保持されているすべての状態が返されます。

- **timeout** (*float | None*) -

    デフォルト: `None`

    この操作のタイムアウト時間（秒）。

**戻り値の型:**

*list[SegmentInfo]*

**戻り値:**

保持されているセグメントを記述する SegmentInfo オブジェクトのリストです。各セグメントの識別子とライフサイクル状態が含まれます。

**パラメーター:**

- **segment_id** (*int*) -

    セグメントの ID。

- **collection_id** (*int*) -

    セグメントが属するコレクションの ID。

- **collection_name** (*str*) -

    セグメントが属するコレクションの名前。

- **num_rows** (*int*) -

    セグメントの行数。

- **is_sorted** (*bool*) -

    セグメント内のデータがソートされているかどうかを示すフラグ。

- **state** (*SegmentState*) -

    セグメントのライフサイクル状態。

- **level** (*SegmentLevel*) -

    セグメントのストレージレベル。

- **storage_version** (*int*) -

    セグメントのストレージバージョン。

- **partition_id** (*int*) -

    セグメントが属するパーティションの ID。PyMilvus v3.0.2 以降で使用できます。

- **insert_channel** (*str*) -

    セグメントデータの書き込み先となった挿入チャネル。PyMilvus v3.0.2 以降で使用できます。

- **compaction_from** (*list[int]*) -

    このセグメントの Compaction 元となったセグメントの ID。PyMilvus v3.0.2 以降で使用できます。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient, SegmentState

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
segments = client.list_segments(
    collection_name="docs",
    states=[SegmentState.Sealed],
)
for s in segments:
    print(
        s.segment_id,
        s.state,
    )
```
