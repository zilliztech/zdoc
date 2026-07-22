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
  - vector database チュートリアル
  - ベクトルデータベースはどのように動作するか
  - vector db 比較
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

- **url** (*str*) -
**[REQUIRED]**

    Zilliz Cloud API サーバーのエンドポイントです。`https://api.cloud.zilliz.com` になります。

- **collection_name** (*str*) -
**[REQUIRED]**
対象 collection の名前です。

- **db_name** (*str*) -
Default: `""`
対象 database の名前です。

- **object_url** (*str*) -
Default: `""`
非推奨のオブジェクトストレージ URL です。新しい Zilliz Cloud 統合では `object_urls` を使用してください。

- **object_urls** (*Optional[List[List[str]]]*) -
Default: `None`
インポートデータを含むオブジェクトストレージ URL です。各ネストされたリストは 1 つのオブジェクトまたはフォルダを識別します。

- **cluster_id** (*str*) -
Default: `""`
対象の Zilliz Cloud cluster の ID です。

- **project_id** (*str*) -
Default: `""`
対象の project database を含む Zilliz Cloud project の ID です。

- **region_id** (*str*) -
Default: `""`
対象の project database を含む Zilliz Cloud region の ID です。

- **api_key** (*str*) -
Default: `""`

    リクエストの認証に使用される Zilliz Cloud API key です。

- **access_key** (*str*) -
Default: `""`
Zilliz Cloud が使用するオブジェクトストレージ認証情報の access key です。

- **secret_key** (*str*) -
Default: `""`
Zilliz Cloud が使用するオブジェクトストレージ認証情報の secret key です。

- **token** (*str*) -
Default: `""`
Zilliz Cloud が使用する一時的なオブジェクトストレージ認証情報のセッショントークンです。

- **volume_name** (*str*) -
Default: `""`
インポートデータを含む Zilliz Cloud volume の名前です。

- **data_paths** (*Optional[List[List[str]]]*) -
Default: `None`
インポートデータを含む Zilliz Cloud volume 内のパスです。

- **verify** (*Optional[Union[bool, str]]*) -
Default: `True`
TLS 検証設定です。デフォルトの trust store で検証するには `True` を使用するか、CA 証明書パスを指定します。

- **cert** (*Optional[Union[str, tuple]]*) -
Default: `None`
クライアント証明書のパス、または相互 TLS 用の証明書と秘密鍵のペアです。

- **kwargs** (*Any*) -
HTTP リクエストに転送される追加オプションです。

**RETURN TYPE:**

*requests.Response*

**RETURNS:**

bulk-import エンドポイントによって返される HTTP レスポンスです。送信されたジョブ識別子については JSON ペイロードを確認してください。

**EXCEPTIONS:**

- **MilvusException**
サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

この例では、オブジェクトストレージのデータを Zilliz Cloud に送信します。

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
