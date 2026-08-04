---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "埋め込み AnnSearchRequest パラメータのドキュメントと例を更新します。非同期バリアントは同期版と同じパラメータ契約を共有します。filter を expr のエイリアスとして、および相互排他のバリデーションを文書化します。読み取り専用の filter プロパティをインラインで文書化します。これは request.filter としてアクセスし、request.filter() ではありません。 | Python | MilvusClient"
type: docx
token: Iv1PdIVxYoDOMax47xDcLnbEnXb
sidebar_position: 9
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
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

埋め込み AnnSearchRequest パラメータのドキュメントと例を更新します。非同期バリアントは同期版と同じパラメータ契約を共有します。filter を expr のエイリアスとして、および相互排他のバリデーションを文書化します。読み取り専用の filter プロパティをインラインで文書化します。これは `request.filter` としてアクセスし、`request.filter()` ではありません。

<Admonition type="info" icon="📘" title="注意">

このメソッドは dedicated serving cluster と on-demand compute にのみ適用されます。 

- serving cluster の collection でこの操作を行うには、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用の collection でこの操作を行うには、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のために on-demand cluster にアタッチするセッションを作成してください。

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
    **kwargs,
) -> SearchResult
```

**PARAMETERS:**

- **collection_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  検索する collection の名前。

- **reqs** (*List[AnnSearchRequest]*) -<br/>
  **[REQUIRED]**<br/>
  ハイブリッド検索で組み合わせる ANN 検索リクエスト。各リクエストは `AnnSearchRequest(data, anns_field, param, limit, expr=None, expr_params=None, filter=None)` を使って構築します。

    - **data** (*Union[List, SparseMatrixInputType]*) -<br/>
      **[REQUIRED]**<br/>
      この ANN 検索リクエストで使用するクエリ vector または疎行列。

    - **anns_field** (*str*) -<br/>
      **[REQUIRED]**<br/>
      検索対象の vector field の名前。

    - **param** (*Dict*) -<br/>
      **[REQUIRED]**<br/>
      metric type や検索固有の設定などの ANN 検索パラメータ。

    - **limit** (*int*) -<br/>
      **[REQUIRED]**<br/>
      この ANN 検索リクエストで返される一致結果の最大数。

    - **expr** (*Optional[str]*) -<br/>
      Default: `None`<br/>
      ANN 検索の前に適用されるブールフィルタリング式。`expr` と `filter` の両方を指定しないでください。

    - **expr_params** (*Optional[dict]*) -<br/>
      Default: `None`<br/>
      式テンプレートのプレースホルダーに代入される値。

    - **filter** (*Optional[str]*) -<br/>
      Default: `None`<br/>
      `expr` のエイリアスです。両方の値を指定しないでください。解決された式は、読み取り専用の `filter` プロパティを通じて `request.filter` として利用できます。

- **ranker** (*Union[BaseRanker, Function]*) -<br/>
  **[REQUIRED]**<br/>
  検索リクエストからの結果を組み合わせて並べ替えるために使用する ranker。

- **limit** (*int*) -<br/>
  Default: `10`<br/>
  返すレコードの最大数で、`topk` とも呼ばれます。

- **output_fields** (*Optional[List[str]]*) -<br/>
  Default: `None`<br/>
  各検索結果に含める scalar field。

- **timeout** (*Optional[float]*) -<br/>
  Default: `None`<br/>
  RPC を待機する最大時間（秒）。省略した場合、クライアントはサーバーが応答するかエラーが発生するまで待機します。

- **partition_names** (*Optional[List[str]]*) -<br/>
  Default: `None`<br/>
  検索する partition の名前。

- **kwargs** (*Any*) -<br/>
  ページネーションのオフセットや整合性レベルなど、追加の検索オプション。

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

各リクエストの式または filter を適用した後の、結合された ANN リクエストの検索結果。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

この例では、ANN リクエストを構築してハイブリッド検索を実行します。

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
