---
title: "transfer_replica() | Python | ORM"
slug: /python/python/utility-transfer_replica
sidebar_label: "transfer_replica()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、resource group 間で指定された数の replica を移動します。 | Python | ORM"
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

この操作は、resource group 間で指定された数の replica を移動します。

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

**パラメータ:**

- **source_group** (*str*) -

    **[必須]**

    query node の移動元となる source resource group の名前です。

    これを存在しない resource group に設定すると、**MilvusException** が発生します。

- **target_group** (*str*) -

    **[必須]**

    query node の移動先となる source resource group の名前です。

    これを存在しない resource group に設定すると、**MilvusException** が発生します。

- **num_replicas** (*int*) -

    **[必須]**

    source および target resource group 間で移動する replica の数です。

    <Admonition type="info" icon="📘" title="注">

    replica とは何ですか？
    
        replica を使用すると、Zilliz Cloud は同じ segment を複数の query node にロードできます。ある query node が障害を起こした場合、または別の検索リクエストが到着したときに現在の検索リクエストでビジー状態の場合、システムは同じ segment のレプリケーションを持つアイドル状態の query node に新しいリクエストを送信できます。 
    
        replica は replica group として編成されます。各 replica group には [shard](https://milvus.io/docs/v2.1.x/glossary.md#Sharding) replica が含まれます。各 shard replica には、shard 内の増加中およびシール済みの [segments](https://milvus.io/docs/v2.1.x/glossary.md#Segment) に対応する streaming replica と historical replica があります。
    
        shard は、複数ノード間で分散データ書き込み操作を行い、Zilliz Cloud cluster の並列計算能力を最大限に活用するための DML channel と見なすことができます。

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

## 関連する操作\{#related-operations}

次の操作は `transfer_replica()` に関連しています。

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

