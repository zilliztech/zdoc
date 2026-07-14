---
title: "drop_collection() | Python | ORM"
slug: /python/python/utility-drop_collection
sidebar_label: "drop_collection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は特定のコレクションを削除します。 | Python | ORM"
type: docx
token: FHcYdN4apoI5TIx0LxScISvtn0f
sidebar_position: 10
keywords: 
  - ベクターストア
  - オープンソースベクターデータベース
  - ベクターインデックス
  - オープンソースベクターデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - drop_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection()

この操作は特定のコレクションを削除します。

## リクエスト構文\{#request-syntax}

```python
drop_collection(
    collection_name: str,
    timeout: float | None,
    using: str = "default",
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    削除するコレクションの名前。

- **timeout** (*float*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、応答が到着した時点またはエラーが発生した時点でこの操作はタイムアウトします。

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

該当なし

### 例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Drop a specific collection
utility.drop_collection(
    collection_name="test_collection",
)
```

## 関連する操作\{#related-operations}

以下の操作は `drop_collection()` メソッドに関連しています。

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

