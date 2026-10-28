---
title: "list_snapshots() | Python | MilvusClient"
slug: /python/python/Snapshot-list_snapshots
sidebar_label: "list_snapshots()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、すべてのスナップショット名を一覧表示します。オプションでコレクション名を指定してフィルタリングし、特定のコレクションに属するスナップショットを一覧表示できます。 | Python | MilvusClient"
type: docx
token: WgmLdM6nUogd7LxGtmfc5dBKnku
sidebar_position: 6
keywords: 
  - milvus ベクトルデータベース
  - milvus データベース
  - milvus ベクトルデータベース
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - クラウド
  - list_snapshots()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_snapshots()

この操作では、すべてのスナップショット名を一覧表示します。オプションでコレクション名を指定してフィルタリングし、特定のコレクションに属するスナップショットを一覧表示できます。

## リクエスト構文\{#request-syntax}

```python
list_snapshots(
```

**パラメーター：**

- **collection_name** (*str*) -

    スナップショットをフィルタリングするためのオプションのコレクション名です。空の場合、すべてのスナップショットが一覧表示されます。

- **db_name** (*str*) -

    スナップショットをフィルタリングするためのオプションのデータベース名です。空の場合、デフォルトのデータベースが使用されます。

- **timeout** (*Optional[float]*) -

    RPC の実行を許可するオプションの時間（秒）です。

**戻り値の型：**

*List[str]*

**戻り値：**

スナップショット名のリストです。

**例外：**

- **MilvusException**

    操作が失敗した場合に発生します。操作が失敗した場合に発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# List all snapshots for a specific collection
snapshots = client.list_snapshots(collection_name="my_collection")
print(snapshots)
# ['backup_20260401', 'backup_20260418']

# List snapshots for another collection
all_snapshots = client.list_snapshots(collection_name="my_other_collection")
```
