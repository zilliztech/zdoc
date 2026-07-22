---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "埋め込み AnnSearchRequest パラメータのドキュメントと例を更新します。Async バリアントは sync と同じパラメータ契約を共有します。filter を expr のエイリアスとして、および相互排他の検証について説明します。読み取り専用の filter プロパティをインラインで説明します。これは request.filter としてアクセスし、request.filter() ではありません。 | Python | MilvusClient"
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

埋め込み AnnSearchRequest パラメータのドキュメントと例を更新します。Async バリアントは sync と同じパラメータ契約を共有します。filter を expr のエイリアスとして、および相互排他の検証について説明します。読み取り専用の filter プロパティをインラインで説明します。これは request.filter としてアクセスし、request.filter() ではありません。

<Admonition type="info" icon="📘" title="Notes">

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

- **collection_name** (*str*) -
**[REQUIRED]**
検索する collection の名前です。

- **reqs** (*List[AnnSearchRequest]*) -
**[REQUIRED]**
hybrid search によって組み合わせられる ANN 検索リクエストです。各リクエストは `AnnSearchRequest(data, anns_field, param, limit, expr=None, expr_params=None, filter=None)` で構築します。

    - **data** (*Union[List, SparseMatrixInputType]*) -
**[REQUIRED]**
この ANN 検索リクエストに使用するクエリベクトルまたは疎行列です。

    - **anns_field** (*str*) -
**[REQUIRED]**
検索するベクトルフィールドの名前です。

    - **param** (*Dict*) -
**[REQUIRED]**
メトリックタイプや検索固有の設定などの ANN 検索パラメータです。

    - **limit** (*int*) -
**[REQUIRED]**
この ANN 検索リクエストで返される一致結果の最大数です。

    - **expr** (*Optional[str]*) -
Default: `None`
ANN 検索の前に適用されるブールフィルタリング式です。`expr` と `filter` の両方を指定しないでください。

    - **expr_params** (*Optional[dict]*) -
Default: `None`
式テンプレートのプレースホルダーに代入される値です。

    - **filter** (*Optional[str]*) -
Default: `None`
`expr` のエイリアスです。両方の値を指定しないでください。解決された式は、読み取り専用の `filter` プロパティを通じて `request.filter` として利用できます。

- **ranker** (*Union[BaseRanker, Function]*) -
**[REQUIRED]**
検索リクエストの結果を結合して順序付けするために使用される ranker です。

- **limit** (*int*) -
Default: `10`
返すレコードの最大数で、`topk` とも呼ばれます。

- **output_fields** (*Optional[List[str]]*) -
Default: `None`
各検索結果に含める scalar フィールドです。

- **timeout** (*Optional[float]*) -
Default: `None`
RPC を待機する最大時間（秒）です。省略した場合、クライアントはサーバーが応答するかエラーが発生するまで待機します。

- **partition_names** (*Optional[List[str]]*) -
Default: `None`
検索する partition の名前です。

- **kwargs** (*Any*) -
ページネーションの offset や一貫性レベルを含む追加の検索オプションです。

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

各リクエストの式または filter を適用した後の、結合された ANN リクエストの検索結果です。

**EXCEPTIONS:**

- **MilvusException**
サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

この例では、ANN リクエストを構築して hybrid search を実行します。

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
