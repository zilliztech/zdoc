---
title: "list_import_jobs() | Python"
slug: /python/python/BulkImport-list_import_jobs
sidebar_label: "list_import_jobs()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "projectid と regionid のフィルタリングを追加します。 | Python"
type: docx
token: N13hd7jVjoA6B1xlgwic2GKRn5f
sidebar_position: 3
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画重複排除
  - zilliz
  - zilliz cloud
  - cloud
  - list_import_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_import_jobs()

project_id および region_id のフィルタリングを追加します。

## Request Syntax\{#request-syntax}

```python
list_import_jobs(
    url: str,
    collection_name: str = "",
    db_name: str = "",
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    page_size: int = 10,
    current_page: int = 1,
    verify: Optional[Union[bool, str]] = True,
    cert: Optional[Union[str, tuple]] = None,
    **kwargs,
) -> requests.Response
```

**PARAMETERS:**

- **url** (*str*) -<br/>
  **[REQUIRED]**

    `https://api.cloud.zilliz.com` である Zilliz Cloud API サーバーエンドポイント。

- **collection_name** (*str*) -<br/>
  Default: `""`<br/>
  インポートジョブを一覧表示する対象のコレクションの名前。

- **db_name** (*str*) -<br/>
  Default: `""`<br/>
  インポートジョブを一覧表示する対象のデータベース名。

- **cluster_id** (*str*) -<br/>
  Default: `""`<br/>
  対象の Zilliz Cloud クラスターの ID。

- **project_id** (*str*) -<br/>
  Default: `""`<br/>
  対象のプロジェクトデータベースを含む Zilliz Cloud プロジェクトの ID。

- **region_id** (*str*) -<br/>
  Default: `""`<br/>
  対象のプロジェクトデータベースを含む Zilliz Cloud リージョンの ID。

- **api_key** (*str*) -<br/>
  Default: `""`

    リクエストの認証に使用する Zilliz Cloud API キー。

- **page_size** (*int*) -<br/>
  Default: `10`<br/>
  1 ページあたりに返されるインポートジョブの最大数。

- **current_page** (*int*) -<br/>
  Default: `1`<br/>
  返されるページ番号。1 始まりです。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  Default: `True`<br/>
  TLS 検証設定。デフォルトの信頼ストアで検証するには `True` を使用するか、CA 証明書のパスを指定します。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  Default: `None`<br/>
  クライアント証明書のパス、または相互 TLS 用の証明書と秘密鍵のペア。

- **kwargs** (*Any*) -<br/>
  HTTP リクエストに転送される追加オプション。

**RETURN TYPE:**

*requests.Response*

**RETURNS:**

一致するインポートジョブとページネーション情報を含む HTTP レスポンス。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

この例では、Zilliz Cloud からインポートジョブを一覧表示します。

```python
from pymilvus.bulk_writer import list_import_jobs

response = list_import_jobs(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
)
print(response.json())
```
