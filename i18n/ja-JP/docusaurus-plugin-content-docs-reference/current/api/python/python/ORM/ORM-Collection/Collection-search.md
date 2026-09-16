---
title: "search() | Python | ORM"
slug: /python/python/Collection-search
sidebar_label: "search()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラー絞り込み式を使用してベクトル類似検索を実行します。 | Python | ORM"
type: docx
token: OaM5dkbPjohKhNxHvKNcfnYMnVb
sidebar_position: 25
keywords: 
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトルデータベース
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

この操作は、オプションのスカラー絞り込み式を使用してベクトル類似検索を実行します。

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

    ベクトル埋め込みのリストです。

    Zilliz Cloud は、指定されたベクトル埋め込みに最も類似するベクトル埋め込みを検索します。

- **anns_field** (str) -

    **[REQUIRED]**

    現在のコレクション内のベクトルフィールドの名前です。

- **param** (dict) -

    **[REQUIRED]**

    この操作に固有のパラメータ設定です。

    - **metric_type** (*str*) -

        この操作に適用されるメトリックタイプです。これは、上記で指定したベクトルフィールドにインデックスを作成するときに使用したものと同じである必要があります。 

        指定可能な値は **L2**、**IP**、**COSINE** です。

    - **params** (dict) -

        追加のパラメータ

        - **offset** (int) -

            検索結果内でスキップするレコード数です。 

            このパラメータを `limit` と組み合わせて使用すると、ページネーションを有効にできます。

            この値と `limit` の合計は 16,384 未満である必要があります。 

        - **radius** (float) -

            類似度が最小となるしきい値を決定します。`metric_type` を `L2` に設定する場合は、この値が **range_filter** の値より大きくなるようにしてください。それ以外の場合は、この値が **range_filter** の値より小さくなるようにしてください。 

        - **range_filter**  (float) -  

            検索を特定の類似度範囲内のベクトルに絞り込みます。`metric_type` を `IP` または `COSINE` に設定する場合は、この値が **radius** の値より大きくなるようにしてください。それ以外の場合は、この値が **radius** の値より小さくなるようにしてください。

    他の適用可能な検索パラメータの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **limit** (*int*) -

    返すエンティティの総数です。

    このパラメータを **param** 内の `offset` と組み合わせて使用すると、ページネーションを有効にできます。

    この値と **param** 内の `offset` の合計は 16,384 未満である必要があります。 

- **expr** (*str*) -

    一致するエンティティを絞り込むためのスカラー絞り込み条件です。

    デフォルト値は **None** で、スカラー絞り込みが無視されることを示します。スカラー絞り込み条件を構築するには、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。

- **output_fields** (*list*) -

    返される各エンティティに含めるフィールド名のリストです。

    デフォルト値は **None** です。指定しない場合は、プライマリフィールドのみが含まれます。

- **partition_names** (*list*) -

    パーティション名のリストです。

    デフォルト値は **None** です。指定した場合は、指定したパーティションのみがクエリの対象になります。

- **timeout** (*float*)  -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが到着したとき、または何らかのエラーが発生したときにこの操作がタイムアウトすることを示します。

- **round_decimal** (*int*) -

    Zilliz Cloud が計算された距離を丸める際の小数点以下の桁数です。

    デフォルト値は **-1** で、Zilliz Cloud が計算された距離の丸めをスキップし、生の値を返すことを示します。

- **search_aggregation** (*Optional[SearchAggregation]*) -

    階層的なバケット集約の仕様です。**group_by_field** とは相互に排他的です。設定すると **limit** は無視され、ルートの `SearchAggregation.size` が最上位のバケット数を制御します。

- **consistency_level** (*str*) -

    指定したコレクション内を Milvus が検索するときに使用される整合性レベルです。

    このパラメータを指定しない場合は、コレクション作成時に指定した整合性レベルが使用されます。このパラメータを指定すると、コレクション作成時に指定した整合性レベルが上書きされます。

    指定可能な値は **Strong**、**Bounded**、**Eventually**、**Session**、**Customized** です。

- **page_retain_order** (*bool*) -

    `offset` を指定したときに検索結果の順序を保持するかどうかです。

- **guarantee_timestamp** (*int*) -

    Milvus が検索時に参照として使用するタイムスタンプです。

    このパラメータを指定しない場合、Milvus はフラッシュ済みのすべてのエンティティ内を検索します。この値を設定すると、Milvus は指定したタイムスタンプより前にフラッシュされたエンティティ内を検索します。

- **graceful_time** (*int*) -

    検索の猶予期間（秒）です。

    この値を設定すると、Milvus は指定した秒数前にフラッシュされたエンティティ内を検索します。

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

**Hits** オブジェクトのリストを含む **SearchResult** オブジェクトです。 

- レスポンス構造

    <Admonition type="info" title="Notes">

    **SearchResult** オブジェクトには **Hits** オブジェクトのリストが含まれ、各 **Hits** オブジェクトは検索リクエスト内のクエリベクトルに対応します。 
    
    **Hits** オブジェクトには **Hit** オブジェクトのリストが含まれ、各 **Hit** オブジェクトは検索でヒットしたエンティティに対応します。

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

    - **Hits** オブジェクトには次のフィールドがあります。

        - **ids** (*list[int]* | *list[str]*)

            ヒットしたエンティティの ID を含むリストです。

        - **distances** (list[float]) 

            ヒットしたエンティティのベクトルフィールドからクエリベクトルまでの距離のリストです。

    - **Hit** オブジェクトには次のフィールドがあります。

        - **id** (*int* | *str*)

            ヒットしたエンティティの ID です。

        - **distance** (*float*)

            ヒットしたエンティティのベクトルフィールドからクエリベクトルまでの距離です。

        - **score** (*float*)

            **distance** のエイリアスです。

        - **ベクトル** (*list[float]*)   

            ヒットしたエンティティのベクトルフィールドです。

        - **get(*field_name: str*)**

            ヒットしたエンティティ内の指定したフィールドの値を取得する関数です。 

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

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

