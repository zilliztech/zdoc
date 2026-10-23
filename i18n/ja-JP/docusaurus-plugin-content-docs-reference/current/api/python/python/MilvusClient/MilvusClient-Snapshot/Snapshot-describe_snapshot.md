---
title: "describe_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-describe_snapshot
sidebar_label: "describe_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のスナップショットに関する詳細なメタデータを取得します。これには、ソースコレクション、パーティション名、作成タイムスタンプ、ストレージの場所が含まれます。 | Python | MilvusClient"
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
  - cloud
  - describe_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_snapshot()

この操作は、特定のスナップショットに関する詳細なメタデータを取得します。これには、ソースコレクション、パーティション名、作成タイムスタンプ、ストレージの場所が含まれます。

## Request Syntax\{#request-syntax}

```python
describe_snapshot(
```

**PARAMETERS:**

- **snapshot_name** (*str*) -

    **[必須]**

    詳細を取得するスナップショットの名前です。

- **collection_name** (*str*) -

    **[必須]**

    スナップショットが属するコレクションの名前です。

- **db_name** (*str*) -

    コレクションを格納するデータベースの名前です。このパラメーターを空のままにすると、デフォルトのデータベースが使用されます。

- **timeout** (*Optional[float]*) -

    RPC に許可する時間を秒単位で指定するオプションです。

**RETURN TYPE:**

*SnapshotInfo*

**RETURNS:**

次のフィールドを含む、スナップショットメタデータを保持するデータクラスです。

**EXCEPTIONS:**

- **MilvusException**

    スナップショットが存在しない場合、または操作が失敗した場合です。スナップショットが存在しない場合、または操作が失敗した場合です。

## Examples\{#examples}

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
