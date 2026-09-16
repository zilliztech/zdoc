---
title: "do_bulk_insert() | Python | ORM"
slug: /python/python/utility-do_bulk_insert
sidebar_label: "do_bulk_insert()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたファイルからデータを一括挿入します。 | Python | ORM"
type: docx
token: BpqpdBWdyoxbmzx0GGCcQxksnBc
sidebar_position: 8
keywords: 
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - オープンソースのベクトル DB
  - ベクトルデータベースの例
  - zilliz
  - zilliz cloud
  - クラウド
  - do_bulk_insert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# do_bulk_insert()

この操作は、指定されたファイルからデータを一括挿入します。

## リクエスト構文\{#request-syntax}

```python
do_bulk_insert(
    collection_name: str,
    files: list,
    partition_name: str | None,
    timeout: float | None,
    using: str = "default",
    **kwargs,
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    この操作の対象コレクションの名前です。

- **files** (*list[str]*) -

    **[必須]**

    ソースデータを含むファイルへのパスのリストです。 

    <Admonition type="info" title="Note">

    ソースデータファイルはどのように準備すればよいですか？
    
        - ソースデータファイルとして、JSON ファイル（*.json*）または NumPy ファイル一式（*.npy*）を含めることができます。
    
            - 有効な JSON ファイルには、**rows** という名前のルートキーがあり、このキーは、対象コレクションのスキーマに一致する各エンティティを表す辞書のリストです。
    
                対象コレクションで dynamic field が許可されている場合は、各エンティティの辞書に dynamic field とその値を含めてください。
    
            - 有効な NumPy ファイル一式は、対象コレクションのスキーマ内のフィールドにちなんで命名する必要があり、それらのデータは対応するフィールド定義に一致している必要があります。 
    
                対象コレクションで dynamic field が許可されている場合は、dynamic field とその値を含めるために **&#36;meta.npy** という名前の追加ファイルを作成してください。
    
            ソースデータファイルの準備の詳細については、[ファイルからエンティティを挿入する](https://milvus.io/docs/bulk_insert.md) を参照してください。
    
        - この操作を実行する前に、ソースデータファイルを、`minio.bucketname` で定義されたバケット（Milvus 設定）にアップロードする必要があります。 
    
            例として、Docker Compose を使用してセットアップされた Milvus インスタンスを取り上げます。この場合、バケット名は `a-bucket` です。
    
            - ソースデータファイルをこのバケットにアップロードする場合は、**files** リストに拡張子付きのファイル名のみを含める必要があります。たとえば、`files=["id.npy", "vector.npy"]` または `files=["data.json"]` です。
    
            - ソースデータファイルをこのバケット内のサブディレクトリにアップロードする場合は、バケットからの相対ファイルパスを含める必要があります。たとえば、サブディレクトリが `data` の場合、パラメーター設定は `files=["data/id.npy", "data/vector.py"]` または `files=["data.json"]` とする必要があります。
    
        - Milvus インスタンスが使用している MinIO バケットの名前を確認するには、MinIO サーバーにログインして確認するだけです。 

    </Admonition>

- **partition_name** (*str*) -

    指定されたコレクション内のパーティションの名前です。

    これを設定すると、Milvus は指定されたパーティションにデータを一括挿入します。

    存在しないパーティションの名前をこれに設定すると、**MilvusException** が発生します。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着したとき、または何らかのエラーが発生したときに、この操作がタイムアウトすることを示します。

**戻り値の型:**

*int*

**戻り値:**
bulk-insert タスク ID。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Bulk-insert data from a set of NumPy files already uploaded to the MioIO server
utility.do_bulk_insert(
    collection_name="test_collection",
    files=["data/id.npy", "data/vector.npy"],
)

# 446781855410073001

# Bulk-insert data from a JSON file already uploaded to the MioIO server
utility.do_bulk_insert(
    collection_name="test_collection",
    files=["data/data.json"],
) 

# 446781855410077319
```

## 関連する操作\{#related-operations}

以下の操作は `do_bulk_insert()` に関連しています。

- [BulkInsertState](./utility-BulkInsertState)

- [get_bulk_insert_state()](./utility-get_bulk_insert_state)

- [list_bulk_insert_tasks()](./utility-list_bulk_insert_tasks)
