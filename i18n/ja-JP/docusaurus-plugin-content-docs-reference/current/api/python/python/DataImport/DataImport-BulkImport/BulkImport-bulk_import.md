---
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この関数は、オープンソースの Milvus または Zilliz Cloud に一括インポートジョブを送信します。 | Python"
type: docx
token: HVwRdVSbAo2jUexpxmdczdqPnzh
sidebar_position: 1
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルDB比較
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

この関数は、オープンソースの Milvus または Zilliz Cloud に一括インポートジョブを送信します。

## リクエスト構文\{#request-syntax}

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

**パラメーター:**

- **url** (*str*) -<br/>
  **[必須]**

    Zilliz Cloud APIサーバーのエンドポイント（`https://api.cloud.zilliz.com`）です。

- **collection_name** (*str*) -<br/>
  **[必須]**<br/>
  対象コレクションの名前です。

- **db_name** (*str*) -<br/>
  デフォルト: `""`<br/>
  対象データベースの名前です。

- **object_url** (*str*) -<br/>
  デフォルト: `""`<br/>
  非推奨のオブジェクトストレージURLです。新しい Zilliz Cloud 統合には `object_urls` を使用してください。

- **object_urls** (*Optional[List[List[str]]]*) -<br/>
  デフォルト: `None`<br/>
  インポートデータを含むオブジェクトストレージURLです。入れ子になった各リストは、1つのオブジェクトまたはフォルダーを識別します。

- **cluster_id** (*str*) -<br/>
  デフォルト: `""`<br/>
  対象の Zilliz Cloud クラスターのIDです。

- **project_id** (*str*) -<br/>
  デフォルト: `""`<br/>
  対象のプロジェクトデータベースを含む Zilliz Cloud プロジェクトのIDです。

- **region_id** (*str*) -<br/>
  デフォルト: `""`<br/>
  対象のプロジェクトデータベースを含む Zilliz Cloud リージョンのIDです。

- **api_key** (*str*) -<br/>
  デフォルト: `""`

    リクエストの認証に使用する Zilliz Cloud APIキーです。

- **access_key** (*str*) -<br/>
  デフォルト: `""`<br/>
  Zilliz Cloud が使用するオブジェクトストレージの認証情報のアクセスキーです。

- **secret_key** (*str*) -<br/>
  デフォルト: `""`<br/>
  Zilliz Cloud が使用するオブジェクトストレージの認証情報のシークレットキーです。

- **token** (*str*) -<br/>
  デフォルト: `""`<br/>
  Zilliz Cloud が使用する一時的なオブジェクトストレージ認証情報のセッショントークンです。

- **volume_name** (*str*) -<br/>
  デフォルト: `""`<br/>
  インポートデータを含む Zilliz Cloud ボリュームの名前です。

- **data_paths** (*Optional[List[List[str]]]*) -<br/>
  デフォルト: `None`<br/>
  インポートデータを含む Zilliz Cloud ボリューム内のパスです。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  デフォルト: `True`<br/>
  TLS検証の設定です。デフォルトのトラストストアで検証するには `True` を使用するか、CA証明書のパスを指定します。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  デフォルト: `None`<br/>
  クライアント証明書のパス、または相互TLS用の証明書と秘密鍵のペアです。

- **kwargs** (*Any*) -<br/>
  HTTPリクエストに転送される追加オプションです。

**戻り値の型:**

*requests.Response*

**戻り値:**

一括インポートエンドポイントが返すHTTPレスポンスです。送信されたジョブIDを確認するには、JSONペイロードを調べてください。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、またはRPCが失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

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
