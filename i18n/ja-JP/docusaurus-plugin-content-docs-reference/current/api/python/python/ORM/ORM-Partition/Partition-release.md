---
title: "release() | Python | ORM"
slug: /python/python/Partition-release
sidebar_label: "release()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の partition のデータをメモリから解放します。 | Python | ORM"
type: docx
token: ZQ2RdE2AOoH9bfx4k3Sc3Ny0ngb
sidebar_position: 9
keywords: 
  - 機械学習
  - RAG
  - NLP
  - ニューラルネットワーク
  - zilliz
  - zilliz cloud
  - cloud
  - release()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# release()

この操作は、現在の partition のデータをメモリから解放します。

## Request Syntax\{#request-syntax}

```python
release(
    timeout: float | None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に生じます。

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
partition = Partition(collection, name="comedy", description="comedy films")

# Load the partition data
partition.load()

# Release the partition data
partition.release()
```

## Related operations\{#related-operations}

以下の操作は `release()` に関連しています。

- [drop()](./Partition-drop)

- [get_replicas()](./Partition-get_replicas)

- [load()](./Partition-load)

