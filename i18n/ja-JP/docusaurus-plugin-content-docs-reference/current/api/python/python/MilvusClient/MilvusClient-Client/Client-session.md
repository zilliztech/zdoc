---
title: "session() | Python | MilvusClient"
slug: /python/python/Client-session
sidebar_label: "session()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のオンデマンドクラスターにバインドされた軽量な DQL セッションを作成します。セッションを通じて実行されるすべての操作には、対象の `clusterid` が自動的に含まれ、マルチクラスター デプロイメントでリクエストが正しいクラスターにルーティングされることを保証します。 | Python | MilvusClient"
type: docx
token: UASmdlcqvojCe4xNY94cz9Wznyh
sidebar_position: 4
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - session()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# session()

この操作は、特定のオンデマンドクラスターにバインドされた軽量な DQL セッションを作成します。セッションを通じて実行されるすべての操作には、対象の `cluster_id` が自動的に含まれ、マルチクラスター デプロイメントでリクエストが正しいクラスターにルーティングされることを保証します。

<Admonition type="info" icon="📘" title="注意">

このメソッドはオンデマンドコンピュートにのみ適用されます。たとえば `https://{project-id}.{region}.api.zillizcloud.com` のようなプロジェクトエンドポイントで `MilvusClient` を作成し、対象のオンデマンドクラスター ID を `session()` に渡してください。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
MilvusClient.session(
    cluster_id: str
) -> MilvusClientSession
```

**パラメータ:**

- **cluster_id** (*str*) -

    **[必須]**

    対象のオンデマンドクラスターの識別子です。値は空でない文字列である必要があります。

**戻り値の型:**

*MilvusClientSession*

指定されたオンデマンドクラスターに search、query、および get 操作をプロキシするセッションオブジェクトです。

**例外:**

- **ParamError**

    `cluster_id` が文字列でない、または空の場合に発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{proj-xxxxxxxx}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY"
)

# Create a session pinned to cluster-1
session = client.session(
    cluster_id="my_on_demand"
)

# All operations through this session automatically target my_on_demand
results = session.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    limit=5
)

# Session supports search, hybrid_search, query, query_iterator,
# search_iterator, and get
entities = session.get(
    collection_name="my_collection",
    ids=[1, 2, 3]
)
```
