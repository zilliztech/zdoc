---
title: "get_replicas() | Python | ORM"
slug: /python/python/Collection-get_replicas
sidebar_label: "get_replicas()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在ロードされている replica に関する情報を取得します。 | Python | ORM"
type: docx
token: BQKPdDd5xo8OPgxoXorcMxk0nVb
sidebar_position: 14
keywords: 
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - get_replicas()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_replicas()

この操作は、現在ロードされている replica に関する情報を取得します。

## Request Syntax\{#request-syntax}

```python
get_replicas(
    timeout: float | None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*Replica*

**RETURNS:**

以下のフィールドを含む **Replica** オブジェクトです。

- **groups** (*list*)

    replica group のリストです。各 **Group** オブジェクトには以下のフィールドが含まれます。

    - **id** (*int*)

        group ID です。

    - **group_nodes** (*tuple*)

        関与する query node の ID を含むタプルです。

    - **resource_group** (*str*)

        上記の query node が属する resource group の名前です。

    - **shards** (*list*)  

        以下のフィールドを含む **Shard** オブジェクトのリストです。

        - **channel_name** (*str*)

        - **shard_leader** (*int*)

        - **shard_nodes** (*set*)

<Admonition type="info" icon="📘" title="Note">

replica とは何ですか？

replica を使用すると、Zilliz Cloud は同じ segment を複数の query node にロードできます。ある query node が障害を起こした場合、または別の検索リクエストが到着したときに現在の検索リクエストでビジー状態である場合、システムは同じ segment のレプリケーションを持つアイドル状態の query node に新しいリクエストを送信できます。 

replica は replica group として編成されます。各 replica group には [shard](https://milvus.io/docs/v2.1.x/glossary.md#Sharding) replica が含まれます。各 shard replica には、shard 内の growing および sealed [segments](https://milvus.io/docs/v2.1.x/glossary.md#Segment) に対応する streaming replica と historical replica があります。

Shard は、Zilliz Cloud cluster の並列計算能力を最大限に活用するために、複数の node 間で分散データ書き込み操作を行うための DML channel と見なすことができます。

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Get the currently loaded replicas
collection.get_replicas()
```

## Related operations\{#related-operations}

以下の操作は `get_replicas()` に関連しています。

- [describe()](./Collection-describe)

- [drop()](./Collection-drop)

- [flush()](./Collection-flush)

- [set_properties()](./Collection-set_properties)

