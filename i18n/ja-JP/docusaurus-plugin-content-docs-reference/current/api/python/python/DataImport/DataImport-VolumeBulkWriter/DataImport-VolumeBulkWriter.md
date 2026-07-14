---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "VolumeBulkWriter インスタンスは、生データを Zilliz Cloud が理解できる形式にローカルで書き換え、その後、生成されたファイルを Zilliz Cloud 内のリモート volume にアップロードします。 | Python"
type: docx
token: L9ozd33RroJ0NZxHUc0czKjpnbh
sidebar_position: 3
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeBulkWriter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

VolumeBulkWriter インスタンスは、生データを Zilliz Cloud が理解できる形式にローカルで書き換え、その後、生成されたファイルを Zilliz Cloud 内のリモート volume にアップロードします。

```python
class pymilvus.bulk_writer.VolumeBulkWriter(LocalBulkWriter)
```

## Constructor\{#constructor}

```python
VolumeBulkWriter(
    schema: CollectionSchema,
    remote_path: str,
    cloud_endpoint: str,
    api_key: str,
    volume_name: str,
    chunk_size: int = 1024 * MB,
    file_type: BulkFileType = BulkFileType.PARQUET,
    config: Optional[dict] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **schema** (*[CollectionSchema](./MilvusClient-CollectionSchema)*) -

    **[REQUIRED]**

    書き換えられたデータのインポート先となるターゲット collection のスキーマです。

- **remote_path** (*str*) -

    **[REQUIRED]**

    書き換えられたデータを格納する、リモート volume 内のディレクトリへのパスです。

- **cloud_endpoint** (*str*) -

    **[REQUIRED]**

    Zilliz Cloud インスタンスのエンドポイント URL です。

- **api_key** (*str*) -

    **[REQUIRED]**

    Zilliz Cloud インスタンスで認証するために使用される API key です。

- **volume_name** (*str*) -

    **[REQUIRED]**

    ファイルのアップロード先となる、Zilliz Cloud 内のリモート volume の名前です。

- **chunk_size** (*int*) -

    ファイルセグメントの最大サイズです。

    生データの書き換え中、Zilliz Cloud はデータをバッチに分割し、各バッチを個別のファイルに保存します。

    デフォルト値はバイト単位で 1,073,741,824、つまり 1 GB です。

- **file_type** (*[BulkFileType](./DataImport-BulkFileType)*) -

    出力ファイルのファイルタイプです。

    デフォルト値は *BulkFileType.PARQUET* です。

- **config** (*dict*) -

    bulk writer 用のオプション設定パラメーターです。

**Notes**

VolumeBulkWriter はコンテキストマネージャーであり、`with` ステートメントで使用できます。コンテキストを抜けると、ローカルの作業ディレクトリはクリーンアップされます。

## Properties\{#properties}

以下は VolumeBulkWriter クラスのプロパティです。

- **data_path** (*str*)

    アップロードされたファイルが保存されているリモートパスを返します。

- **batch_files** (*List[List[str]]*)

    アップロードされたファイルバッチのリストを返します。各内部リストには、1 回の commit でアップロードされたファイルのリモートパスが含まれます。

## Examples\{#examples}

```python
from pymilvus.bulk_writer.volume_bulk_writer import VolumeBulkWriter
from pymilvus import CollectionSchema, FieldSchema, DataType

# Define collection schema
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=128),
]
schema = CollectionSchema(fields, "example_collection")

# Create VolumeBulkWriter
with VolumeBulkWriter(
    schema=schema,
    remote_path="/data/bulk_import",
    cloud_endpoint="https://your-cloud-endpoint.zillizcloud.com",
    api_key="your-api-key",
    volume_name="my-volume",
    chunk_size=1024 * 1024 * 1024,
    file_type=BulkFileType.PARQUET,
) as writer:
    # Append rows
    for i in range(1000):
        writer.append_row({
            "id": i,
            "vector": [0.1] * 128,
        })

    # Commit and upload
    writer.commit()

    print(writer.data_path)
    print(writer.batch_files)
```
