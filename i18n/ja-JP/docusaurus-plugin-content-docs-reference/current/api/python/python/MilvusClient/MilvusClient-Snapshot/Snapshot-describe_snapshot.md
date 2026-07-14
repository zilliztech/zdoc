---
title: "describe_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-describe_snapshot
sidebar_label: "describe_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ソース collection、partition 名、作成タイムスタンプ、ストレージの場所など、特定の snapshot に関する詳細なメタデータを取得します。 | Python | MilvusClient"
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

この操作は、ソース collection、partition 名、作成タイムスタンプ、ストレージの場所など、特定の snapshot に関する詳細なメタデータを取得します。

## リクエスト構文\{#request-syntax}

```python
describe_snapshot(
    snapshot_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> SnapshotInfo
```

**パラメーター:**

- **snapshot_name** (*str*) -
**[REQUIRED]**
記述対象の snapshot の名前。

- **timeout** (*Optional[float]*) -
RPC に許可される秒単位のオプションの時間。

**戻り値の型:**

*SnapshotInfo*

**戻り値:**

以下のフィールドを含む snapshot メタデータの dataclass:

```python
{
    'name': str,
    'description': str,
    'collection_name': str,
    'partition_names': List[str],
    'create_ts': int,
    's3_location': str
}
```

**パラメーター:**

- **name** (*str*) - 

    snapshot 名。

- **description** (*str*) - 

    snapshot の説明。

- **collection_name** (*str*) - 

    ソース collection 名。

- **partition_names** (*List[str]*) - 

    snapshot に含まれる partition 名のリスト。

- **create_ts** (*int*) - 

    ミリ秒単位の作成タイムスタンプ。

- **s3_location** (*str*) - 

    snapshot データの S3 ストレージの場所。

**例外:**

- **MilvusException**

    snapshot が存在しないか、操作が失敗した場合。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

info = client.describe_snapshot(snapshot_name="backup_20260418")
print(f"Snapshot: {info.name}")
print(f"Collection: {info.collection_name}")
print(f"Partitions: {info.partition_names}")
print(f"Created at: {info.create_ts}")
print(f"S3 location: {info.s3_location}")
```
