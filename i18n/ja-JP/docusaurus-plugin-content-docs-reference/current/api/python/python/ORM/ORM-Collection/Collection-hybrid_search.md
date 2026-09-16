---
title: "hybrid_search() | Python | ORM"
slug: /python/python/Collection-hybrid_search
sidebar_label: "hybrid_search()"
beta: NEAR DEPRECATE
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションに対してマルチベクトル検索を実行し、再ランキング後の検索結果を返します。 | Python | ORM"
type: docx
token: QqOSdTDaLoOKGRxiKEtcuuiAnrf
sidebar_position: 17
keywords: 
  - Milvus ベクトルデータベース
  - Zilliz Cloud
  - Milvus とは
  - Milvus データベース
  - zilliz
  - zilliz cloud
  - cloud
  - hybrid_search()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# hybrid_search()

この操作は、コレクションに対してマルチベクトル検索を実行し、再ランキング後の検索結果を返します。

## Request Syntax\{#request-syntax}

```python
hybrid_search(
    reqs: List,
    rerank: BaseRanker,
    limit: int,
    partition_names: Optional[List[str]] = None,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    round_decimal: int = -1,
)
```

**PARAMETERS:**

- **reqs** (*List[AnnSearchRequest]*) -

    検索リクエストのリストです。各リクエストは **ANNSearchRequest** オブジェクトで、それぞれ異なるベクトルフィールドと異なる検索パラメータのセットに対応します。

    - **ANNSearchRequest**: ANN 検索リクエストを表すクラスです。

        ```python
        ├── AnnSearchRequest
        │   └── data  
        │   └── anns_field
        │   └── param 
        │   └── limit 
        │   └── expr
        ```

        - **data** (*List*): リクエスト内で検索するクエリベクトルです。このパラメータは、1 つの要素を含むリストを受け付けます。

        - **anns_field** (*str*): リクエストで使用するベクトルフィールドです。

        - **param** (*dict*): リクエストの検索パラメータを含む辞書です。詳細は、[Search parameters](https://milvus.io/docs/single-vector-search#search-parameters) を参照してください。

        - **limit** (*int*): リクエストで返す結果の最大数です。複数の ANN 検索リクエストでハイブリッド検索を実行する場合、各リクエストで **limit** によって定義された上位の結果が結合され、再ランキングされたうえで、最終的な検索結果として返されます。

        - **expr** (*str*): （オプション）結果を絞り込むための式です。

- **rerank** (*BaseRanker*) -

    ハイブリッド検索で使用する再ランキング戦略です。有効な値: `WeightedRanker` および `RRFRanker`。

    - `WeightedRanker`: Average Weighted Scoring の再ランキング戦略で、関連性に基づいてベクトルを優先し、その重要度を平均化します。

    - `RRFRanker`: RRF の再ランキング戦略で、複数の検索の結果を統合し、一貫して出現する項目を優先します。

- **limit** (*int*) -

    返すエンティティの総数です。

    このパラメータを **param** 内の `offset` と組み合わせて使用することで、ページネーションを有効にできます。

    この値と **param** 内の `offset` の合計は 16,384 未満である必要があります。

- **partition_names** (*List[str]*) -

    パーティション名のリストです。

    デフォルト値は **None** です。指定した場合、指定したパーティションのみがクエリの対象になります。

- **output_fields** (*List[str]*) -

    返される各エンティティに含めるフィールド名のリストです。

    デフォルト値は **None** です。指定しない場合、プライマリフィールドのみが含まれます。

- **timeout** (*float*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **round_decimal** (int) -

    Milvus が計算された距離を丸める際の小数点以下の桁数です。

    デフォルト値は **-1** で、Milvus が計算された距離の丸めをスキップし、生の値を返すことを示します。

- **group_by_field** (*str*)

    検索結果を指定したフィールドでグループ化し、多様性を確保するとともに、同じグループから複数の結果が返されることを回避します。詳細は、[Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search) を参照してください。

- **group_size** (*int*)

    グルーピング検索において、各グループ内で返すエンティティの目標数です。詳細は、[Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search) を参照してください。

- **strict_group_size** (*bool*)

    **group_size** を厳密に適用するかどうかを制御します。詳細は、[Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search) を参照してください。

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

**Hits** オブジェクトのリストを含む **SearchResult** オブジェクトです。

- レスポンス構造

    <Admonition type="info" title="Notes">

    **SearchResult** オブジェクトには **Hits** オブジェクトのリストが含まれ、各 **Hits** オブジェクトは検索リクエスト内のクエリベクトルに対応します。
    
    **Hits** オブジェクトには **Hit** オブジェクトのリストが含まれ、各 **Hit** オブジェクトは検索によってヒットしたエンティティに対応します。

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

    この操作中に何らかのエラーが発生した場合に発生する例外です。

## Examples\{#examples}

```python
collection = Collection(name='{your_collection_name}') # Replace with the actual name of your collection

res = collection.hybrid_search(
    reqs=[
        AnnSearchRequest(
            data=[['{your_text_query_vector}']],  # Replace with your text vector data
            anns_field='{text_vector_field_name}',  # Textual data vector field
            param={"metric_type": "IP", "params": {"nprobe": 10}}, # Search parameters
            limit=2
        ),
        AnnSearchRequest(
            data=[['{your_image_query_vector}']],  # Replace with your image vector data
            anns_field='{image_vector_field_name}',  # Image data vector field
            param={"metric_type": "IP", "params": {"nprobe": 10}}, # Search parameters
            limit=2
        )
    ],
    # Use WeightedRanker to combine results with specified weights
    rerank=WeightedRanker(0.8, 0.2), # Assign weights of 0.8 to text search and 0.2 to image search
    # Alternatively, use RRFRanker for reciprocal rank fusion reranking
    # rerank=RRFRanker(),
    limit=2
)
```
