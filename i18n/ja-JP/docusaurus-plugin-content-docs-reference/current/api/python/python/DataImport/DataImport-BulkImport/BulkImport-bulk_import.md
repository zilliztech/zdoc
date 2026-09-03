---
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この関数は、オープンソース Milvus または Zilliz Cloud のバルクインポートジョブを送信します。 | Python"
type: docx
token: HVwRdVSbAo2jUexpxmdczdqPnzh
sidebar_position: 1
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
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

この関数は、オープンソース Milvus または Zilliz Cloud のバルクインポートジョブを送信します。

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

**パラメータ:**

- **url** (*str*) -<br/>
  **[必須]**

    Zilliz Cloud API サーバーエンドポイント。`https://api.cloud.zilliz.com` です。

- **collection_name** (*str*) -<br/>
  **[必須]**<br/>
  ターゲットコレクションの名前。

- **db_name** (*str*) -<br/>
  デフォルト: `""`<br/>
  ターゲットデータベースの名前。

- **object_url** (*str*) -<br/>
  デフォルト: `""`<br/>
  非推奨のオブジェクトストレージ URL。新しい Zilliz Cloud 統合には `object_urls` を使用してください。

- **object_urls** (*Optional[List[List[str]]]*) -<br/>
  デフォルト: `None`<br/>
  インポートデータを含むオブジェクトストレージ URL。各ネストされたリストは、1つのオブジェクトまたはフォルダを識別します。

- **cluster_id** (*str*) -<br/>
  デフォルト: `""`<br/>
  ターゲット Zilliz Cloud クラスタの ID。

- **project_id** (*str*) -<br/>
  デフォルト: `""`<br/>
  ターゲットプロジェクトデータベースを含む Zilliz Cloud プロジェクトの ID。

- **region_id** (*str*) -<br/>
  デフォルト: `""`<br/>
  ターゲットプロジェクトデータベースを含む Zilliz Cloud リージョンの ID。

- **api_key** (*str*) -<br/>
  デフォルト: `""`

    リクエストを認証するために使用される Zilliz Cloud API キー。

- **access_key** (*str*) -<br/>
  デフォルト: `""`<br/>
  Zilliz Cloud が使用するオブジェクトストレージ認証情報のアクセスキー。

- **secret_key** (*str*) -<br/>
  デフォルト: `""`<br/>
  Zilliz Cloud が使用するオブジェクトストレージ認証情報のシークレットキー。

- **token** (*str*) -<br/>
  デフォルト: `""`<br/>
  Zilliz Cloud が使用する一時的なオブジェクトストレージ認証情報のセッショントークン。

- **volume_name** (*str*) -<br/>
  デフォルト: `""`<br/>
  インポートデータを含む Zilliz Cloud ボリュームの名前。

- **data_paths** (*Optional[List[List[str]]]*) -<br/>
  デフォルト: `None`<br/>
  インポートデータを含む Zilliz Cloud ボリューム内のパス。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  デフォルト: `True`<br/>
  TLS 検証設定。デフォルトのトラストストアで検証するには `True` を使用するか、CA 証明書パスを指定します。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  デフォルト: `None`<br/>
  クライアント証明書パス、または相互 TLS 用の証明書と秘密鍵のペア。

- **kwargs** (*Any*) -<br/>
  HTTP リクエストに転送される追加オプション。

**戻り値の型:**

*requests.Response*

**戻り値:**

バルクインポートエンドポイントから返される HTTP レスポンス。送信されたジョブ識別子の JSON ペイロードを検査してください。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否したか、RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーエラーメッセージを検査してください。

## 例\{#examples}

この例は、オブジェクトストレージデータを Zilliz Cloud に送信します。

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
