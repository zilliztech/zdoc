---
title: "drop() | Python | ORM"
slug: /python/python/Partition-drop
sidebar_label: "drop()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在のパーティションを削除します。 | Python | ORM"
type: docx
token: D3sndK8DgoqDkUxaNGcctwcSnuE
sidebar_position: 2
keywords: 
  - vector db の比較
  - openai vector db
  - 自然言語処理データベース
  - 安価な vector データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - drop()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop()

この操作は現在の [パーティション](./ORM-Partition) を削除します。 

## Request Syntax\{#request-syntax}

```python
drop(
    timeout: float | None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に発生します。

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

# Create a partition
partition = Partition(
    collection=collection,
    name="test_partition"
)

# Drop the partition
partition.drop()
```

## Related operations\{#related-operations}

以下の操作は `drop()` に関連しています。

- [get_replicas()](./Partition-get_replicas)

- [load()](./Partition-load)

- [release()](./Partition-release)

