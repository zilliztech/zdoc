---
title: "search() | Python | ORM"
slug: /python/python/Partition-search
sidebar_label: "search()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラー フィルタリング式を使用してベクトル類似度検索を実行します。 | Python | ORM"
type: docx
token: XW72dhBuNoqNWhxUQLtcfa6Fnwd
sidebar_position: 10
keywords: 
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベース チュートリアル
  - ベクトルデータベースはどのように動作するか
  - zilliz
  - zilliz cloud
  - クラウド
  - search()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search()

この操作は、オプションのスカラー フィルタリング式を使用してベクトル類似度検索を実行します。

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

    vector embeddings のリスト。

    Zilliz Cloud は、指定されたものに最も類似する vector embeddings を検索します。

- **anns_field** (str) -

    現在の検索対象となる vector field の名前。

    このパラメータのデフォルトは空文字列です。このパラメータを指定しない場合、デフォルト値が適用され、collection 内で唯一の vector field が検索対象として使用されます。

- **param** (dict) -

    **[REQUIRED]**

    この操作固有のパラメータ設定。

    - **metric_type** (*str*) -

        この操作に適用される metric type。これは、上で指定した vector field の index 作成時に使用したものと同じである必要があります。 

        使用可能な値は **L2**、**IP**、**COSINE** です。

    - **params** (dict) -

        追加パラメータ。

        - **offset** (int) -

            検索結果内でスキップするレコード数。 

            このパラメータを `limit` と組み合わせることで、ページネーションを有効にできます。

            この値と `limit` の合計は 16,384 未満である必要があります。 

        - **radius** (float) -

            類似度の下限しきい値を決定します。`metric_type` を `L2` に設定する場合、この値は **range_filter** の値より大きくする必要があります。それ以外の場合、この値は **range_filter** の値より小さくする必要があります。 

        - **range_filter**  (float) -  

            特定の類似度範囲内のベクトルに検索を絞り込みます。`metric_type` を `IP` または `COSINE` に設定する場合、この値は **radius** の値より大きくする必要があります。それ以外の場合、この値は **radius** の値より小さくする必要があります。

    その他の適用可能な検索パラメータの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **limit** (*int*) -

    返される entity の総数。

    このパラメータを **param** 内の `offset` と組み合わせることで、ページネーションを有効にできます。

    この値と **param** 内の `offset` の合計は 16,384 未満である必要があります。 

- **expr** (*str*) -

    一致する entity をフィルタリングするための scalar filtering 条件。

    デフォルト値は **None** で、scalar filtering を無視することを示します。scalar filtering 条件の構築方法については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。

- **output_fields** (*list*) -

    返される各 entity に含める field 名のリスト。

    デフォルト値は **None** です。指定しない場合、primary field のみが含まれます。

- **timeout** (*float*)  -

    この操作のタイムアウト時間。これを **None** に設定すると、いずれかの応答が到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **round_decimal** (int) -

    Zilliz Cloud が計算された距離を丸める小数点以下の桁数。

    デフォルト値は **-1** で、Zilliz Cloud は計算された距離を丸めず、生の値を返すことを示します。

- **search_aggregation** (*Optional[SearchAggregation]*) -

    階層バケット集約仕様。**group_by_field** とは相互排他です。設定した場合、**limit** は無視され、ルートの *SearchAggregation.size* がトップレベルのバケット数を制御します。

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

**SearchResult** オブジェクトを返します。これには **Hits** オブジェクトのリストが含まれます。 

- レスポンス構造

    <Admonition type="info" icon="📘" title="注意">

    **SearchResult** オブジェクトには **Hits** オブジェクトのリストが含まれており、それぞれが検索リクエスト内のクエリベクトルに対応します。 
    
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

    - **Hits** オブジェクトには次のフィールドがあります。

        - **ids** (*list[int]* | *list[str]*)

            ヒットした entity の ID を含むリスト。

        - **distances** (list[float]) 

            ヒットした entity の vector field からクエリベクトルまでの距離のリスト。

    - **Hit** オブジェクトには次のフィールドがあります。

        - **id** (*int* | *str*)

            ヒットした entity の ID。

        - **distance** (*float*)

            ヒットした entity の vector field からクエリベクトルまでの距離。

        - **score** (*float*)

            **distance** のエイリアス。

        - **vector** (*list[float]*)   

            ヒットした entity の vector field。

        - **get(*field_name: str*)**

            ヒットした entity 内の指定した field の値を取得する関数。 

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

## Examples\{#examples}

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection(name="test_collection")

# Get an existing partition
partition = Partition(name="test_partition")

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
res = partition.search(
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

次の操作は `search()` に関連しています。

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [upsert()](./Partition-upsert)

