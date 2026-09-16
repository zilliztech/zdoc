---
title: "drop_alias() | Python | ORM"
slug: /python/python/utility-drop_alias
sidebar_label: "drop_alias()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクションのエイリアスを削除します。 | Python | ORM"
type: docx
token: V7BWdrC39oPAauxoWBzcaldwnVc
sidebar_position: 9
keywords: 
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画の類似検索
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

この操作は、指定された[コレクション](./ORM-Collection)のエイリアスを削除します。

## リクエスト構文\{#request-syntax}

```python
drop_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

**パラメーター:**

- **alias** (*str*) -

    **[必須]**

    削除するエイリアス。

    <Admonition type="info" title="Notes">

    エイリアスを削除する際は、1 つのエイリアスは厳密に 1 つのコレクションにしか割り当てられないため、コレクション名を指定する必要はありません。したがって、サーバーは指定されたエイリアスがどのコレクションに属しているかを把握しています。

    </Admonition>

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

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
