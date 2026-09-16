---
title: "create_alias() | Python | MilvusClient"
slug: /python/python/Collections-create_alias
sidebar_label: "create_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションのエイリアスを作成します。 | Python | MilvusClient"
type: docx
token: Kqlodu0AWoefKvxczcxc1c36nlf
sidebar_position: 4
keywords: 
  - オープンソースのベクトルデータベース
  - オープンソースのベクトル DB
  - ベクトルデータベースの例
  - RAG 用ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - create_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_alias()

この操作は、既存のコレクションのエイリアスを作成します。

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
create_alias(
    collection_name: str,
    alias: str,
    timeout: float | None
) -> None
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    エイリアスを作成する対象のコレクションの名前。

- **alias** (*str*) -

    **[REQUIRED]**

    コレクションのエイリアス。この操作を行う前に、エイリアスがまだ存在していないことを確認してください。すでに存在する場合、例外が発生します。

    <Admonition type="info" title="Note">

    コレクションエイリアスとは何ですか？
    
        コレクションエイリアスは、コレクションの追加の名前です。コレクションエイリアスは、コードを一切変更せずにアプリケーションを新しいコレクションに切り替えたい場合に便利です。 
    
        Zilliz Cloud では、コレクションエイリアスはグローバルに一意な識別子です。1 つのエイリアスは、厳密に 1 つのコレクションにのみ割り当てることができます。逆に、1 つのコレクションは複数のエイリアスを持つことができます。
    
        以下は、あるコレクションのエイリアスを別のコレクションに再割り当てする例です。
    
        `collection_1` と `collection_2` の 2 つのコレクションがあるとします。また、`bob` という名前のコレクションエイリアスがあり、これはもともと `collection_1` に割り当てられていました。
    
        - `collection_1` のエイリアス = ["bob"]
    
        - `collection_2` のエイリアス = []
    
        `alter_alias("collection_2", "bob")` を呼び出した後:
    
        - `collection_1` のエイリアス = []
    
        - `collection_2` のエイリアス = ["bob"]

    </Admonition>

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。特に、`alias` を既存のエイリアスに設定した場合に発生します。

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
```

## 関連メソッド\{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [describe_alias()](./Collections-describe_alias)

- [drop_alias()](./Collections-drop_alias)

- [list_aliases()](./Collections-list_aliases)

