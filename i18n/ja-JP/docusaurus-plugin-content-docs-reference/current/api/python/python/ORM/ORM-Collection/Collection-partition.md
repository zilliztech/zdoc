---
title: "partition() | Python | ORM"
slug: /python/python/Collection-partition
sidebar_label: "partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の collection 内の指定された partition を取得します。 | Python | ORM"
type: docx
token: SvCrdEJIdosGQYxQZhrc2OAXnpd
sidebar_position: 21
keywords: 
  - ハルシネーション llm
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - zilliz
  - zilliz cloud
  - クラウド
  - partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# partition()

この操作は、現在の collection 内の指定された partition を取得します。

## リクエスト構文\{#request-syntax}

```python
partition(
    partition_name: str
)
```

**PARAMETERS:**

- **partition_name** (*str*) -

    **[REQUIRED]**

    取得する partition の名前。

**RETURN TYPE:**

*Partition* | *NoneType*

**RETURNS:**

**Partition** オブジェクト。現在の collection に指定した名前の partition が存在しない場合は、**None** が返されます。

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
partition = collection.partition(partition_name="test_partition")
```

## 関連操作\{#related-operations}

以下の操作は `partition()` に関連しています。

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [create_partition()](./Collection-create_partition)

- [drop_partition()](./Collection-drop_partition)

- [has_partition()](./Collection-has_partition)

