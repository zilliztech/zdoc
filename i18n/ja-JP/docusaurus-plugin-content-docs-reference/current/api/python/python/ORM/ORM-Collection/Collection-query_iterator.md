---
title: "query_iterator() | Python | ORM"
slug: /python/python/Collection-query_iterator
sidebar_label: "query_iterator()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クエリ結果を反復処理するための Python iterator を返します。特に、クエリ結果に大量のデータが含まれる場合に役立ちます。 | Python | ORM"
type: docx
token: LffbdiHhzoHe08xivF9ccmoen5d
sidebar_position: 23
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - query_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query_iterator()

この操作は、クエリ結果を反復処理するための Python iterator を返します。特に、クエリ結果に大量のデータが含まれる場合に役立ちます。

## Request Syntax\{#request-syntax}

```python
query_iterator(
    batch_size: int, 
    limit: int, 
    expr: str | None, 
    output_fields: list[str] | None, 
    partition_names: list[str] | None, 
    timeout: float | None
)
```

**PARAMETERS:**

- **batch_size** (*int*)

    現在の iterator で `next()` を呼び出すたびに返されるエンティティの数。

    デフォルト値は **1000** です。反復ごとに返されるエンティティ数を制御するため、適切な値を設定してください。

- **limit** (*int*)

    返されるエンティティの総数。

    デフォルト値は **-1** で、すべての一致するエンティティが返されることを示します。

- **expr** (*str*)

    一致するエンティティを絞り込むための scalar フィルタリング条件。

    デフォルト値は **None** で、scalar フィルタリングが無視されることを示します。scalar フィルタリング条件の構築については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。

- **output_fields** (*list*)

    返される各エンティティに含めるフィールド名のリスト。

    デフォルト値は **None** です。指定しない場合は、primary フィールドのみが含まれます。

- **partition_names** (*list*)

    partition 名のリスト。

    デフォルト値は **None** です。指定した場合、クエリには指定した partition のみが含まれます。

- **timeout** (*float*)  

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*QueryIterator*

**RETURNS:**

クエリ結果を反復処理するための **QueryIterator**。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

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

# Insert a list of columns
res = collection.insert(
    data=[
        [0,1,2,3,4,5,6,7,8,9],               # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

# Create a query iterator
iterator = collection.query_iterator(
    batch_size=2,
    limit=10,
    expr="id > 3",
    output_fields=["id", "vector"]
)

# Start iterating
while True:
    res = iterator.next()
    
    if not res:
        res.close()
        break
```

## Related operations\{#related-operations}

以下の操作は `query_iterator()` に関連しています。

- [delete()](./Collection-delete)

- [insert()](./Collection-insert)

- [search()](./Collection-search)

- [search_iterator()](./Collection-search_iterator)

- [query()](./Collection-query)

- [upsert()](./Collection-upsert)

