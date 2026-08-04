---
title: "describe_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-describe_snapshot
sidebar_label: "describe_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ソース collection、partition 名、作成タイムスタンプ、保存場所を含む、特定の snapshot に関する詳細なメタデータを取得します。 | Python | MilvusClient"
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

この操作は、ソース collection、partition 名、作成タイムスタンプ、保存場所を含む、特定の snapshot に関する詳細なメタデータを取得します。

## Request Syntax\{#request-syntax}

```python
describe_snapshot(
    snapshot_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> SnapshotInfo
```

**PARAMETERS:**

- **snapshot_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  説明対象の snapshot の名前。

- **timeout** (*Optional[float]*) -<br/>
  RPC に許可する秒単位の任意の時間。

**RETURN TYPE:**

*SnapshotInfo*

**RETURNS:**

以下のフィールドを持つ snapshot メタデータを含むデータクラス:

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

**PARAMETERS:**

- **name** (*str*) - 

    snapshot 名。

- **description** (*str*) - 

    snapshot の説明。

- **collection_name** (*str*) - 

    ソース collection 名。

- **partition_names** (*List[str]*) - 

    snapshot に含まれる partition 名の一覧。

- **create_ts** (*int*) - 

    ミリ秒単位の作成タイムスタンプ。

- **s3_location** (*str*) - 

    snapshot データの S3 保存場所。

**EXCEPTIONS:**

- **MilvusException**

    snapshot が存在しない場合、または操作が失敗した場合。

## Examples\{#examples}

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
