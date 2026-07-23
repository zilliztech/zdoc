---
title: "load_balance() | Python | ORM"
slug: /python/python/utility-load_balance
sidebar_label: "load_balance()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection に対して 2 つの query node 間にロードバランシンググループを設定します。 | Python | ORM"
type: docx
token: XYNMdg3Vpo3SE7xTRVqcJNvrn0d
sidebar_position: 32
keywords: 
  - ベクトル化
  - k 最近傍アルゴリズム
  - ANNS
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - load_balance()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load_balance()

この操作は、特定の collection に対して 2 つの query node 間にロードバランシンググループを設定します。

## リクエスト構文\{#request-syntax}

```python
load_balance(
    collection_name: str,
    src_node_id: int,
    dst_node_ids: list[int] | None,
    sealed_segment_ids: list[int] | None,
    timeout: float | None,
    using: str = "default",
)
```

**パラメータ:**

- **collection_name** (*str*) -<br/>
  **[必須]**

    ロードバランシンググループを設定する既存の collection の名前。

- **src_node_id** (*int*) -<br/>
  **[必須]**

    collection が現在使用している query node の ID。

- **dst_node_ids** (*list[int]*) -

    ロードバランシンググループに追加する query node の ID。

- **sealed_segment_ids** (*list[int]*) -

    ロードバランシング対象の sealed segment の ID。

- **timeout** (*float*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が返された時点、またはエラーが発生した時点でこの操作はタイムアウトします。

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

**戻り値の型:**

*NoneType*

**戻り値:**
None

**例外:**

該当なし

## 例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

utility.load_balance(
    collection_name="test_collection",
    src_node_id=446781855410073001,
    dst_node_ids=[478798283048914039],
    sealed_segment_ids=None,
)
```

