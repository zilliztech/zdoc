---
title: "drop_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-drop_snapshot
sidebar_label: "drop_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はスナップショットを完全に削除します。削除されると、スナップショットデータは復元できません。 | Python | MilvusClient"
type: docx
token: UknCdYmtRoVIZ9xWcLnc02b0ndZ
sidebar_position: 3
keywords: 
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - ベクトル類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - drop_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_snapshot()

この操作はスナップショットを完全に削除します。削除されると、スナップショットデータは復元できません。

## Request Syntax\{#request-syntax}

```python
drop_snapshot(
```

**PARAMETERS:**

- **snapshot_name** (*str*) -

    **[必須]**

    削除するスナップショットの名前です。

- **collection_name** (*str*) -

    **[必須]**

    スナップショットが属するコレクションの名前です。

- **db_name** (*str*) -

    コレクションを格納するデータベースの名前です。このパラメーターを空のままにすると、デフォルトのデータベースが使用されます。

- **timeout** (*Optional[float]*) -

    RPC に許可する秒単位の任意の時間です。

**RETURN TYPE:**

*None*

**戻り値:**

なし。

**EXCEPTIONS:**

- **MilvusException**

    スナップショットが存在しない場合、または操作が失敗した場合。スナップショットが存在しない場合、または操作が失敗した場合。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.drop_snapshot(
    snapshot_name="backup_20260401",
    collection_name="my_collection",
)
```
