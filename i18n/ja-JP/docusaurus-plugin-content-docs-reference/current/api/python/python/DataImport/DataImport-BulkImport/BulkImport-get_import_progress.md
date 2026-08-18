---
title: "get_import_progress() | Python"
slug: /python/python/BulkImport-get_import_progress
sidebar_label: "get_import_progress()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この関数は、バルクインポートジョブの現在のステータスを返します。 | Python"
type: docx
token: CNQIdgQvXoux0KxpXHxca8EMnjg
sidebar_position: 2
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - zilliz
  - zilliz cloud
  - クラウド
  - get_import_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_import_progress()

この関数は、バルクインポートジョブの現在のステータスを返します。

## リクエスト構文\{#request-syntax}

```python
get_import_progress(
    url: str,
    job_id: str,
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    db_name: str = "",
    verify: Optional[Union[bool, str]] = True,
    cert: Optional[Union[str, tuple]] = None,
    **kwargs,
) -> requests.Response
```

**パラメータ:**

- **url** (*str*) -<br/>
  **[必須]**

    Zilliz Cloud API サーバーのエンドポイントは、`https://api.cloud.zilliz.com` です。

- **job_id** (*str*) -<br/>
  **[必須]**<br/>
  確認するインポートジョブの ID です。

- **cluster_id** (*str*) -<br/>
  デフォルト: `""`<br/>
  対象の Zilliz Cloud クラスターの ID です。

- **project_id** (*str*) -<br/>
  デフォルト: `""`<br/>
  対象のプロジェクトデータベースを含む Zilliz Cloud プロジェクトの ID です。

- **region_id** (*str*) -<br/>
  デフォルト: `""`<br/>
  対象のプロジェクトデータベースを含む Zilliz Cloud リージョンの ID です。

- **api_key** (*str*) -<br/>
  デフォルト: `""`

    リクエストの認証に使用する Zilliz Cloud API キーです。

- **db_name** (*str*) -<br/>
  デフォルト: `""`<br/>
  ロールベースのアクセス制御のために `DB-Name` ヘッダーで送信されるデータベース名です。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  デフォルト: `True`<br/>
  TLS 検証の設定です。`True` を使用してデフォルトのトラストストアで検証するか、CA 証明書のパスを指定します。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  デフォルト: `None`<br/>
  クライアント証明書のパス、または相互 TLS 用の証明書と秘密鍵のペアです。

- **kwargs** (*Any*) -<br/>
  HTTP リクエストに転送される追加オプションです。

**戻り値の型:**

*requests.Response*

**戻り値:**

現在のバルクインポートジョブの状態と進行状況を含む HTTP レスポンスです。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 使用例\{#examples}

この例では、Zilliz Cloud からインポートの進行状況を取得します。

```python
from pymilvus.bulk_writer import get_import_progress

response = get_import_progress(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
    job_id="job-123",
)
print(response.json())
```
