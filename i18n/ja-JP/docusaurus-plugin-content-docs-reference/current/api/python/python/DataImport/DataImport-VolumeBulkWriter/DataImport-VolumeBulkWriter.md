---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "接続とローカル出力パスの動作を追加します。 | Python"
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

接続とローカル出力パスの動作を追加します。

## Request Syntax\{#request-syntax}

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
    connect_type: ConnectType = ConnectType.AUTO,
    **kwargs,
)
```

**PARAMETERS:**

- **schema** (*CollectionSchema*) -<br/>
  **[REQUIRED]**<br/>
  行の検証とバルクファイルの生成に使用される collection スキーマです。

- **remote_path** (*str*) -<br/>
  **[REQUIRED]**<br/>
  コミット済みファイルがアップロードされる、ターゲット volume 内のディレクトリです。

- **cloud_endpoint** (*str*) -<br/>
  **[REQUIRED]**<br/>
  `https://api.cloud.zilliz.com` である Zilliz Cloud API サーバーのエンドポイントです。

- **api_key** (*str*) -<br/>
  **[REQUIRED]**<br/>
  Zilliz Cloud で認証するために使用される API key です。

- **volume_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  対象の Zilliz Cloud volume の名前です。

- **chunk_size** (*int*) -<br/>
  デフォルト: `1024 * MB`<br/>
  writer が新しいファイルの作成を開始する前の、ローカルチャンクの最大サイズ（バイト単位）です。

- **file_type** ([BulkFileType](./DataImport-BulkFileType)) -<br/>
  デフォルト: `BulkFileType.PARQUET`<br/>
  writer によって生成されるバルクファイル形式です。

- **config** (*Optional[dict]*) -<br/>
  デフォルト: `None`<br/>
  任意の writer 設定です。

- **connect_type** (*ConnectType*) -<br/>
  デフォルト: `ConnectType.AUTO`<br/>
  volume 操作に使用される接続モードです。

- **kwargs** (*Any*) -<br/>
  `LocalBulkWriter` に転送される追加オプションです。

**RETURN TYPE:**

*VolumeBulkWriter*

**RETURNS:**

バルクファイルをローカルにステージングし、コミット済みファイルを設定済みの Zilliz Cloud volume にアップロードする writer です。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーエラーメッセージを確認してください。

## Examples\{#examples}

この例では、VolumeBulkWriter の使用方法を示します。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
