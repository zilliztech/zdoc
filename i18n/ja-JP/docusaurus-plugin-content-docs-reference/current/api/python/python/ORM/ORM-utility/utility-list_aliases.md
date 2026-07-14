---
title: "list_aliases() | Python | ORM"
slug: /python/python/utility-list_aliases
sidebar_label: "list_aliases()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection に存在するすべての alias を一覧表示します。 | Python | ORM"
type: docx
token: XBwxdP96Go8ITyx7UuNcL7EonPd
sidebar_position: 22
keywords: 
  - ベクターストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - ベクトルデータベース オープンソース
  - zilliz
  - zilliz cloud
  - クラウド
  - list_aliases()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_aliases()

この操作は、特定の collection に存在するすべての alias を一覧表示します。

## Request Syntax\{#request-syntax}

```python
list_aliases(
    collection_name: str,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    alias を一覧表示する対象の collection 名。

- **using** (*str*) - 

    使用する接続の alias。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*list*

**RETURNS:**

指定した collection の alias のリスト。collection に alias がない場合は、空のリストが返されます。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

- **BaseException**

    この操作が失敗した場合に、この例外が発生します。

## Examples\{#examples}

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

## Related operations\{#related-operations}

以下の操作は `drop_alias()` に関連しています。

- [alter_alias()](./utility-alter_alias)

- [create_alias()](./utility-create_alias)

- [drop_alias()](./utility-drop_alias)

