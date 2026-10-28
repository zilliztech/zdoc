---
title: "unpin_snapshot_data() | Python | MilvusClient"
slug: /python/python/Snapshot-unpin_snapshot_data
sidebar_label: "unpin_snapshot_data()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、`pinsnapshotdata()` で作成されたスナップショットピンを解放し、通常のスナップショットデータのガベージコレクションを再開できるようにします。 | Python | MilvusClient"
type: docx
token: RSOkdriHRoRd8ixyVZOch1l9nDd
sidebar_position: 9
keywords: 
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - 異常検知
  - zilliz
  - zilliz cloud
  - クラウド
  - unpin_snapshot_data()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# unpin_snapshot_data()

この操作は、`pin_snapshot_data()` で作成されたスナップショットピンを解放し、通常のスナップショットデータのガベージコレクションを再開できるようにします。

## リクエスト構文\{#request-syntax}

```python
unpin_snapshot_data(
```

**パラメーター:**

- **pin_id** (*int*) -

    pin_snapshot_data() によって返されるピン ID です。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間（秒）です。

- **kwargs** (*dict*) -

    基盤となる RPC に渡される追加のリクエストオプションです。

**戻り値の型:**

*NoneType*

**戻り値:**

この操作はデータを返しません。

**例外:**

- **MilvusException**

    ピンが存在しない場合、すでに有効期限が切れている場合、またはリクエストが失敗した場合に発生します。ピンが存在しない場合、すでに有効期限が切れている場合、またはリクエストが失敗した場合に発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

pin_id = client.pin_snapshot_data(
    snapshot_name="backup_20260509",
    collection_name="products",
)

client.unpin_snapshot_data(pin_id=pin_id)
```
