---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "VolumeBulkWriter は、ローカルの一括ファイルをリモートボリュームに書き込む処理を担当します。 | Python"
type: docx
token: L9ozd33RroJ0NZxHUc0czKjpnbh
sidebar_position: 3
keywords: 
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss ベクトルデータベース
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

VolumeBulkWriter は、ローカルの一括ファイルをリモートボリュームに書き込む処理を担当します。

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

**パラメーター:**

- **スキーマ** (*CollectionSchema*) -<br/>
  **[必須]**<br/>
  行の検証と一括ファイルの生成に使用するコレクションスキーマ。

- **remote_path** (*str*) -<br/>
  **[必須]**<br/>
  コミット済みファイルのアップロード先となる、ターゲットボリューム内のディレクトリ。

- **cloud_endpoint** (*str*) -<br/>
  **[必須]**<br/>
  Zilliz Cloud の API サーバーエンドポイント（`https://api.cloud.zilliz.com`）。

- **api_key** (*str*) -<br/>
  **[必須]**<br/>
  Zilliz Cloud との認証に使用する API キー。

- **volume_name** (*str*) -<br/>
  **[必須]**<br/>
  ターゲットの Zilliz Cloud ボリュームの名前。

- **chunk_size** (*int*) -<br/>
  デフォルト: `1024 * MB`<br/>
  ライターが新しいファイルを開始するまでのローカルチャンクサイズの最大値（バイト単位）。

- **file_type** ([BulkFileType](./DataImport-BulkFileType)) -<br/>
  デフォルト: `BulkFileType.PARQUET`<br/>
  ライターが生成する一括ファイルの形式。

- **config** (*Optional[dict]*) -<br/>
  デフォルト: `None`<br/>
  オプションのライター設定。

- **connect_type** (*ConnectType*) -<br/>
  デフォルト: `ConnectType.AUTO`<br/>
  ボリューム操作に使用する接続モード。

- **kwargs** (*Any*) -<br/>
  `LocalBulkWriter` に転送される追加オプション。

**戻り値の型:**

*VolumeBulkWriter*

**戻り値:**

一括ファイルをローカルにステージングし、コミット済みファイルを設定済みの Zilliz Cloud ボリュームにアップロードするライター。

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
