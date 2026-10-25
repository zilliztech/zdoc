---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、複数のベクトルフィールドにわたってハイブリッドベクトル検索を実行し、複数の ANN 検索の結果を組み合わせて再ランキングします。 | Python | MilvusClient"
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
  - クラウド
  - hybrid_search()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# hybrid_search()

この操作は、複数のベクトルフィールドにわたってハイブリッドベクトル検索を実行し、複数の ANN 検索の結果を組み合わせて再ランキングします。

## リクエスト構文\{#request-syntax}

```python
hybrid_search(
    collection_name: str,
    reqs: List[AnnSearchRequest],
    ranker: Union[BaseRanker, Function],
    limit: int = 10,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs,
) -> SearchResult
```

**パラメーター:**

- **collection_name** (*str*) -<br/>
  **[必須]**<br/>
  検索対象のコレクションの名前。

- **reqs** (*List[AnnSearchRequest]*) -<br/>
  **[必須]**<br/>
  ハイブリッド検索で組み合わせる ANN 検索リクエスト。各リクエストは `AnnSearchRequest(data, anns_field, param, limit, expr=None, expr_params=None, filter=None)` を使用して構築します。

    - **data** (*Union[List, SparseMatrixInputType]*) -

**[必須]**
この ANN 検索リクエストで使用するクエリベクトルまたはスパース行列。

```plaintext
- **anns_field** (*str*) -
```

**[必須]**
検索対象のベクトルフィールドの名前。

```plaintext
- **param** (*Dict*) -
```

**[必須]**
メトリクスタイプや検索固有の設定など、ANN 検索パラメーターです。

```plaintext
- **limit** (*int*) -
```

**[必須]**
この ANN 検索リクエストによって返される一致件数の最大値。

```plaintext
- **expr** (*Optional[str]*) -
```

デフォルト: `None`
ANN 検索の前に適用されるブールフィルター式。`expr` と `filter` を同時に指定しないでください。

```plaintext
- **expr_params** (*Optional[dict]*) -
```

デフォルト: `None`
式テンプレートのプレースホルダーに代入される値。

```plaintext
- **filter** (*Optional[str]*) -
```

デフォルト: `None`
`expr` のエイリアス。両方の値を指定しないでください。解決された式は、読み取り専用の `filter` プロパティを通じて `request.filter` として参照できます。

- **ranker** (*Union[BaseRanker, Function]*) -<br/>
  **[必須]**<br/>
  検索リクエストの結果を統合して順序付けるために使用するランカー。

- **limit** (*int*) -<br/>
  Default: `10`<br/>
  返すレコードの最大数。`topk` とも呼ばれます。

- **output_fields** (*Optional[List[str]]*) -<br/>
  Default: `None`<br/>
  各検索結果に含めるスカラーフィールド。

- **timeout** (*Optional[float]*) -<br/>
  Default: `None`<br/>
  RPC を待機する最大時間（秒）。省略した場合、クライアントはサーバーが応答するか、エラーが発生するまで待機します。

- **partition_names** (*Optional[List[str]]*) -<br/>
  Default: `None`<br/>
  検索対象のパーティションの名前。

- **kwargs** (*Any*) -<br/>
  ページネーション用のトップレベル `offset` や検索用の `consistency_level` など、追加の検索オプション。

    トップレベルの `offset` は、候補の統合と再ランキングの後に最終結果へ適用されます。**AnnSearchRequest** の `param` 内の `offset` はハイブリッド検索ではサポートされておらず、Milvus によって無視されます。

    ページネーションを期待どおりに機能させるには、**reqs** 内の各 **AnnSearchRequest** の `limit` がページネーションウィンドウ、つまりトップレベルの `offset` と `limit` の合計をカバーする必要があります。これら 2 つの値の合計は 16,384 以下である必要があります。

**戻り値の型:**

*SearchResult*

**戻り値:**

各リクエストの式またはフィルターを適用した後の、結合された ANN リクエストの検索結果。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

この例では、ページネーション付きのハイブリッド検索を実行します。トップレベルの `offset` は、候補の統合と再ランキングの後に最終結果へ適用されるため、各 `AnnSearchRequest.limit` はページネーションウィンドウ（`offset + limit`）をカバーします。

```python
from pymilvus import AnnSearchRequest, MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

# Create a collection, insert data, and load it
schema = client.create_schema(auto_id=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="text_vector", datatype=DataType.FLOAT_VECTOR, dim=3)
schema.add_field(field_name="image_vector", datatype=DataType.FLOAT_VECTOR, dim=3)
client.create_collection(collection_name="book_chunks", schema=schema)
index_params = client.prepare_index_params()
index_params.add_index(field_name="text_vector", index_type="AUTOINDEX", metric_type="IP")
index_params.add_index(field_name="image_vector", index_type="AUTOINDEX", metric_type="IP")
client.create_index(collection_name="book_chunks", index_params=index_params)
client.insert(collection_name="book_chunks", data=[
    {"id": i, "text_vector": [0.1, 0.2, 0.3], "image_vector": [0.3, 0.2, 0.1]}
    for i in range(30)
])
client.load_collection(collection_name="book_chunks")

requests = [
    AnnSearchRequest(
        data=[[0.1, 0.2, 0.3]],
        anns_field="text_vector",
        param={"metric_type": "IP"},
        limit=30,  # cover the pagination window (offset 20 + limit 10)
    ),
    AnnSearchRequest(
        data=[[0.3, 0.2, 0.1]],
        anns_field="image_vector",
        param={"metric_type": "IP"},
        limit=30,
    ),
]

# NOTE: Set the consistency level to Strong so that the entities inserted above
# are immediately visible and the example returns results. In production,
# choose a consistency level (for example, Bounded) that fits your scenario.
results = client.hybrid_search(
    collection_name="book_chunks",
    reqs=requests,
    ranker=None,
    limit=10,
    offset=20,  # return the third page of the fused and reranked results
    consistency_level="Strong",
)
print(results)
```
