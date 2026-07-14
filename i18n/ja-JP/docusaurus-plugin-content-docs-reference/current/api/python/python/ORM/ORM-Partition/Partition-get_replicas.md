---
title: "get_replicas() | Python | ORM"
slug: /python/python/Partition-get_replicas
sidebar_label: "get_replicas()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在ロードされている replica に関する情報を取得します。 | Python | ORM"
type: docx
token: YKwldu59qosZBsxdRdSc0l9Hnoe
sidebar_position: 4
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
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

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*Replica*

**RETURNS:**

以下のフィールドを含む **Replica** オブジェクト:

- **groups** (*list*)

    replica group のリスト。各 **Group** オブジェクトには以下のフィールドが含まれます:

    - **id** (*int*)

        group ID。

    - **group_nodes** (*tuple*)

        関与する query node の ID を含むタプル。

    - **resource_group** (*str*)

        上記の query node が属する resource group の名前。

    - **shards** (*list*)  

        以下のフィールドを含む **Shard** オブジェクトのリスト:

        - **channel_name** (*str*)

        - **shard_leader** (*int*)

        - **shard_nodes** (*set*)

<Admonition type="info" icon="📘" title="注記">

replica とは何ですか？

replica を使用すると、Zilliz Cloud は同じ segment を複数の query node にロードできます。ある query node が故障している場合や、別の検索リクエストが到着した際に現在の検索リクエストでビジー状態の場合、システムは同じ segment の複製を持つアイドル状態の query node に新しいリクエストを送信できます。 

replica は replica group として編成されます。各 replica group には [shard](https://milvus.io/docs/v2.1.x/glossary.md#Sharding) replica が含まれます。各 shard replica には、shard 内の growing および sealed [segments](https://milvus.io/docs/v2.1.x/glossary.md#Segment) に対応する streaming replica と historical replica があります。

shard は、複数ノード間で分散データ書き込み操作を行うための DML channel と見なすことができ、Zilliz Cloud cluster の並列計算能力を最大限に活用できます。

</Admonition>

**EXCEPTIONS:**

なし

## Examples\{#examples}

```python
from pymilvus import Collection, Partition

collection = Collection(name="test_collection")

# Get an existing partition
partition = Partition(collection, name="test_partition")

# Get the information about the current loaded replicas
partition.get_replicas()
```

## Related operations\{#related-operations}

以下の操作は `get_replicas()` に関連しています:

- [drop()](./Partition-drop)

- [load()](./Partition-load)

- [release()](./Partition-release)

