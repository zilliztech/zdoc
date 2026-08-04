---
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "projectid/regionid ルーティングと project-database インポート動作を追加します。 | Python"
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

project_id/region_id ルーティングと project-database インポート動作を追加します。

## Request Syntax\{#request-syntax}

```python
bulk_import(
    url: str,
    collection_name: str,
    db_name: str = "",
    object_url: str = "",
    object_urls: Optional[List[List[str]]] = None,
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    access_key: str = "",
    secret_key: str = "",
    token: str = "",
    volume_name: str = "",
    data_paths: Optional[List[List[str]]] = None,
    verify: Optional[Union[bool, str]] = True,
    cert: Optional[Union[str, tuple]] = None,
    **kwargs,
) -> requests.Response
```

**PARAMETERS:**

- **url** (*str*) -<br/>
  **[REQUIRED]**

    Zilliz Cloud API サーバーのエンドポイントです。`https://api.cloud.zilliz.com` を指定します。

- **collection_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  対象 collection の名前です。

- **db_name** (*str*) -<br/>
  Default: `""`<br/>
  対象 database の名前です。

- **object_url** (*str*) -<br/>
  Default: `""`<br/>
  非推奨の object-storage URL です。新しい Zilliz Cloud 統合では `object_urls` を使用してください。

- **object_urls** (*Optional[List[List[str]]]*) -<br/>
  Default: `None`<br/>
  インポートデータを含む object-storage URL です。各ネストされたリストは 1 つのオブジェクトまたはフォルダを識別します。

- **cluster_id** (*str*) -<br/>
  Default: `""`<br/>
  対象 Zilliz Cloud cluster の ID です。

- **project_id** (*str*) -<br/>
  Default: `""`<br/>
  対象 project database を含む Zilliz Cloud project の ID です。

- **region_id** (*str*) -<br/>
  Default: `""`<br/>
  対象 project database を含む Zilliz Cloud region の ID です。

- **api_key** (*str*) -<br/>
  Default: `""`

    リクエストの認証に使用する Zilliz Cloud API key です。

- **access_key** (*str*) -<br/>
  Default: `""`<br/>
  Zilliz Cloud が使用する object-storage 認証情報の access key です。

- **secret_key** (*str*) -<br/>
  Default: `""`<br/>
  Zilliz Cloud が使用する object-storage 認証情報の secret key です。

- **token** (*str*) -<br/>
  Default: `""`<br/>
  Zilliz Cloud が使用する一時的な object-storage 認証情報のセッショントークンです。

- **volume_name** (*str*) -<br/>
  Default: `""`<br/>
  インポートデータを含む Zilliz Cloud volume の名前です。

- **data_paths** (*Optional[List[List[str]]]*) -<br/>
  Default: `None`<br/>
  インポートデータを含む Zilliz Cloud volume 内のパスです。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  Default: `True`<br/>
  TLS 検証設定です。デフォルトの信頼ストアで検証するには `True` を使用するか、CA 証明書のパスを指定します。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  Default: `None`<br/>
  クライアント証明書のパス、または相互 TLS 用の証明書と秘密鍵のペアです。

- **kwargs** (*Any*) -<br/>
  HTTP リクエストに転送される追加オプションです。

**RETURN TYPE:**

*requests.Response*

**RETURNS:**

bulk-import エンドポイントから返される HTTP レスポンスです。送信されたジョブ識別子については JSON ペイロードを確認してください。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

この例では、object-storage データを Zilliz Cloud に送信します。

```python
from pymilvus.bulk_writer import bulk_import

response = bulk_import(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
    collection_name="book_chunks",
    object_urls=[["s3://bucket/books/part-0001.parquet"]],
)
print(response.json())
```
