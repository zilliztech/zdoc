---
title: "pin_snapshot_data() | Python | MilvusClient"
slug: /python/python/Snapshot-pin_snapshot_data
sidebar_label: "pin_snapshot_data()"
beta: PRIVATE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ファイルをエクスポートまたはバックアップしている間にガベージコレクションによって削除されないよう、一定期間 snapshot データを固定します。 | Python | MilvusClient"
type: docx
token: NqWDdRxKYoi6uTxHaYEcafx9nGc
sidebar_position: 7
keywords: 
  - milvus
  - Zilliz
  - milvus ベクトルデータベース
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - pin_snapshot_data()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# pin_snapshot_data()

この操作は、ファイルをエクスポートまたはバックアップしている間にガベージコレクションによって削除されないよう、一定期間 snapshot データを固定します。

## リクエスト構文\{#request-syntax}

```python
pin_snapshot_data(
```

**パラメーター:**

- **snapshot_name** (*str*) -

    固定する snapshot 名。

- **collection_name** (*str*) -

    snapshot を所有するコレクション。

- **db_name** (*str*) -

    データベース名。空のままにすると、アクティブなデータベースが使用されます。

- **ttl_seconds** (*int*) -

    固定の有効期間を秒単位で指定するオプションです。0 を指定すると、サーバーのデフォルト TTL が使用されます。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間（秒）。

- **kwargs** (*dict*) -

    基盤となる RPC に渡される追加のリクエストオプション。

**戻り値の型:**

*int*

**戻り値:**

この固定を unpin_snapshot_data() で解放するために使用する pin_id です。

**例外:**

- **MilvusException**

    snapshot を固定できない場合、またはリクエストが失敗した場合にスローされます。snapshot を固定できない場合、またはリクエストが失敗した場合にスローされます。

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
    ttl_seconds=3600,
)

# Copy snapshot data to external storage here.

client.unpin_snapshot_data(pin_id=pin_id)
```
