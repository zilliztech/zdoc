---
title: "alter_alias() | Python | MilvusClient"
slug: /python/python/Collections-alter_alias
sidebar_label: "alter_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ある collection の alias を別の collection に再割り当てします。 | Python | MilvusClient"
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
  - cloud
  - alter_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_alias()

この操作は、ある collection の alias を別の collection に再割り当てします。

<Admonition type="info" icon="📘" title="Notes">

このメソッドは、Dedicated serving cluster と on-demand compute に適用されます。 

- serving cluster 内の collection については、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 内の collection については、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

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

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    alias を再割り当てする対象 collection の名前。

- **alias** (*str*) -

    **[REQUIRED]**

    collection の alias。なお、この alias は事前に存在している必要があります。

    <Admonition type="info" icon="📘" title="Note">

    collection alias とは何ですか？
    
        collection alias は、collection に対する追加の名前です。collection alias は、コードを変更することなくアプリケーションを新しい collection に切り替えたい場合に便利です。 
    
        Zilliz Cloud では、collection alias はグローバルに一意な識別子です。1 つの alias は、ちょうど 1 つの collection にのみ割り当てることができます。逆に、1 つの collection は複数の alias を持つことができます。
    
        以下は、ある collection の alias を別の collection に再割り当てする例です。
    
        `collection_1` と `collection_2` の 2 つの collection があるとします。また、もともと `collection_1` に割り当てられていた `bob` という名前の collection alias もあるとします。
    
        - `collection_1` の alias = ["bob"]
    
        - `collection_2` の alias = []
    
        `alter_alias("collection_2", "bob")` を呼び出した後:
    
        - `collection_1` の alias = []
    
        - `collection_2` の alias = ["bob"]

    </Admonition>

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、応答が返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定された alias が存在しない場合に発生します。

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

