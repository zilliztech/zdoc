---
title: "search() | Python | ORM"
slug: /python/python/Collection-search
sidebar_label: "search()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラー絞り込み式を使用して vector 類似検索を実行します。 | Python | ORM"
type: docx
token: OaM5dkbPjohKhNxHvKNcfnYMnVb
sidebar_position: 25
keywords: 
  - Vector 取得
  - Audio 類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search()

この操作は、オプションのスカラー絞り込み式を使用して vector 類似検索を実行します。

## Request Syntax\{#request-syntax}

```python
search(
    data: list[list[float]],
    anns_field: str,
    param: dict,
    limit: int
    expr: str | None,
    partition_names: list[str] | None,
    output_fields: list[str] | None,
    timeout: float | None,
    round_decimal: int,
    search_aggregation: Optional[SearchAggregation] = None
)
```

**PARAMETERS:**

- **data** (*list[list[float]]*) - 

    **[REQUIRED]**

    vector 埋め込みのリスト。

    Zilliz Cloud は、指定された vector 埋め込みに最も類似する vector 埋め込みを検索します。

- **anns_field** (str) -

    **[REQUIRED]**

    現在の collection 内の vector フィールド名

- **param** (dict) -

    **[REQUIRED]**

    この操作に固有のパラメータ設定です。

    - **metric_type** (*str*) -

        この操作に適用される metric type です。これは、上記で指定した vector フィールドを index 化するときに使用したものと同じである必要があります。 

        指定可能な値は **L2**、**IP**、および **COSINE** です。

    - **params** (dict) -

        追加パラメータ

        - **offset** (int) -

            検索結果内でスキップするレコード数。 

            このパラメータは `limit` と組み合わせて使用することで、ページネーションを有効にできます。

            この値と `limit` の合計は 16,384 未満である必要があります。 

        - **radius** (float) -

            類似度の下限しきい値を決定します。`metric_type` を `L2` に設定する場合、この値は **range_filter** の値より大きくする必要があります。それ以外の場合、この値は **range_filter** の値より小さくする必要があります。 

        - **range_filter**  (float) -  

            特定の類似度範囲内の vector に検索を絞り込みます。`metric_type` を `IP` または `COSINE` に設定する場合、この値は **radius** の値より大きくする必要があります。それ以外の場合、この値は **radius** の値より小さくする必要があります。

    他の適用可能な検索パラメータの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **limit** (*int*) -

    返される entity の総数。

    このパラメータは **param** 内の `offset` と組み合わせて使用することで、ページネーションを有効にできます。

    この値と **param** 内の `offset` の合計は 16,384 未満である必要があります。 

- **expr** (*str*) -

    一致する entity を絞り込むためのスカラー絞り込み条件。

    デフォルト値は **None** で、スカラー絞り込みが無視されることを示します。スカラー絞り込み条件の作成方法については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。

- **output_fields** (*list*) -

    返される各 entity に含めるフィールド名のリスト。

    デフォルト値は **None** です。指定しない場合、主キーのフィールドのみが含まれます。

- **partition_names** (*list*) -

    partition 名のリスト。

    デフォルト値は **None** です。指定した場合、指定された partition のみがクエリ対象になります。

- **timeout** (*float*)  -

    この操作のタイムアウト時間。これを **None** に設定すると、任意のレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **round_decimal** (*int*) -

    Zilliz Cloud が計算された距離を丸める小数点以下の桁数。

    デフォルト値は **-1** で、Zilliz Cloud は計算された距離の丸めをスキップし、生の値を返すことを示します。

- **search_aggregation** (*Optional[SearchAggregation]*) -

    階層的なバケット集計仕様です。**group_by_field** とは同時に使用できません。設定すると **limit** は無視され、ルートの `SearchAggregation.size` がトップレベルのバケット数を制御します。

- **consistency_level** (*str*) -

    Milvus が指定された collection 内を検索する際に使用する一貫性レベル。

    このパラメータを指定しない場合、collection 作成時に指定した一貫性レベルが使用されます。このパラメータを指定すると、collection 作成時に指定したものが上書きされます。

    指定可能な値は **Strong**、**Bounded**、**Eventually**、**Session**、および **Customized** です。

- **page_retain_order** (*bool*) -

    `offset` が指定されたときに検索結果の順序を保持するかどうか。

- **guarantee_timestamp** (*int*) -

    検索時に Milvus が参照として使用するタイムスタンプ。

    このパラメータを指定しない場合、Milvus は flush 済みのすべての entity を検索します。この値を設定すると、Milvus は指定されたタイムスタンプ以前に flush された entity のみを検索します。

- **graceful_time** (*int*) -

    検索における猶予期間（秒）。

    この値を設定すると、Milvus は指定された秒数前までに flush された entity のみを検索します。

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

**SearchResult** オブジェクトを返します。このオブジェクトには **Hits** オブジェクトのリストが含まれます。 

- レスポンス構造

    <Admonition type="info" icon="📘" title="Notes">

    **SearchResult** オブジェクトには **Hits** オブジェクトのリストが含まれており、それぞれが検索リクエスト内のクエリ vector に対応します。 
    
    **Hits** オブジェクトには **Hit** オブジェクトのリストが含まれており、それぞれが検索でヒットした entity に対応します。

    </Admonition>

    ```plaintext
    ├── SearchResult
    │   └── Hits  
    │       ├── ids
    │       ├── distances
    │       └── Hit
    │           ├── id
    │           ├── distance
    │           ├── score
    │           ├── vector
    │           └── get()
    ```

- プロパティとメソッド

    - **Hits** オブジェクトには以下のフィールドがあります。

        - **ids** (*list[int]* | *list[str]*)

            ヒットした entity の ID を含むリスト。

        - **distances** (list[float]) 

            ヒットした entity の vector フィールドからクエリ vector までの距離のリスト。

    - **Hit** オブジェクトには以下のフィールドがあります。

        - **id** (*int* | *str*)

            ヒットした entity の ID。

        - **distance** (*float*)

            ヒットした entity の vector フィールドからクエリ vector までの距離。

        - **score** (*float*)

            **distance** の別名。

        - **vector** (*list[float]*)   

            ヒットした entity の vector フィールド。

        - **get(*field_name: str*)**

            ヒットした entity 内の指定されたフィールドの値を取得する関数。 

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が送出されます。

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

# Create a search request
res = collection.search(
    data=[[0.1,0.2,-0.3,-0.4,0.5]],
    anns_field="vector",
    param=param,
    batch_size=BATCH_SIZE,
    limit=LIMIT,
    expr="id > 3",
    output_fields=["id", "vector"]
)

for hits in res:
    # Get ids
    hits.ids
    
    # Get distances
    hits.distances
    
    for hit in hits:
        # Get id
        hit.id
        
        # Get distance
        hit.distance # hit.score
        
        # Get vector
        hit.vector
        
        # Get output field
        hit.get("vector")
        
```

## Related operations\{#related-operations}

- [delete()](./Collection-delete)

- [insert()](./Collection-insert)

- [search_iterator()](./Collection-search_iterator)

- [query()](./Collection-query)

- [query_iterator()](./Collection-query_iterator)

- [upsert()](./Collection-upsert)

