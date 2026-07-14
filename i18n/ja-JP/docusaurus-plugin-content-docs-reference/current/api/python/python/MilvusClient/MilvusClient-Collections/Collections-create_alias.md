---
title: "create_alias() | Python | MilvusClient"
slug: /python/python/Collections-create_alias
sidebar_label: "create_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の collection に対するエイリアスを作成します。 | Python | MilvusClient"
type: docx
token: Kqlodu0AWoefKvxczcxc1c36nlf
sidebar_position: 4
keywords: 
  - オープンソースのベクトルデータベース
  - オープンソース vector db
  - ベクトルデータベースの例
  - rag vector database
  - zilliz
  - zilliz cloud
  - クラウド
  - create_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_alias()

この操作は、既存の collection に対するエイリアスを作成します。

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
create_alias(
    collection_name: str,
    alias: str,
    timeout: float | None
) -> None
```

**パラメータ:**

- **collection_name** (*str*) -

    **[必須]**

    エイリアスを作成する対象の collection の名前。

- **alias** (*str*) -

    **[必須]**

    collection のエイリアス。この操作を行う前に、エイリアスがまだ存在していないことを確認してください。すでに存在する場合、例外が発生します。

    <Admonition type="info" icon="📘" title="注">

    collection エイリアスとは何ですか？
    
        collection エイリアスは、collection の追加名です。collection エイリアスは、コードを一切変更せずにアプリケーションを新しい collection に切り替えたい場合に便利です。 
    
        Zilliz Cloud では、collection エイリアスはグローバルに一意な識別子です。1 つのエイリアスは、厳密に 1 つの collection にしか割り当てられません。逆に、1 つの collection は複数のエイリアスを持つことができます。
    
        以下は、ある collection のエイリアスを別の collection に再割り当てする例です。
    
        `collection_1` と `collection_2` の 2 つの collection があるとします。また、`bob` という名前の collection エイリアスがあり、これはもともと `collection_1` に割り当てられていました。
    
        - `collection_1`'s alias = ["bob"]
    
        - `collection_2`'s alias = []
    
        `alter_alias("collection_2", "bob")` を呼び出した後:
    
        - `collection_1`'s alias = []
    
        - `collection_2`'s alias = ["bob"]

    </Admonition>

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合にこの例外が発生します。特に、`alias` を既存のエイリアスに設定した場合に発生します。

- **BaseException**

    この操作が失敗した場合にこの例外が発生します。

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

