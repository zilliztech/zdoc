---
title: "upsert() | Python | ORM"
slug: /python/python/Partition-upsert
sidebar_label: "upsert()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、新しいレコードをデータベースに挿入するか、既存のレコードを更新します。 | Python | ORM"
type: docx
token: MQMzddDnao5Zz0xmSRncZM2nn5b
sidebar_position: 11
keywords: 
  - Deep Learning
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - クラウド
  - upsert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# upsert()

この操作は、新しいレコードをデータベースに挿入するか、既存のレコードを更新します。 

<Admonition type="info" icon="📘" title="注意">

upsert はデータレベルの操作であり、指定されたフィールドが collection にすでに存在する場合は既存の entity を上書きし、指定された値がまだ存在しない場合は新しい entity を挿入します。

</Admonition>

## Request Syntax\{#request-syntax}

```python
upsert(
    data: List | pandas.DataFrame | Dict,, 
    timeout=float | None
)
```

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection(name="string")

# Get an existing partition
partition = Partition(name="string")

# Prepare your data
data = ...

# Upsert data into partition
partition.upsert(
    data=data,
    timeout=None
)
```

**PARAMETERS:**

- **data** (*list* | *dict* | *pandas.DataFrame*) -

    **[REQUIRED]**

    現在の collection に挿入するデータです。

    挿入するデータは、現在の collection のスキーマと一致している必要があります。データは次のいずれかの形式で構成できます。

    - カラムのリスト

        各カラムは、そのカラム内のすべての entity の値を含むリストです。

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

        [このページ](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html) の **Example** セクションで示されているように、任意の方法でデータフレームを作成できます。

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

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**RETURN TYPE:**

*MutationResult*

**RETURNS:**

以下のフィールドを含む **MutationResult** オブジェクトを返します。

- **insert_count** (*int*)

    挿入された entity の数。

- **delete_count** (*int*)

    削除された entity の数。

- **upsert_count** (*int*)

    upsert された entity の数。

- **succ_count** (*int*)

    この操作中に正常に実行された回数。

- **succ_index** (*list*)

    0 から始まるインデックス番号のリストで、それぞれが成功した操作を示します。

- **err_count** (*int*)

    この操作中に失敗した実行回数。

- **err_index** (*list*)

    0 から始まるインデックス番号のリストで、それぞれが失敗した操作を示します。

- **primary_keys** (*list*)

    挿入された entity の主キーのリスト。

- **timestamp** (*int*)

    この操作が完了した時点のタイムスタンプ。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に送出される例外です。

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

# Upsert data
res = partition.upsert(data)

# Return the count of upserted entities
res.upsert_count
10
```

## Related operations\{#related-operations}

以下の操作は `upsert()` に関連しています。

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [search()](./Partition-search)

