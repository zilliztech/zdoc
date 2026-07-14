---
title: "upsert() | Python | ORM"
slug: /python/python/Collection-upsert
sidebar_label: "upsert()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、新しいレコードをデータベースに挿入するか、既存のレコードを更新します。 | Python | ORM"
type: docx
token: AQ1ydMXbOog5VJxITgUc4GFvnVe
sidebar_position: 28
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - vector embeddings とは
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

この操作は、新しいレコードをデータベースに挿入するか、既存のレコードを更新します。  

<Admonition type="info" icon="📘" title="注意">

upsert はデータレベルの操作であり、指定したフィールドが collection 内にすでに存在する場合は既存のエンティティを上書きし、指定した値がまだ存在しない場合は新しいエンティティを挿入します。

</Admonition>

## Request Syntax\{#request-syntax}

```python
upsert(
    data: List | pandas.DataFrame | Dict, 
    partition_name: str | None, 
    timeout: float, 
)
```

**PARAMETERS:**

- **data** (*list* | *dict* | *pandas.DataFrame*) -

    **[REQUIRED]**

    現在の collection に挿入するデータです。

    挿入するデータは、現在の collection の schema に一致している必要があります。データは次のいずれかの形式に整理できます。

    - 列のリスト

        各列は、その列に含まれるすべてのエンティティの値のリストです。

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

        各行は、1 つのエンティティを表す辞書です。

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

- **partition_name** (*string* | *None*) -

    現在の collection 内の partition 名です。 

    指定した場合、データは指定された partition に挿入されます。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*MutationResult*

**RETURNS:**

以下のフィールドを含む **MutationResult** オブジェクトを返します。

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

# Upsert a list of columns
res = collection.upsert(
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

# Upsert a data frame
import pandas as pd

res = collection.upsert(
    data=pd.DataFrame({
        "id": [5,6,7,8,9],
        "vector": [
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ]
    })
)

# Upsert a list of dictionaries
res = collection.upsert(
    data=[
        {"id": 10, "vector": [0.1,0.2,-0.3,-0.4,0.5]},
        {"id": 11, "vector": [0.3,-0.1,-0.2,-0.6,0.7]},
        {"id": 12, "vector": [-0.6,-0.3,0.2,0.8,0.7]},
        {"id": 13, "vector": [0.6,0.2,-0.3,-0.8,0.5]},
        {"id": 14, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
    ]
)

# Upsert a dictionary
res = collection.upsert(
    data={"id": 16, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
)
```

## Related operations\{#related-operations}

次の操作は `insert()` に関連しています。

- [delete()](./Collection-delete)

- [insert()](./Collection-insert)

- [search()](./Collection-search)

- [search_iterator()](./Collection-search_iterator)

- [query()](./Collection-query)

- [query_iterator()](./Collection-query_iterator)

