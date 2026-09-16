---
title: "list_collections() | Python | MilvusClient"
slug: /python/python/Collections-list_collections
sidebar_label: "list_collections()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のすべてのコレクションを一覧表示します。 | Python | MilvusClient"
type: docx
token: BHyidrVcyoPwxexHLrnceOSAnRe
sidebar_position: 17
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - クラウド
  - list_collections()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_collections()

この操作は、既存のすべてのコレクションを一覧表示します。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated serving クラスターとオンデマンドコンピュートに適用されます。 

- serving クラスター内のコレクションの場合は、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート内のコレクションの場合は、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
list_collections(**kwargs) -> Name
```

**パラメーター:**

- **kwargs** -

    - **timeout** (*float* | *None*) -

        この操作のタイムアウト時間です。 

        これを **None** に設定すると、いずれかのレスポンスが返されるかエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*list*

**戻り値:**

コレクション名のリストです。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. List collections
client.list_collections() 

# ['test_collection']
```

