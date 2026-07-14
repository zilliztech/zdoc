---
title: "delete() | Python | ORM"
slug: /python/python/Partition-delete
sidebar_label: "delete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ブール式を使用してパーティションからエンティティを削除します。 | Python | ORM"
type: docx
token: V9BidASNqoWYrmxo11ecuN99neg
sidebar_position: 1
keywords: 
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# delete()

この操作は、ブール式を使用してパーティションからエンティティを削除します。

<Admonition type="info" icon="📘" title="注記">

**[Collection](./ORM-Collection)** オブジェクトの **delete()** メソッドで **partition_name** パラメータを使用することは、**[Partition](./ORM-Partition)** オブジェクトの **delete()** メソッドを使用することと同等です。

</Admonition>

## Request Syntax\{#request-syntax}

```python
delete(
    expr: str, 
    timeout: float | None
)
```

**PARAMETERS:**

- **expr** (*string*) -

    **[REQUIRED]** 

    削除するエンティティを絞り込むためのブール式。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*MutationResult*

**RETURNS:**

以下のフィールドを含む **MutationResult** オブジェクト:

- **insert_count** (*int*)

    挿入されたエンティティ数。

- **delete_count** (*int*)

    削除されたエンティティ数。

- **upsert_count** (*int*)

    upsert されたエンティティ数。

- **succ_count** (*int*)

    この操作中に成功した実行の数。

- **succ_index** (*list*)

    0 から始まるインデックス番号のリストで、それぞれが成功した操作を示します。

- **err_count** (*int*)

    この操作中に失敗した実行の数。

- **err_index** (*list*)

    0 から始まるインデックス番号のリストで、それぞれが失敗した操作を示します。

- **primary_keys** (*list*)

    挿入されたエンティティの主キーのリスト。

- **timestamp** (*int*)

    この操作が完了した時点のタイムスタンプ。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に発生します。

## Examples\{#examples}

```python
from pymilvus import Collection, Partition, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

partition = Partition(
    collection=collection,
    name="partition_a",
)

# Insert a list of columns
partition.insert(
    data=[
        [0,1,2,3,4],                         # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

# Delete two entities
res = partition.delete("id in [ 0, 1 ]")
```

## Related operations\{#related-operations}

次の操作は `delete()` に関連しています。

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

