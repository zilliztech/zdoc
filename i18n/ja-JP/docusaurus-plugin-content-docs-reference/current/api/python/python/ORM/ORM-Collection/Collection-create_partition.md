---
title: "create_partition() | Python | ORM"
slug: /python/python/Collection-create_partition
sidebar_label: "create_partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、対象の collection に partition を作成します。 | Python | ORM"
type: docx
token: Sh7HdgJOIoJipXx5AoNcicjMnyd
sidebar_position: 5
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - create_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_partition()

この操作は、対象の collection に partition を作成します。

## リクエスト構文\{#request-syntax}

```python
create_partition(
    partition_name: str, 
    description: str | None, 
)
```

**パラメーター:**

- **partition_name** (*string*)

    **[必須]**

    作成する partition の名前です。

- **description** (*string*)

    この partition の説明です。

**戻り値の型:**

*[Partition](./ORM-Partition)*

**戻り値:**

Partition オブジェクト。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

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
partition = collection.create_partition(partition_name="test_partition")

# Output
# {"name":"test_partition","collection_name":"test_collection","description":""}
```

## 関連操作\{#related-operations}

以下の操作は `create_partition()` に関連しています。

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [partition()](./Collection-partition)

- [drop_partition()](./Collection-drop_partition)

- [has_partition()](./Collection-has_partition)

