---
title: "search() | Python | ORM"
slug: /python/python/Partition-search
sidebar_label: "search()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラーフィルタリング式を使用してベクトル類似度検索を実行します。 | Python | ORM"
type: docx
token: XW72dhBuNoqNWhxUQLtcfa6Fnwd
sidebar_position: 10
keywords: 
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
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

この操作は、オプションのスカラーフィルタリング式を使用してベクトル類似度検索を実行します。

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

    現在の検索における対象のベクトルフィールドの名前です。

    このパラメータのデフォルトは空の文字列です。このパラメータを指定しない場合はデフォルト値が適用され、コレクション内の唯一のベクトルフィールドが検索対象として使用されることを示します。

- **param** (dict) -

    **[REQUIRED]**

    この操作に固有のパラメータ設定です。

    - **metric_type** (*str*) -

        この操作に適用されるメトリックタイプです。これは、上で指定したベクトルフィールドのインデックスを作成したときに使用したものと同じである必要があります。

        指定可能な値は **L2**、**IP**、**COSINE** です。

    - **params** (dict) -

        追加のパラメータです。

        - **offset** (int) -

            検索結果でスキップするレコード数です。

            このパラメータを `limit` と組み合わせて使用すると、ページネーションを有効にできます。

            この値と `limit` の合計は 16,384 未満にする必要があります。

        - **radius** (float) -

            最小類似度のしきい値を決定します。`metric_type` を `L2` に設定する場合は、この値が **range_filter** の値より大きくなるようにしてください。それ以外の場合は、この値は **range_filter** の値より小さくする必要があります。

        - **range_filter**  (float) -

            特定の類似度範囲内のベクトルに検索を絞り込みます。`metric_type` を `IP` または `COSINE` に設定する場合は、この値が **radius** の値より大きくなるようにしてください。それ以外の場合は、この値は **radius** の値より小さくする必要があります。

    その他の適用可能な検索パラメータの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **limit** (*int*) -

    返されるエンティティの総数です。

    このパラメータを **param** 内の `offset` と組み合わせて使用すると、ページネーションを有効にできます。

    この値と **param** 内の `offset` の合計は 16,384 未満にする必要があります。

- **expr** (*str*) -

    一致するエンティティをフィルタリングするためのスカラーフィルタリング条件です。

    値のデフォルトは **None** で、スカラーフィルタリングが無視されることを示します。スカラーフィルタリング条件を作成する方法については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。

- **output_fields** (*list*) -

    返される各エンティティに含めるフィールド名のリストです。

    値のデフォルトは **None** です。指定しない場合は、主フィールドのみが含まれます。

- **timeout** (*float*)  -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **round_decimal** (int) -

    Zilliz Cloud が計算された距離を丸める際の小数点以下の桁数です。

    値のデフォルトは **-1** で、Zilliz Cloud が計算された距離の丸めをスキップし、生の値を返すことを示します。

- **search_aggregation** (*Optional[SearchAggregation]*) -

    階層バケット集計の仕様です。**group_by_field** とは相互に排他的です。設定した場合、**limit** は無視され、最上位のバケット数はルートの *SearchAggregation.size* によって制御されます。

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

**SearchResult** オブジェクトを返します。これには **Hits** オブジェクトのリストが含まれます。

- レスポンスの構造

    <Admonition type="info" title="Notes">

    **SearchResult** オブジェクトには **Hits** オブジェクトのリストが含まれており、それぞれが検索リクエスト内の 1 つのクエリベクトルに対応します。
    
    **Hits** オブジェクトには **Hit** オブジェクトのリストが含まれており、それぞれが検索でヒットした 1 つのエンティティに対応します。

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

        - **vector** (*list[float]*)

            ヒットしたエンティティのベクトルフィールドです。

        - **get(*field_name: str*)**

            ヒットしたエンティティ内の指定したフィールドの値を取得する関数です。

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
