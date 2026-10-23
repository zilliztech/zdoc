---
title: "VolumeBulkWriter | Python"
slug: /python/python/DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "VolumeBulkWriter インスタンスは、一括インポート用にローカルデータをファイルとして Zilliz Cloud のボリュームに書き込みます。 | Python"
type: docx
token: KOiCdsfhvoyfgdxbzbFcZOHmnXf
sidebar_position: 3
keywords: 
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - 密な埋め込み
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

VolumeBulkWriter インスタンスは、一括インポート用にローカルデータをファイルとして Zilliz Cloud のボリュームに書き込みます。

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

- **スキーマ** (*CollectionSchema*) -

    一括ファイルの書き込み対象となるコレクションのスキーマです。

- **remote_path** (*str*) -

    コミット済みの一括ファイルをアップロードする、ボリューム内のリモートディレクトリパスです。

- **cloud_endpoint** (*str*) -

    Zilliz Cloud ボリュームのエンドポイントです。

- **api_key** (*str*) -

    Zilliz Cloud ボリュームへの認証に使用する認証情報です。

- **volume_name** (*str*) -

    コミット済みファイルを受け取る Zilliz Cloud ボリュームの名前です。

- **chunk_size** (*int*) -

    ローカルの一括ファイル 1 つあたりの最大サイズ（バイト単位）です。デフォルトは 1024 &ast; MB です。

- **file_type** ([BulkFileType](./DataImport-BulkFileType)) -

    ローカルの一括ファイルのファイル形式です。デフォルトは BulkFileType.PARQUET です。

- **config** (*Optional[dict]*) -

    ローカル一括ライターの追加設定を格納する辞書です。

- **connect_type** (*ConnectType*) -

    ボリュームへの接続に使用する接続モードです。デフォルトは ConnectType.AUTO です。

**戻り値の型:**

*VolumeBulkWriter*

**戻り値:**

一括ファイルをローカルでステージングし、コミット済みファイルを設定済みの Zilliz Cloud ボリュームにアップロードするライターです。以下は、返されたインスタンスのメソッドです。

**メソッド:**

- [append_row](./VolumeBulkWriter-append_row) (*method*) -

    1 行をローカルバッファに書き込むメソッドです。コミット前に繰り返し呼び出してください。

- [commit](./VolumeBulkWriter-commit) (*method*) -

    ステージングされたローカルの一括ファイルをシールし、設定済みのボリュームにアップロードするメソッドです。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus.bulk_writer import VolumeBulkWriter, UploadPolicy

writer = VolumeBulkWriter(
    bucket_name="my-bucket",
    path="s3://my-bucket/import",
    upload_policy=UploadPolicy.SKIP_IF_EXISTS,
)
writer.append_row(
    {"id": 1, "vector": [0.1, 0.2]},
)
writer.commit()
```
