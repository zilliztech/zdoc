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
  - オープンソース vector db
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

## Request Syntax\{#request-syntax}

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

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    この操作の対象 collection の名前です。

- **files** (*list[str]*) -

    **[REQUIRED]**

    ソースデータを含むファイルへのパスのリストです。 

    <Admonition type="info" icon="📘" title="Note">

    ソースデータファイルはどのように準備できますか？
    
        - ソースデータファイルとして、JSON ファイル（*.json*）または NumPy ファイル一式（*.npy*）を使用できます。
    
            - 有効な JSON ファイルには、ルートキーとして **rows** があり、これは対象 collection のスキーマに一致する各エンティティを表す辞書のリストです。
    
                対象 collection が dynamic field を許可している場合は、各エンティティ辞書に dynamic field とその値を含めてください。
    
            - 有効な NumPy ファイル一式は、対象 collection のスキーマ内の field 名にちなんで命名されている必要があり、その中のデータは対応する field 定義に一致している必要があります。 
    
                対象 collection が dynamic field を許可している場合は、dynamic field とその値を含めるために **&#36;meta.npy** という追加ファイルを作成してください。
    
            ソースデータファイルの準備の詳細については、[ファイルからエンティティを挿入する](https://milvus.io/docs/bulk_insert.md) を参照してください。
    
        - この操作を実行する前に、ソースデータファイルを Milvus 設定の `minio.bucketname` で定義された bucket にアップロードする必要があります。 
    
            例として、Docker Compose を使用してセットアップされた Milvus インスタンスを取り上げ、bucket 名が `a-bucket` であるとします。
    
            - ソースデータファイルをこの bucket にアップロードした場合、**files** リストには拡張子付きのファイル名のみを含める必要があります。たとえば、`files=["id.npy", "vector.npy"]` または `files=["data.json"]` です。
    
            - ソースデータファイルをこの bucket のサブディレクトリにアップロードした場合、bucket からの相対ファイルパスを含める必要があります。たとえば、サブディレクトリが `data` の場合、パラメータ設定は `files=["data/id.npy", "data/vector.py"]` または `files=["data.json"]` である必要があります。
    
        - Milvus インスタンスが使用している MinIO bucket の名前を確認するには、MinIO サーバーにログインして確認してください。 

    </Admonition>

- **partition_name** (*str*) -

    指定された collection 内の partition の名前です。

    これを設定すると、Milvus は指定された partition にデータを一括挿入します。

    存在しない partition の名前をこれに設定すると、**MilvusException** が発生します。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着した時点または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*int*

**RETURNS:**
bulk-insert タスク ID。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Examples\{#examples}

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

## Related operations\{#related-operations}

次の操作は `do_bulk_insert()` に関連しています。

- [BulkInsertState](./utility-BulkInsertState)

- [get_bulk_insert_state()](./utility-get_bulk_insert_state)

- [list_bulk_insert_tasks()](./utility-list_bulk_insert_tasks)

