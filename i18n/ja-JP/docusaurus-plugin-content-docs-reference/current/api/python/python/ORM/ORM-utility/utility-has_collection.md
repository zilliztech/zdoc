---
title: "has_collection() | Python | ORM"
slug: /python/python/utility-has_collection
sidebar_label: "has_collection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection が存在するかどうかを確認します。 | Python | ORM"
type: docx
token: TWOxdwDYRo4CCHxDdZbc7IOznCg
sidebar_position: 17
keywords: 
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - has_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_collection()

この操作は、collection が存在するかどうかを確認します。

## リクエスト構文\{#request-syntax}

```python
has_collection(
    collection_name: str,
    using: str = "default",
    timeout: float | None,
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**
    既存の collection の名前。

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*bool*

**戻り値:**
指定された partition が存在するかどうかを示すブール値です。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定されたエイリアスが存在しない場合に発生します。

## 例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Check whether a partition exists
collection.has_collection(
    collection_name="test_collection",
) # True
```

## 関連する操作\{#related-operations}

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

