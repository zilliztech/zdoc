---
title: "unpin_snapshot_data() | Python | MilvusClient"
slug: /python/python/Snapshot-unpin_snapshot_data
sidebar_label: "unpin_snapshot_data()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`pinsnapshotdata()` によって作成された snapshot pin を解放し、通常の snapshot data ガベージコレクションを再開できるようにする操作です。 | Python | MilvusClient"
type: docx
token: RSOkdriHRoRd8ixyVZOch1l9nDd
sidebar_position: 9
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - unpin_snapshot_data()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# unpin_snapshot_data()

この操作は、`pin_snapshot_data()` によって作成された snapshot pin を解放し、通常の snapshot data ガベージコレクションを再開できるようにします。

## リクエスト構文\{#request-syntax}

```python
unpin_snapshot_data(
    self,
    pin_id: int,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**パラメーター:**

- **pin_id** (*int*) -

    `pin_snapshot_data()` によって返される pin ID。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト（秒単位）。

- **kwargs** (*dict*) -

    基盤となる RPC に渡される追加のリクエストオプション。

**戻り値の型:**

*NoneType*

この操作はデータを返しません。

**例外:**

- **MilvusException**

    pin が存在しない場合、すでに期限切れになっている場合、またはリクエストが失敗した場合に発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

pin_id = client.pin_snapshot_data(
    snapshot_name="backup_20260509",
    collection_name="products",
)

client.unpin_snapshot_data(pin_id=pin_id)
```
