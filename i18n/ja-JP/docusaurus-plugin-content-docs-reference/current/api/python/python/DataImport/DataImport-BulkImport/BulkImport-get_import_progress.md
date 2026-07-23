---
title: "get_import_progress() | Python"
slug: /python/python/BulkImport-get_import_progress
sidebar_label: "get_import_progress()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "projectid、regionid、dbname、および DB-Name ヘッダーの動作を追加します。 | Python"
type: docx
token: CNQIdgQvXoux0KxpXHxca8EMnjg
sidebar_position: 2
keywords: 
  - ベクター埋め込み
  - ベクターストア
  - オープンソースのベクターデータベース
  - ベクターインデックス
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

project_id、region_id、db_name、および DB-Name ヘッダーの動作を追加します。

## Request Syntax\{#request-syntax}

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

**PARAMETERS:**

- **url** (*str*) -<br/>
  **[REQUIRED]**

    `https://api.cloud.zilliz.com` である Zilliz Cloud API サーバーのエンドポイント。

- **job_id** (*str*) -<br/>
  **[REQUIRED]**<br/>
  確認するインポートジョブの ID。

- **cluster_id** (*str*) -<br/>
  Default: `""`<br/>
  対象の Zilliz Cloud クラスターの ID。

- **project_id** (*str*) -<br/>
  Default: `""`<br/>
  対象プロジェクトデータベースを含む Zilliz Cloud プロジェクトの ID。

- **region_id** (*str*) -<br/>
  Default: `""`<br/>
  対象プロジェクトデータベースを含む Zilliz Cloud リージョンの ID。

- **api_key** (*str*) -<br/>
  Default: `""`

    リクエストの認証に使用される Zilliz Cloud API キー。

- **db_name** (*str*) -<br/>
  Default: `""`<br/>
  ロールベースアクセス制御のために `DB-Name` ヘッダーで送信されるデータベース名。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  Default: `True`<br/>
  TLS 検証設定。デフォルトのトラストストアで検証するには `True` を使用するか、CA 証明書のパスを指定します。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  Default: `None`<br/>
  クライアント証明書のパス、または相互 TLS 用の証明書と秘密鍵のペア。

- **kwargs** (*Any*) -<br/>
  HTTP リクエストに転送される追加オプション。

**RETURN TYPE:**

*requests.Response*

**RETURNS:**

現在の bulk-import ジョブの状態と進行状況を含む HTTP レスポンス。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

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
