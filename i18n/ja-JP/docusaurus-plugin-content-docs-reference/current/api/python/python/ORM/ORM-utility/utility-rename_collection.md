---
title: "rename_collection() | Python | ORM"
slug: /python/python/utility-rename_collection
sidebar_label: "rename_collection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションの名前を変更し、必要に応じてそのコレクションを新しいデータベースに移動します。 | Python | ORM"
type: docx
token: M0qRdF1cLokrxvxyrXScJ64FnEe
sidebar_position: 37
keywords: 
  - ハルシネーション llm
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - zilliz
  - zilliz cloud
  - クラウド
  - rename_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# rename_collection()

この操作は、既存のコレクションの名前を変更し、必要に応じてそのコレクションを新しいデータベースに移動します。

<Admonition type="info" title="Notes">

対象のコレクションに対して作成されたエイリアスは、この操作の後もそのまま維持されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
rename_collection(
    old_collection_name: str,
    new_collection_name: str,
    new_db_name: str = "default",
    timeout: float | None,
    using: str = "default",
)
```

**パラメーター:**

- **old_collection_name** (*str*) -

    **[REQUIRED]**
    対象のコレクションの元の名前です。

    存在しないコレクションを指定すると、**MilvusException** が発生します。

- **new_collection_name** (*str*) -

    **[REQUIRED]**

    この操作後の対象のコレクションの名前です。

    これを **old_collection_name** と同じ値に設定すると、**MilvusException** が発生します。

- **new_db_name** (*str*) -

    この操作後にコレクションが属するデータベースの名前です。

    デフォルト値は **default** です。この操作の前にコレクションが属していたデータベースとは異なるデータベースにこれを設定すると、そのコレクションは指定したデータベースに移動されます。

    存在しないデータベースを指定すると、**MilvusException** が発生します。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定されたエイリアスが存在しない場合に発生します。

## 例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Renames a collection
utility.rename_collection(
    old_collection_name="test_collection_1",
    new_collection_name="test_collection_2",
)

# Renames a collection and moves it to a new database
utility.rename_collection(
    old_collection_name="test_collection_1",
    new_collection_name="test_collection_2",
    new_db_name="new_database"
)
```

## 関連する操作\{#related-operations}

以下の操作は `rename_collection()` に関連しています。

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)
