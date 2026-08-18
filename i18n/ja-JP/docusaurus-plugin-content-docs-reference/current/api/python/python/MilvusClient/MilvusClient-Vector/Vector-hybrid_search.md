---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションに対してマルチベクトル検索を実行し、再ランキング後に検索結果を返します。 | Python | MilvusClient"
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

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# hybrid_search()

この操作は、コレクションに対してマルチベクトル検索を実行し、再ランキング後に検索結果を返します。

<Admonition type="info" icon="📘" title="Notes">

このメソッドは、Dedicated サービングクラスターとオンデマンドコンピュートにのみ適用されます。 

- サービングクラスターのコレクションでこの操作を実行するには、クラスターエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュートのコレクションでこの操作を実行するには、プロジェクトエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のためオンデマンドクラスターに接続するセッションを作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

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

    - **data** (*Union[List, SparseMatrixInputType]*) -<br/>
      **[必須]**<br/>
      この ANN 検索リクエストで使用するクエリベクトルまたはスパース行列。

    - **anns_field** (*str*) -<br/>
      **[必須]**<br/>
      検索対象のベクトルフィールドの名前。

    - **param** (*Dict*) -<br/>
      **[必須]**<br/>
      メトリックタイプや検索固有の設定など、ANN 検索のパラメーター。

    - **limit** (*int*) -<br/>
      **[必須]**<br/>
      この ANN 検索リクエストが返す一致結果の最大数。

    - **expr** (*Optional[str]*) -<br/>
      Default: `None`<br/>
      ANN 検索の前に適用するブールフィルタリング式。`expr` と `filter` の両方を指定しないでください。

    - **expr_params** (*Optional[dict]*) -<br/>
      Default: `None`<br/>
      式テンプレートのプレースホルダーに代入する値。

    - **filter** (*Optional[str]*) -<br/>
      Default: `None`<br/>
      `expr` のエイリアス。両方の値を指定しないでください。解決された式は、読み取り専用の `filter` プロパティで `request.filter` として利用できます。

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
  ページネーションのオフセットや整合性レベルなどの追加の検索オプション。

**戻り値の型:**

*SearchResult*

**戻り値:**

各リクエストの式またはフィルターを適用した後の、結合された ANN リクエストの検索結果。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

この例では、ANN リクエストを構築し、ハイブリッド検索を実行します。

```python
from pymilvus import AnnSearchRequest, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
request = AnnSearchRequest(
    data=[[0.1, 0.2, 0.3]],
    anns_field="vector",
    param={"metric_type": "COSINE"},
    limit=10,
    filter='category == "paper"',
)
results = client.hybrid_search(
    collection_name="book_chunks",
    reqs=[request],
    ranker=None,
    limit=10,
)
print(request.filter)
print(results)
```
