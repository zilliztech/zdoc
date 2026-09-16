---
title: "transfer_replica() | Python | ORM"
slug: /python/python/utility-transfer_replica
sidebar_label: "transfer_replica()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された数のレプリカをリソースグループ間で移動します。 | Python | ORM"
type: docx
token: SuePdciB0o4du5xtpIhcMVyYnPb
sidebar_position: 40
keywords: 
  - ANNS
  - ベクトル検索
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - transfer_replica()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# transfer_replica()

この操作は、リソースグループ間で指定された数のレプリカを移動します。

## リクエスト構文\{#request-syntax}

```python
transfer_replica(
    source_group: str,
    target_group: str,
    collection_name: str,
    num_replicas: int,
    using: str = "default",
    timeout: float | None,
)
```

**パラメーター:**

- **source_group** (*str*) -

    **[必須]**

    クエリノードの移動元となるソースリソースグループの名前です。

    存在しないリソースグループをこれに設定すると、**MilvusException** が発生します。

- **target_group** (*str*) -

    **[必須]**

    クエリノードの移動先となるソースリソースグループの名前です。

    存在しないリソースグループをこれに設定すると、**MilvusException** が発生します。

- **num_replicas** (*int*) -

    **[必須]**

    ソースリソースグループとターゲットリソースグループ間で移動するレプリカの数です。

    <Admonition type="info" title="Note">

    レプリカとは何ですか？
    
        レプリカを使用すると、Zilliz Cloud は同じセグメントを複数のクエリノードにロードできます。あるクエリノードが障害を起こした場合、または別の検索リクエストが到着したときに現在の検索リクエストでビジー状態である場合、システムは同じセグメントのレプリカを持つアイドル状態のクエリノードに新しいリクエストを送信できます。 
    
        レプリカはレプリカグループとして編成されます。各レプリカグループには [shard](https://milvus.io/docs/v2.1.x/glossary.md#Sharding) レプリカが含まれます。各シャードレプリカには、シャード内の成長中およびシール済みの [segments](https://milvus.io/docs/v2.1.x/glossary.md#Segment) に対応するストリーミングレプリカとヒストリカルレプリカがあります。
    
        シャードは、複数のノード間で分散データ書き込み操作を行うための DML チャネルと見なすことができ、Zilliz Cloud クラスターの並列計算能力を最大限に活用できます。

    </Admonition>

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

なし。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

**例:**

```python
from pymilvus import (
    connections, 
    Collection, 
    CollectionSchema, 
    FieldSchema, 
    DataType, 
    utility,
)

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a collection
collection = Collection(
    name="test_collection",
    schema=CollectionSchema([
        FieldSchema("id", DataType.INT64, is_primary=True),
        FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
    ])
)

# Get the currently loaded replicas
collection.get_replicas()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Transfer replicas between resource groups
utility.transfer_node(
    source_group="__default_resource_group",
    target_group="rg_01",
    num_nodes=1
)
```

## 関連操作\{#related-operations}

次の操作は `transfer_replica()` に関連しています。

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)
