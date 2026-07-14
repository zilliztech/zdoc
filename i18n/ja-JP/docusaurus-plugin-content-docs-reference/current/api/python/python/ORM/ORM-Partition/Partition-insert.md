---
title: "insert() | Python | ORM"
slug: /python/python/Partition-insert
sidebar_label: "insert()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在の partition にデータを挿入します。 | Python | ORM"
type: docx
token: QXDxdv36FoVgjcxDV1gcDwWXnsd
sidebar_position: 5
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# insert()

この操作は現在の partition にデータを挿入します。

<Admonition type="info" icon="📘" title="Notes">

**[Collection](./ORM-Collection)** オブジェクトの **insert()** メソッドで **partition_name** パラメータを使用することは、**[Partition](./ORM-Partition)** オブジェクトの **insert()** メソッドを使用することと同等です。

</Admonition>

## Request Syntax\{#request-syntax}

```python
insert(
    data: List | pandas.DataFrame | Dict, 
    timeout: float | None
)
```

**PARAMETERS:**

- **data** (*list* | *dict* | *pandas.DataFrame*) -

    **[REQUIRED]**

    現在の collection に挿入するデータです。

    挿入するデータは、現在の collection のスキーマに一致している必要があります。データは次のいずれかの形式で構成できます。

    - 列のリスト

        各列は、その列における各 entity の値のリストです。

        ```python
        data = [
            [0,1,2,3,4],                         # id
            [                                    # vector
                [0.1,0.2,-0.3,-0.4,0.5],
                [0.3,-0.1,-0.2,-0.6,0.7],
                [-0.6,-0.3,0.2,0.8,0.7],
                [0.6,0.2,-0.3,-0.8,0.5],
                [0.3,0.1,-0.2,-0.6,-0.7],
            ],
        ]
        ```

    - **pandas.DataFrame**

        [このページ](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html) の **Example** セクションに示されているように、任意の方法でデータフレームを作成できます。

        ```python
        data = pd.DataFrame({
            "id": [5,6,7,8,9],
            "vector": [
                [0.1,0.2,-0.3,-0.4,0.5],
                [0.3,-0.1,-0.2,-0.6,0.7],
                [-0.6,-0.3,0.2,0.8,0.7],
                [0.6,0.2,-0.3,-0.8,0.5],
                [0.3,0.1,-0.2,-0.6,-0.7],
            ]
        })
        ```

    - 行のリスト、または単一の行

        各行は、1 つの entity を表す辞書です。

        ```python
        data = [
            {"id": 10, "vector": [0.1,0.2,-0.3,-0.4,0.5]},
            {"id": 11, "vector": [0.3,-0.1,-0.2,-0.6,0.7]},
            {"id": 12, "vector": [-0.6,-0.3,0.2,0.8,0.7]},
            {"id": 13, "vector": [0.6,0.2,-0.3,-0.8,0.5]},
            {"id": 14, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
        ]
        
        # or 
        
        data = {"id": 15, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
        ```

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*MutationResult*

**RETURNS:**

以下のフィールドを含む **MutationResult** オブジェクトです。

- **insert_count** (*int*)

    挿入された entity の数です。

- **primary_keys** (*list*)

    挿入された entity の主キーのリストです。

**EXCEPTIONS:**

- 以下のフィールドを含む **MutationResult** オブジェクトです。

    - **insert_count** (*int*)

        挿入された entity の数です。

    - **delete_count** (*int*)

        削除された entity の数です。

    - **upsert_count** (*int*)

        upsert された entity の数です。

    - **succ_count** (*int*)

        この操作中に正常に実行された回数です。

    - **succ_index** (*list*)

        0 から始まるインデックス番号のリストで、それぞれが成功した操作を示します。

    - **err_count** (*int*)

        この操作中に失敗した実行回数です。

    - **err_index** (*list*)

        0 から始まるインデックス番号のリストで、それぞれが失敗した操作を示します。

    - **primary_keys** (*list*)

        挿入された entity の主キーのリストです。

    - **timestamp** (*int*)

        この操作が完了した時点のタイムスタンプです。

## Examples\{#examples}

```python
from pymilvus import Collection, Partition, FieldSchema, CollectionSchema, DataType

# Define collection schema    
schema = CollectionSchema([
    FieldSchema("film_id", DataType.INT64, is_primary=True),
    FieldSchema("films", dtype=DataType.FLOAT_VECTOR, dim=2)
])

# Get an existing collection
collection = Collection("test_partition_insert", schema)

# Get an existing partition in the current collection
partition = Partition(collection, "comedy", "comedy films")

# Prepare the data to insert
data = [
    [i for i in range(10)],
    [[float(i) for i in range(2)] for _ in range(10)]
]

# Insert data
res = partition.insert(data)

# Return the count of inserted entities
res.insert_count
10
```

## Related operations\{#related-operations}

以下の操作は `insert()` に関連しています。

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [query()](./Partition-query)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

