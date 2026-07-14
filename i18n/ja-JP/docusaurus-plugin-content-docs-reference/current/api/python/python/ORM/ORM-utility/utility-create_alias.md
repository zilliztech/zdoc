---
title: "create_alias() | Python | ORM"
slug: /python/python/utility-create_alias
sidebar_label: "create_alias()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の collection のエイリアスを作成します。 | Python | ORM"
type: docx
token: DthMdlg8Lozw89xNz4TcBv1LnOe
sidebar_position: 3
keywords: 
  - Deep Learning
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

この操作は、既存の collection のエイリアスを作成します。

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

    エイリアスを作成する対象の collection の名前。

- **alias** (*str*) -

    **[必須]**

    collection のエイリアス。この操作の前に、そのエイリアスがまだ存在しないことを確認してください。すでに存在する場合は、例外が発生します。

    <Admonition type="info" icon="📘" title="注意">

    collection エイリアスとは？
    
        collection エイリアスは、collection に付けられる追加の名前です。collection エイリアスは、コードを変更することなくアプリケーションを新しい collection に切り替えたい場合に便利です。 
    
        collection エイリアスはグローバルに一意な識別子です。1 つのエイリアスは、必ず 1 つの collection にのみ割り当てることができます。逆に、1 つの collection には複数のエイリアスを持たせることができます。
    
        たとえば、`collection_1` という 1 つの collection があるとします。`create_alias("collection_1", "bob")` と `create_alias("collection_1", "tom")` を呼び出すことで、この collection に 2 つの異なるエイリアス（`bob` と `tom`）を割り当てることができます。

    </Admonition>

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが返るか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

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

