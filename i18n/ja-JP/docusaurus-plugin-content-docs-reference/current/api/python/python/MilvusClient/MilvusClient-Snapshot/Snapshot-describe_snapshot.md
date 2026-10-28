---
title: "describe_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-describe_snapshot
sidebar_label: "describe_snapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、特定のスナップショットに関する詳細なメタデータ（ソースコレクション、パーティション名、作成タイムスタンプ、保存場所など）を取得します。 | Python | MilvusClient"
type: docx
token: GF0yd9S4RoImivxbIlPcicEynQb
sidebar_position: 2
keywords: 
  - 埋め込みモデル
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - zilliz
  - zilliz cloud
  - クラウド
  - describe_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_snapshot()

この操作では、特定のスナップショットに関する詳細なメタデータ（ソースコレクション、パーティション名、作成タイムスタンプ、保存場所など）を取得します。

## リクエスト構文\{#request-syntax}

```python
describe_snapshot(
```

**パラメーター：**

- **snapshot_name** (*str*) -

    **[必須]**

    説明するスナップショットの名前です。

- **collection_name** (*str*) -

    **[必須]**

    スナップショットが属するコレクションの名前です。

- **db_name** (*str*) -

    コレクションを格納するデータベースの名前です。このパラメーターを空のままにすると、デフォルトのデータベースが使用されます。

- **timeout** (*Optional[float]*) -

    RPC に許容する時間を秒単位で指定するオプションです。

**戻り値の型：**

*SnapshotInfo*

**戻り値：**

次のフィールドを含むスナップショットメタデータを格納したデータクラスです。

**例外：**

- **MilvusException**

    スナップショットが存在しない場合、または操作に失敗した場合に発生します。スナップショットが存在しない場合、または操作に失敗した場合に発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

info = client.describe_snapshot(
    snapshot_name="backup_20260418",
    collection_name="my_collection",
)
print(f"Snapshot: {info.name}")
print(f"Collection: {info.collection_name}")
print(f"Partitions: {info.partition_names}")
print(f"Created at: {info.create_ts}")
print(f"S3 location: {info.s3_location}")
```
