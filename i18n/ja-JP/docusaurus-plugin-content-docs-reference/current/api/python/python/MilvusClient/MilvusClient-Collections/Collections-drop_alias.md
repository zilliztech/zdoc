---
title: "drop_alias() | Python | MilvusClient"
slug: /python/python/Collections-drop_alias
sidebar_label: "drop_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection alias を削除します。 | Python | MilvusClient"
type: docx
token: FpWXdmIuforYz9xUCsqclyCXnLe
sidebar_position: 10
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - llm hallucinations
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

この操作は、指定された collection alias を削除します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、Dedicated serving cluster と on-demand compute に適用されます。 

- serving cluster 内の collection の場合は、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 内の collection の場合は、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

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

    collection の alias。 

    この操作の前に、その alias が存在することを確認してください。存在しない場合は例外が発生します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に送出される例外です。特に、`alias` に存在しない alias を設定した場合に発生します。

- **BaseException**

    この操作が失敗した場合に送出される例外です。

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

