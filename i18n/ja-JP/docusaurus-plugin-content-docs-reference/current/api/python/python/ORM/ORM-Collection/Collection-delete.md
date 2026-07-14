---
title: "delete() | Python | ORM"
slug: /python/python/Collection-delete
sidebar_label: "delete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ブール式を使用してエンティティを削除します。 | Python | ORM"
type: docx
token: TJMVdi4U2oBFnAxO95jctzVAnzg
sidebar_position: 6
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
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

この操作は、ブール式を使用してエンティティを削除します。

## リクエスト構文\{#request-syntax}

```python
delete(
    expr: str, 
    partition_name: str | None, 
    timeout: float | None
)
```

**パラメータ:**

- **expr** (*string*) -

    **[必須]** 

    削除するエンティティをフィルタリングするためのブール式。

- **partition_name** (*string*) -

    一致したエンティティを削除する partition の名前。

    partition が指定されている場合、その partition 内のエンティティのみがフィルタリング対象になります。それ以外の場合、collection 内のすべてのエンティティが対象になります。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、応答が返されるか、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*MutationResult*

**戻り値:**

以下のフィールドを含む **MutationResult** オブジェクト:

- **insert_count** (*int*)

    挿入されたエンティティ数。

- **delete_count** (*int*)

    削除されたエンティティ数。

- **upsert_count** (*int*)

    upsert されたエンティティ数。

- **succ_count** (*int*)

    この操作中に正常に実行された回数。

- **succ_index** (*list*)

    0 から始まるインデックス番号のリストで、それぞれが成功した操作を示します。

- **err_count** (*int*)

    この操作中に失敗した実行回数。

- **err_index** (*list*)

    0 から始まるインデックス番号のリストで、それぞれが失敗した操作を示します。

- **primary_keys** (*list*)

    挿入されたエンティティの主キーのリスト。

- **timestamp** (*int*)

    この操作が完了した時点のタイムスタンプ。

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

# Insert a list of columns
collection.insert(
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
res = collection.delete("id in [ 0, 1 ]")
```

## 関連操作\{#related-operations}

以下の操作は `delete()` に関連しています:

- [insert()](./Collection-insert)

- [search()](./Collection-search)

- [search_iterator()](./Collection-search_iterator)

- [query()](./Collection-query)

- [query_iterator()](./Collection-query_iterator)

- [upsert()](./Collection-upsert)

