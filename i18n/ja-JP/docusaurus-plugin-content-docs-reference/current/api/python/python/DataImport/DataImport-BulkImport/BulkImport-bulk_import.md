---
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この関数は、オープンソースの Milvus または Zilliz Cloud に対して一括インポートジョブを送信します。これには、プロジェクトデータベース向けの project/region ルーティングが含まれます。 | Python"
type: docx
token: HVwRdVSbAo2jUexpxmdczdqPnzh
sidebar_position: 1
keywords: 
  - ベクトル埋め込みとは
  - vector database tutorial
  - ベクトルデータベースはどのように動作するか
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - bulk_import()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# bulk_import()

この関数は、オープンソースの Milvus または Zilliz Cloud に対して一括インポートジョブを送信します。これには、プロジェクトデータベース向けの project/region ルーティングが含まれます。

## リクエスト構文\{#request-syntax}

```python
bulk_import(
    url: str,
    collection_name: str,
    db_name: str = "",
    files: list[list[str]] | None = None,
    object_url: str = "",
    object_urls: list[list[str]] | None = None,
    cluster_id: str = "",
    api_key: str = "",
    access_key: str = "",
    secret_key: str = "",
    token: str = "",
    volume_name: str = "",
    data_paths: list[list[str]] | None = None,
    
    project_id: str = "",
    region_id: str = "",
    
    verify: bool | str = True,
    cert: str | tuple | None = None,
    **kwargs,
)
```

**パラメーター:**

- **url** (*str*) -

    **[REQUIRED]**

    Milvus または Zilliz Cloud の一括インポート API 用サーバーエンドポイント。

- **collection_name** (*str*) -

    **[REQUIRED]**

    対象の collection 名。

- **db_name** (*str*) -

    対象のデータベース名。

- **files** (*list[list[str]]*) -

    インポート用のローカルファイルグループ。

- **object_url** (*str*) -

    クラウドインポート用のオブジェクトストレージ URL。

- **object_urls** (*list[list[str]]*) -

    クラウドインポート用のオブジェクトストレージ URL グループ。

- **cluster_id** (*str*) -

    インポートジョブ用のクラウド cluster ID。

- **access_key** (*str*) -

    オブジェクトストレージの access key。

- **secret_key** (*str*) -

    オブジェクトストレージの secret key。

- **token** (*str*) -

    オブジェクトストレージアクセス用の一時セッショントークン。

- **volume_name** (*str*) -

    ボリュームベースのインポート用 volume 名。

- **data_paths** (*list[list[str]]*) -

    データファイルの volume 相対パス。

- **project_id** (*str*) -

    有効な Zilliz Cloud project ID。 

    これは、オンデマンドコンピュート用データベースに一括インポートする場合に適用されます。

- **region_id** (*str*) -

    有効な Zilliz Cloud region ID。

    これは、オンデマンドコンピュート用データベースに一括インポートする場合に適用されます。

- **verify** (*bool | str*) -

    TLS 検証設定。

- **cert** (*str | tuple*) -

    クライアント証明書パス、または `(cert, key)` タプル。

- **kwargs** (*dict*) -

    `partition_name` や `options` などのオプションフィールド。

**戻り値の型:**
*requests.Response*

インポートジョブ作成レスポンスを返します。

作成されたインポートジョブのメタデータを含む HTTP レスポンス。

**例外:**

- **MilvusException**

    リクエスト送信に失敗した場合、またはサーバーがジョブを拒否した場合に発生します。

## 例\{#examples}

```python
from pymilvus.bulk_writer import bulk_import

resp = bulk_import(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    collection_name="book_catalog",
    files=[
        ["s3://demo-bucket/books/part-0001.parquet"],
        ["s3://demo-bucket/books/part-0002.parquet"],
    ],
    access_key="AKIA...",
    secret_key="SECRET...",
)

print(resp.json())
```

<include  target="milvus">

```python
from pymilvus.bulk_writer import bulk_import

resp = bulk_import(
    url="https://YOUR_CLUSTER_ENDPOINT",
    api_key="username:password", # replace this with your actual credentials
    collection_name="book_catalog",
    files=[
        ["s3://demo-bucket/books/part-0001.parquet"],
        ["s3://demo-bucket/books/part-0002.parquet"],
    ],
    access_key="AKIA...",
    secret_key="SECRET...",
)

print(resp.json())
```

</include>
