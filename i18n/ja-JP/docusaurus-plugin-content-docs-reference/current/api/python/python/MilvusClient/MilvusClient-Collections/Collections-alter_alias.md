---
title: "alter_alias() | Python | MilvusClient"
slug: /python/python/Collections-alter_alias
sidebar_label: "alter_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、あるコレクションのエイリアスを別のコレクションに再割り当てします。 | Python | MilvusClient"
type: docx
token: CBc3d1mrdoYqmDxe4Kcc9zxAnzh
sidebar_position: 1
keywords: 
  - ハイブリッドベクトル検索
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - alter_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_alias()

この操作は、あるコレクションのエイリアスを別のコレクションに再割り当てします。

<Admonition type="info" title="Notes">

このメソッドは、専用の serving クラスターとオンデマンドコンピュートに適用されます。 

- serving クラスター内のコレクションに対しては、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート内のコレクションに対しては、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
alter_alias(
    collection_name: str,
    alias: str,
    timeout: float | None
) -> None
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    エイリアスを再割り当てする対象のコレクションの名前。

- **alias** (*str*) -

    **[REQUIRED]**

    コレクションのエイリアス。なお、このエイリアスは事前に存在している必要があります。

    <Admonition type="info" title="Note">

    コレクションエイリアスとは何ですか？
    
        コレクションエイリアスは、コレクションに対する追加の名前です。コレクションエイリアスは、コードを一切変更せずにアプリケーションを新しいコレクションに切り替えたい場合に便利です。 
    
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

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定されたエイリアスが存在しない場合に発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create two collections
client.create_collection(collection_name="test_collection_1", dimension=5)
client.create_collection(collection_name="test_collection_2", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection_1", alias="test")

# 4. Reassign the alias to the other collection
client.alter_alias(collection_name="test_collection_2", alias="test")
```

## 関連メソッド\{#related-methods}

- [create_alias()](./Collections-create_alias)

- [describe_alias()](./Collections-describe_alias)

- [drop_alias()](./Collections-drop_alias)

- [list_aliases()](./Collections-list_aliases)
