---
title: "has_partition() | Python | ORM"
slug: /python/python/Collection-has_partition
sidebar_label: "has_partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された partition が現在の collection に存在するかどうかを確認します。 | Python | ORM"
type: docx
token: QsOsda2lRoJP32xNSLWcbgMOnKI
sidebar_position: 16
keywords: 
  - milvus open source
  - Milvus はどのように動作するか
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - has_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_partition()

この操作は、指定された partition が現在の collection に存在するかどうかを確認します。

## Request Syntax\{#request-syntax}

```python
has_partition(
    partition_name: str, 
    timeout: float | None,
)
```

**PARAMETERS:**

- **partition_name** (*str*) -

    ドロップする partition の名前。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*bool*

**RETURNS:**

現在の collection が指定された partition を持っているかどうかを示すブール値

**EXCEPTIONS:**

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
partition = collection.create_partition("test_partition")

# Check whether the partition exists
collection.has_partition("test_partition") # True

# Drop the partition
collection.drop_partition("test_partition")

# Check whether the partition exists
collection.has_partition("test_partition") # False
```

## 関連する操作\{#related-operations}

以下の操作は `has_collection()` に関連しています。

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [create_partition()](./Collection-create_partition)

- [partition()](./Collection-partition)

- [drop_partition()](./Collection-drop_partition)

