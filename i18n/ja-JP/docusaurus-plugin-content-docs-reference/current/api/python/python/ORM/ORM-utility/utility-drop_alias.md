---
title: "drop_alias() | Python | ORM"
slug: /python/python/utility-drop_alias
sidebar_label: "drop_alias()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は指定された collection の alias を削除します。 | Python | ORM"
type: docx
token: V7BWdrC39oPAauxoWBzcaldwnVc
sidebar_position: 9
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - 動画重複排除
  - 動画類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - drop_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_alias()

この操作は、指定された[collection ](./ORM-Collection)alias を削除します。 

## リクエスト構文\{#request-syntax}

```python
drop_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

**パラメータ:**

- **alias** (*str*) -

    **[必須]**

    削除する alias。

    <Admonition type="info" icon="📘" title="Notes">

    alias を削除する際、1 つの alias は厳密に 1 つの collection にしか割り当てられないため、collection 名を指定する必要はありません。したがって、サーバーは指定された alias がどの collection に属しているかを認識しています。

    </Admonition>

- **using** (*str*) - 

    使用する接続の alias。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが返るか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合にこの例外が発生します。

- **BaseException**

    この操作が失敗した場合にこの例外が発生します。

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

# Drop the alias bob
utility.drop_alise(alias="bob")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['tom']
```

## 関連する操作\{#related-operations}

以下の操作は `drop_alias()` に関連しています。

- [alter_alias()](./utility-alter_alias)

- [create_alias()](./utility-create_alias)

- [list_aliases()](./utility-list_aliases)

