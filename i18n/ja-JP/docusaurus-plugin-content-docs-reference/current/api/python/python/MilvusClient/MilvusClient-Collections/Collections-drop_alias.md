---
title: "drop_alias() | Python | MilvusClient"
slug: /python/python/Collections-drop_alias
sidebar_label: "drop_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクションのエイリアスを削除します。 | Python | MilvusClient"
type: docx
token: FpWXdmIuforYz9xUCsqclyCXnLe
sidebar_position: 10
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - LLM のハルシネーション
  - zilliz
  - zilliz cloud
  - クラウド
  - drop_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_alias()

この操作は、指定されたコレクションのエイリアスを削除します。

<Admonition type="info" title="Notes">

このメソッドは、専用の serving クラスターとオンデマンドコンピュートに適用されます。 

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
drop_alias(
    alias: str,
    timeout: float | None
) -> None
```

**パラメーター:**

- **alias** (*str*) -

    **[REQUIRED]**

    コレクションのエイリアス。 

    この操作の前に、エイリアスが存在することを確認してください。存在しない場合は例外が発生します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。特に、`alias` を存在しないエイリアスに設定した場合に発生します。

- **BaseException**

    この例外は、この操作が失敗した場合に発生します。

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

# 4. Drop the alias
client.drop_alias(alias="test")
```

## 関連メソッド\{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [create_alias()](./Collections-create_alias)

- [describe_alias()](./Collections-describe_alias)

- [list_aliases()](./Collections-list_aliases)

