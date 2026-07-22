---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "埋め込みの AnnSearchRequest パラメータのドキュメントと例を更新します。Async バリアントは sync と同じパラメータ契約を共有します。filter を expr のエイリアスとして、および相互排他の検証を文書化します。読み取り専用の filter プロパティをインラインで文書化します。これは request.filter としてアクセスし、request.filter() ではありません。 | Python | MilvusClient"
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

埋め込みの AnnSearchRequest パラメータのドキュメントと例を更新します。Async バリアントは sync と同じパラメータ契約を共有します。filter を expr のエイリアスとして、および相互排他の検証を文書化します。読み取り専用の filter プロパティをインラインで文書化します。これは request.filter としてアクセスし、request.filter() ではありません。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、Dedicated serving cluster と on-demand compute にのみ適用されます。 

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
検索する collection の名前。

- **reqs** (*List[AnnSearchRequest]*) -
**[REQUIRED]**
hybrid search で組み合わせる vector 検索リクエスト。

- **ranker** (*Union[BaseRanker, Function]*) -
**[REQUIRED]**
検索リクエストからの結果を組み合わせて順序付けするために使用される ranker。

- **limit** (*int*) -
Default: `10`
返すレコードの最大数。`topk` とも呼ばれます。

- **output_fields** (*Optional[List[str]]*) -
Default: `None`
各検索結果に含める scalar fields。

- **timeout** (*Optional[float]*) -
Default: `None`
RPC を待機する最大時間（秒）。省略した場合、クライアントはサーバーが応答するかエラーが発生するまで待機します。

- **partition_names** (*Optional[List[str]]*) -
Default: `None`
検索する partition の名前。

- **kwargs** (*Any*) -
ページネーションの offset や consistency level を含む追加の検索オプション。

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

各リクエストの expression または filter を適用した後の、結合された ANN リクエストの検索結果。

**EXCEPTIONS:**

- **MilvusException**
サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

hybrid search の使用方法を示します。

```python
from pymilvus import AnnSearchRequest, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
request = AnnSearchRequest(data=[[0.1, 0.2, 0.3]], anns_field="vector", param={"metric_type": "COSINE"}, limit=10, filter='category == "paper"')
results = client.hybrid_search(collection_name="book_chunks", reqs=[request], ranker=None, limit=10)
print(request.filter)
print(results)
```
