---
title: "describe_alias() | Python | MilvusClient"
slug: /python/python/Collections-describe_alias
sidebar_label: "describe_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はエイリアスの詳細を表示します。 | Python | MilvusClient"
type: docx
token: HN7nddgueo3scIxmPXAcpjkFnDf
sidebar_position: 8
keywords: 
  - ハイブリッド検索
  - 語彙検索
  - 最近傍探索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - describe_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_alias()

この操作はエイリアスの詳細を表示します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、Dedicated serving cluster と on-demand compute に適用されます。 

- serving cluster 内の collection に対しては、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 内の collection に対しては、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
describe_alias(
    alias: str,
    timeout: Optional[float] = None
) -> dict
```

**パラメータ:**

- **alias** (*str*) -

    **[REQUIRED]**

    collection のエイリアス。 

    この操作の前に、エイリアスが存在することを確認してください。存在しない場合は、例外が発生します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*Dict*

**戻り値:**

エイリアスの詳細を含む辞書。

```python
{
    alias: 'string',
    collection_name: 'string',
    db_name: 'default'
}
```

**パラメータ:**

- **alias** (*str*) -

    指定されたエイリアス。 

- **collection_name** (*str*) -

    バインドされている collection の名前。 

- **db_name** (*str*) -

    バインドされている collection が属するデータベース。 

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。特に、`alias` を存在しないエイリアスに設定した場合に発生します。

- **BaseException**

    この操作が失敗した場合に、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection", alias="test")

# 4. Describe the alias
client.describe_alias(alias="test")

# {
#     'alias': 'test', 
#     'collection_name': 'test_collection', 
#     'db_name': 'default'
# }
```

## 関連メソッド\{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [create_alias()](./Collections-create_alias)

- [drop_alias()](./Collections-drop_alias)

- [list_aliases()](./Collections-list_aliases)

