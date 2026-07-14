---
title: "list_collections() | Python | ORM"
slug: /python/python/utility-list_collections
sidebar_label: "list_collections()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在の接続で使用されているデータベース内のすべてのコレクションを一覧表示します。 | Python | ORM"
type: docx
token: QgxEdfBMSodYo6xCg24cH3hInr4
sidebar_position: 24
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - list_collections()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_collections()

この操作は、現在の接続で使用されているデータベース内のすべてのコレクションを一覧表示します。

## Request Syntax\{#request-syntax}

```python
list_collections(
    timeout: float | None,
    using: str = "default",
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、エラーが発生した時点でこの操作はタイムアウトします。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** であり、この操作がデフォルト接続を使用することを示します。

**RETURN TYPE:**

*list*

**RETURNS:**
コレクション名のリスト。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、特に指定されたエイリアスが存在しない場合に、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import connections, utility

connections.connect()

utility.list_collections()
```

## Related operations\{#related-operations}

以下の操作は `list_collections()` に関連しています。

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [rename_collection()](./utility-rename_collection)

