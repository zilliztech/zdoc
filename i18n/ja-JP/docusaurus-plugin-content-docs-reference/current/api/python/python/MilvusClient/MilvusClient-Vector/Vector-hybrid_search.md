---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、collection に対して複数ベクトル検索を実行し、再ランキング後の検索結果を返します。 | Python | MilvusClient"
type: docx
token: Iv1PdIVxYoDOMax47xDcLnbEnXb
sidebar_position: 9
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
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

この操作は、collection に対して複数ベクトル検索を実行し、再ランキング後の検索結果を返します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、専用の serving cluster および on-demand compute にのみ適用されます。 

- serving cluster の collection でこの操作を行うには、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用の collection でこの操作を行うには、project endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のために on-demand cluster にアタッチする session を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
hybrid_search(
    collection_name: str,
    reqs: List[AnnSearchRequest],
    ranker: Union[BaseRanker, Function],
    limit: int = 10,   
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    作成する collection の名前。

- **reqs** (*List[AnnSearchRequest]*) -

    検索リクエストのリストで、各リクエストは **ANNSearchRequest** オブジェクトです。各リクエストは、異なる vector field と異なる検索パラメータのセットに対応します。

    - **ANNSearchRequest**: ANN 検索リクエストを表すクラス。

        ```python
        ├── AnnSearchRequest
        │   └── data  
        │   └── anns_field
        │   └── param 
        │   └── limit 
        │   └── expr
        ```

        - **data** (*List*): リクエスト内で検索するクエリベクトル。このパラメータは、1 つの要素を含むリストを受け取ります。

        - **anns_field** (*str*): リクエストで使用する vector field。

        - **param** (*dict*): リクエスト用の検索パラメータの辞書。詳細は、[search()](./Vector-search) の設定を参照してください。

        - **limit** (*int*): リクエストで返す結果の最大数。複数の ANN 検索リクエストを使ってハイブリッド検索を行う場合、各リクエストで **limit** によって定義された上位結果が結合され、再ランキングされた後、最終的な検索結果として返されます。

        - **expr** (*str*): （任意）結果をフィルタリングするための式。

        - **expr_params** (*dict*) -

            [Filtering Templating](/docs/filtering-templating) に記載されているように `expr` でプレースホルダーを使用する場合、このパラメータの値として、それらのプレースホルダーに対する実際の値をキーと値のペアで指定できます。

- **ranker** (*Union[BaseRanker, Function]*) -

    ハイブリッド検索で使用する再ランキング戦略。

    詳細は、[Weighted Ranker](/docs/reranking-weighted-reranker)、[RRF Ranker](/docs/reranking-rrf) および を参照してください。

- **limit** (*int*) -

    返す entity の合計数。

    このパラメータは、**param** 内の `offset` と組み合わせてページネーションを有効にできます。

    この値と **param** 内の `offset` の合計は 16,384 未満である必要があります。

- **partition_names** (*List[str]*) -

    partition 名のリスト。

    デフォルト値は **None** です。指定した場合、指定された partition のみがクエリに関与します。

- **output_fields** (*List[str]*) -

    戻り値の各 entity に含める field 名のリスト。

    デフォルト値は **None** です。指定しない場合、primary field のみが含まれます。

- **timeout** (*float*) -

    この操作のタイムアウト時間。これを **None** に設定すると、いずれかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **round_decimal** (int) -

    Milvus が計算された距離を丸める小数点以下の桁数。

    デフォルト値は **-1** で、Milvus は計算された距離の丸めをスキップし、生の値を返します。

- **group_by_field** (*str*)

    指定した field で検索結果をグループ化し、多様性を確保して同じグループから複数の結果が返されるのを防ぎます。詳細は、[Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search) を参照してください。

- **group_size** (*int*)

    グルーピング検索で各グループ内に返す entity の目標数。詳細は、[Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search) を参照してください。

- **strict_group_size** (*bool*)

    **group_size** を厳密に適用するかどうかを制御します。詳細は、[Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search) を参照してください。

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

**SearchResult** オブジェクト。**Hits** オブジェクトのリストを含みます。 

- レスポンス構造

    <Admonition type="info" icon="📘" title="注意">

    **SearchResult** オブジェクトには **Hits** オブジェクトのリストが含まれ、各 **Hits** は検索リクエスト内のクエリベクトルに対応します。 
    
    **Hits** オブジェクトには **Hit** オブジェクトのリストが含まれ、各 **Hit** は検索でヒットした entity に対応します。

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

            **distance** の別名。

        - **vector** (*list[float]*)   

            ヒットした entity の vector field。

        - **get(*field_name: str*)**

            ヒットした entity 内の指定された field の値を取得する関数。 

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## Examples\{#examples}

- serving cluster でのハイブリッド検索

    ```python
    from pymilvus import AnnSearchRequest, MilvusClient, WeightedRanker
    
    # Connect to Milvus server
    client = MilvusClient(
        uri="https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530",
        token="YOUR_API_KEY"
    )
    
    # Create AnnSearchRequests
    
    query_dense_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    
    search_param_1 = {
        "data": [query_dense_vector],
        "anns_field": "dense",
        "param": {
            "params": {"nprobe": 10}
        },
        "limit": 2
    }
    request_1 = AnnSearchRequest(**search_param_1)
    
    query_sparse_vector = {3573: 0.34701499565746674}, {5263: 0.2639375518635271}
    search_param_2 = {
        "data": [query_sparse_vector],
        "anns_field": "sparse",
        "param": {
            "params": {}
        },
        "limit": 2
    }
    request_2 = AnnSearchRequest(**search_param_2)
    
    reqs = [request_1, request_2]
    
    # Configure reranking strategy
    
    ranker = WeightedRanker(0.8, 0.3) 
    
    # perform hybrid search
    
    res = client.hybrid_search(
        collection_name="hybrid_search_collection",
        reqs=reqs,
        ranker=ranker,
        limit=2
    )
    for hits in res:
        print("TopK results:")
        for hit in hits:
            print(hit)
    ```

- on-demand compute でのハイブリッド検索

    ```python
    from pymilvus import AnnSearchRequest, MilvusClient, WeightedRanker
    
    # Connect to Milvus server
    client = MilvusClient(
        uri="https://{project-id}.{region}.api.zillizcloud.com",
        token="YOUR_API_KEY"
    )
    
    # Create a session
    session = client.session(cluster_id="inxx-xxxxxxxxxxxx")
    
    # Create AnnSearchRequests
    
    query_dense_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    
    search_param_1 = {
        "data": [query_dense_vector],
        "anns_field": "dense",
        "param": {
            "params": {"nprobe": 10}
        },
        "limit": 2
    }
    request_1 = AnnSearchRequest(**search_param_1)
    
    query_sparse_vector = {3573: 0.34701499565746674}, {5263: 0.2639375518635271}
    search_param_2 = {
        "data": [query_sparse_vector],
        "anns_field": "sparse",
        "param": {
            "params": {}
        },
        "limit": 2
    }
    request_2 = AnnSearchRequest(**search_param_2)
    
    reqs = [request_1, request_2]
    
    # Configure reranking strategy
    
    ranker = WeightedRanker(0.8, 0.3) 
    
    # perform hybrid search
    
    res = client.hybrid_search(
        collection_name="hybrid_search_collection",
        reqs=reqs,
        ranker=ranker,
        limit=2
    )
    for hits in res:
        print("TopK results:")
        for hit in hits:
            print(hit)
    ```

