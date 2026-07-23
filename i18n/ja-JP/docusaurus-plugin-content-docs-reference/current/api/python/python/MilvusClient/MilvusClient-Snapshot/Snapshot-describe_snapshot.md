---
title: "describe_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-describe_snapshot
sidebar_label: "describe_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ソース collection、partition 名、作成タイムスタンプ、保存先を含む、特定のスナップショットに関する詳細なメタデータを取得します。 | Python | MilvusClient"
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

この操作は、ソース collection、partition 名、作成タイムスタンプ、保存先を含む、特定のスナップショットに関する詳細なメタデータを取得します。

## リクエスト構文\{#request-syntax}

```python
describe_snapshot(
    snapshot_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> SnapshotInfo
```

**パラメータ:**

- **snapshot_name** (*str*) -<br/>
  **[必須]**<br/>
  説明対象のスナップショット名。

- **timeout** (*Optional[float]*) -<br/>
  RPC に許可される時間を秒単位で指定するオプションの継続時間。

**戻り値の型:**

*SnapshotInfo*

**戻り値:**

以下のフィールドを持つ、スナップショットのメタデータを含む dataclass:

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

**パラメータ:**

- **name** (*str*) - 

    スナップショット名。

- **description** (*str*) - 

    スナップショットの説明。

- **collection_name** (*str*) - 

    ソース collection 名。

- **partition_names** (*List[str]*) - 

    スナップショットに含まれる partition 名のリスト。

- **create_ts** (*int*) - 

    ミリ秒単位の作成タイムスタンプ。

- **s3_location** (*str*) - 

    スナップショットデータの S3 保存先。

**例外:**

- **MilvusException**

    スナップショットが存在しない場合、または操作が失敗した場合。

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
