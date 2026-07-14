---
title: "search_iterator() | Python | ORM"
slug: /python/python/Collection-search_iterator
sidebar_label: "search_iterator()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、検索結果を反復処理するための Python iterator を返します。検索結果に大量のデータが含まれる場合に特に便利です。 | Python | ORM"
type: docx
token: HrnndnWtKoPuenxvsXBchF1wnnh
sidebar_position: 26
keywords: 
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - search_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search_iterator()

この操作は、検索結果を反復処理するための Python iterator を返します。検索結果に大量のデータが含まれる場合に特に便利です。

## Request Syntax\{#request-syntax}

```python
search_iterator(
    data: list[list[float]], 
    anns_field: str, 
    param: dict, 
    batch_size: int, 
    limit: int, 
    expr: str | None, 
    partition_names: list[str] | None, 
    output_fields: list[str] | None, 
    timeout: float | None, 
    round_decimal: int,
)
```

**PARAMETERS:**

- **data** (*list[list[float]]*) - 

    **[REQUIRED]**

    vector embeddings のリスト。

    Zilliz Cloud は、指定されたものに最も類似する vector embeddings を検索します。

- **anns_field** (str) -

    **[REQUIRED]**

    現在の collection 内の vector field の名前。

- **param** (dict) -

    **[REQUIRED]**

    この操作に固有のパラメーター設定。

    - **metric_type** (*str*) -

        この操作に適用される metric type。これは、上で指定した vector field を index 化するときに使用したものと同じである必要があります。 

        使用可能な値は **L2**、**IP**、および **COSINE** です。

    - **params** (dict) -

        追加パラメーター

        - **radius** (float) -

            最小類似度のしきい値を決定します。`metric_type` を `L2` に設定する場合、この値が **range_filter** の値より大きいことを確認してください。それ以外の場合、この値は **range_filter** の値より小さくする必要があります。 

        - **range_filter**  (float) -  

            特定の類似度範囲内の vectors に検索を絞り込みます。`metric_type` を `IP` または `COSINE` に設定する場合、この値が **radius** の値より大きいことを確認してください。それ以外の場合、この値は **radius** の値より小さくする必要があります。

    他の適用可能な検索パラメーターの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **batch_size** (*int*) -

    現在の iterator で `next()` を呼び出すたびに返される entities の数。

    デフォルト値は **1000** です。反復ごとに返す entities の数を制御するために、適切な値に設定してください。

- **limit** (*int*) -

    返される entities の総数。

    デフォルト値は **-1** で、これは一致するすべての entities が返されることを示します。

- **expr** (*str*) -

    一致する entities を絞り込むための scalar filtering 条件。

    デフォルト値は **None** で、scalar filtering が無視されることを示します。scalar filtering 条件の構築については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。

- **output_fields** (*list*) -

    返される各 entity に含める field 名のリスト。

    デフォルト値は **None** です。指定しない場合、primary field のみが含まれます。

- **partition_names** (*list*) -

    partition 名のリスト。

    デフォルト値は **None** です。指定した場合、指定した partitions のみがクエリに含まれます。

- **timeout** (*float*)  -

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **round_decimal** (int) -

    Zilliz Cloud が計算された距離を丸める小数点以下の桁数。

    デフォルト値は **-1** で、Zilliz Cloud が計算された距離の丸めをスキップし、生の値を返すことを示します。

**RETURN TYPE:**

*SearchIterator*

**RETURNS:**

検索結果を反復処理するための **SearchIterator**。

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

BATCH_SIZE = 2
LIMIT = 10

param = {
    "metric_type": "COSINE",
    "params": {
        "nprobe": 1024,
        "radius": 0.2,
        "range_filter": 1.0
    }
}

# Create a search iterator
iterator = collection.search_iterator(
    data=[[0.1,0.2,-0.3,-0.4,0.5]],
    anns_field="vector",
    param=param,
    batch_size=BATCH_SIZE,
    limit=LIMIT,
    expr="id > 3",
    output_fields=["id", "vector"]
)

while True:
    res = iterator.next()
    
    # Get distances
    res.distances()
    
    # Get ids
    res.ids()
    
    if not res.ids():
        iterator.close()
        break

```

## Related operations\{#related-operations}

以下の操作は `search_iterator()` に関連しています。

- [delete()](./Collection-delete)

- [insert()](./Collection-insert)

- [search()](./Collection-search)

- [query()](./Collection-query)

- [query_iterator()](./Collection-query_iterator)

- [upsert()](./Collection-upsert)

