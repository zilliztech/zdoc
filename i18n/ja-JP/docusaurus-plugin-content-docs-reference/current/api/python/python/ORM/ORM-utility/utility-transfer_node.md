---
title: "transfer_node() | Python | ORM"
slug: /python/python/utility-transfer_node
sidebar_label: "transfer_node()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定数のクエリノードをソースリソースグループからターゲットリソースグループに移動します。 | Python | ORM"
type: docx
token: QHcpd1aJzo5aYbxJtMXc58een4f
sidebar_position: 39
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - zilliz
  - zilliz cloud
  - クラウド
  - transfer_node()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# transfer_node()

この操作は、特定数のクエリノードをソースリソースグループからターゲットリソースグループに移動します。

## リクエスト構文\{#request-syntax}

```python
transfer_node(
    source_group: str,
    target_group: str,
    num_nodes: int,
    using: str = "default",
    timeout: Optional[float] = None,
) -> None
```

**パラメーター:**

- **source_group** (*str*) -

    **[必須]**

    クエリノードの移動元となるソースリソースグループの名前。

    存在しないリソースグループをこれに設定すると、**MilvusException** が発生します。

- **target_group** (*str*) -

    **[必須]**

    クエリノードの移動先となるターゲットリソースグループの名前。

    存在しないリソースグループをこれに設定すると、**MilvusException** が発生します。

- **num_nodes** (*int*) -

    **[必須]**

    ソースリソースグループとターゲットリソースグループ間で移動するクエリノードの数。

    現在の Zilliz Cloud クラスターに存在する実際のクエリノード数より大きい整数をこれに設定すると、**MilvusException** が発生します。

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが返るか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

なし。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

**例:**

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get the number of query nodes in the source resource group
res = utility.describe_resource_group(name="__default_resource_group")
res.num_available_node # 1

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Get the number of query nodes in the target resource group
res = utility.describe_resource_group(name="rg_01")
res.num_available_node # 0

# Move the node from the default resource group to the new one
utility.transfer_node(
    source_group="__default_resource_group",
    target_group="rg_01",
    num_nodes=1
)

# Get the number of query nodes in the source and target resource groups
res = utility.describe_resource_group(name="__default_resource_group")
res.num_available_node # 0

res = utility.describe_resource_group(name="rg_01")
res.num_available_node # 1
```

## 関連操作\{#related-operations}

次の操作は `transfer_node()` に関連しています。

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_replica()](./utility-transfer_replica)

