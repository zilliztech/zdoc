---
title: "list_snapshots() | Python | MilvusClient"
slug: /python/python/Snapshot-list_snapshots
sidebar_label: "list_snapshots()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はすべての snapshot 名を一覧表示します。必要に応じて collection 名でフィルタリングし、特定の collection に属する snapshot を一覧表示できます。 | Python | MilvusClient"
type: docx
token: WgmLdM6nUogd7LxGtmfc5dBKnku
sidebar_position: 6
keywords: 
  - milvus ベクトルデータベース
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - list_snapshots()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_snapshots()

この操作はすべての snapshot 名を一覧表示します。必要に応じて collection 名でフィルタリングし、特定の collection に属する snapshot を一覧表示できます。

## リクエスト構文\{#request-syntax}

```python
list_snapshots(
    collection_name: str = "",
    timeout: Optional[float] = None,
    **kwargs
) -> List[str]
```

**パラメータ:**

- **collection_name** (*str*) -
snapshot をフィルタリングするための任意の collection 名です。空の場合、すべての snapshot が一覧表示されます。

- **timeout** (*Optional[float]*) -
RPC に許可する秒単位の任意の時間です。

**戻り値の型:**

*List[str]*

snapshot 名のリストです。

**例外:**

- **MilvusException**

    操作が失敗した場合。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# 特定の collection のすべての snapshot を一覧表示
snapshots = client.list_snapshots(collection_name="my_collection")
print(snapshots)
# ['backup_20260401', 'backup_20260418']

# すべての collection にわたるすべての snapshot を一覧表示
all_snapshots = client.list_snapshots()
```
