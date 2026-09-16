---
title: "create_alias() | Python | ORM"
slug: /python/python/utility-create_alias
sidebar_label: "create_alias()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションのエイリアスを作成します。 | Python | ORM"
type: docx
token: DthMdlg8Lozw89xNz4TcBv1LnOe
sidebar_position: 3
keywords: 
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
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

この操作は、既存のコレクションのエイリアスを作成します。

## リクエスト構文\{#request-syntax}

```python
create_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

**パラメータ:**

- **collection_name** (*str*) -

    **[必須]**

    エイリアスを作成する対象のコレクションの名前。

- **alias** (*str*) -

    **[必須]**

    コレクションのエイリアス。この操作の前に、そのエイリアスがまだ存在していないことを確認してください。すでに存在する場合は、例外が発生します。

    <Admonition type="info" title="Note">

    コレクションエイリアスとは？
    
        コレクションエイリアスは、コレクションに付ける追加の名前です。コレクションエイリアスは、コードを変更せずにアプリケーションを新しいコレクションに切り替えたい場合に便利です。 
    
        コレクションエイリアスは、グローバルに一意な識別子です。1 つのエイリアスは厳密に 1 つのコレクションにのみ割り当てることができます。逆に、1 つのコレクションには複数のエイリアスを持たせることができます。
    
        1 つのコレクション `collection_1` があるとします。`create_alias("collection_1", "bob")` と `create_alias("collection_1", "tom")` を呼び出すことで、このコレクションに 2 つの異なるエイリアス（`bob` と `tom`）を割り当てることができます。

    </Admonition>

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、特に `alias` に既存のエイリアスを設定した場合に、この例外が発生します。

- **BaseException**

    この操作が失敗した場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections, Collection, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get an existing collection
collection_1 = Collection("collection_1")

# Create an alias for collection_1
utility.create_alias(collection_name="collection_1", alias="bob")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['bob']

# Create another alias for collection_1
utility.create_alias(collection_name="collection_1", alias="tom")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['bob', 'tom']
```

## 関連する操作\{#related-operations}

以下の操作は `create_alias()` に関連しています。

- [alter_alias()](./utility-alter_alias)

- [drop_alias()](./utility-drop_alias)

- [list_aliases()](./utility-list_aliases)

