---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "接続およびローカル出力パスの動作を追加します。 | Python"
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

接続およびローカル出力パスの動作を追加します。

## リクエスト構文\{#request-syntax}

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

**パラメータ:**

- **schema** (*CollectionSchema*) -<br/>
  **[REQUIRED]**<br/>
  行を検証し、bulk ファイルを生成するために使用される collection スキーマ。

- **remote_path** (*str*) -<br/>
  **[REQUIRED]**<br/>
  コミットされたファイルのアップロード先となる、対象 volume 内のディレクトリ。

- **cloud_endpoint** (*str*) -<br/>
  **[REQUIRED]**<br/>
  `https://api.cloud.zilliz.com` である Zilliz Cloud API サーバーのエンドポイント。

- **api_key** (*str*) -<br/>
  **[REQUIRED]**<br/>
  Zilliz Cloud で認証するために使用される API key。

- **volume_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  対象の Zilliz Cloud volume の名前。

- **chunk_size** (*int*) -<br/>
  デフォルト: `1024 * MB`<br/>
  writer が新しいファイルの作成を開始する前の、ローカル chunk の最大サイズ（バイト単位）。

- **file_type** ([BulkFileType](./DataImport-BulkFileType)) -<br/>
  デフォルト: `BulkFileType.PARQUET`<br/>
  writer によって生成される bulk ファイル形式。

- **config** (*Optional[dict]*) -<br/>
  デフォルト: `None`<br/>
  オプションの writer 設定。

- **connect_type** (*ConnectType*) -<br/>
  デフォルト: `ConnectType.AUTO`<br/>
  volume 操作に使用される接続モード。

- **kwargs** (*Any*) -<br/>
  `LocalBulkWriter` に転送される追加オプション。

**戻り値の型:**

*VolumeBulkWriter*

**戻り値:**

bulk ファイルをローカルにステージングし、コミットされたファイルを設定済みの Zilliz Cloud volume にアップロードする writer。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

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
