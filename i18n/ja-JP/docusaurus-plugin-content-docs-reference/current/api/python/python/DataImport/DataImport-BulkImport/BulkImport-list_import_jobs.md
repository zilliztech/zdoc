---
title: "list_import_jobs() | Python"
slug: /python/python/BulkImport-list_import_jobs
sidebar_label: "list_import_jobs()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この関数は、オプションのコレクションとページネーションフィルタを使用してバルクインポートジョブを一覧表示します。 | Python"
type: docx
token: N13hd7jVjoA6B1xlgwic2GKRn5f
sidebar_position: 3
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
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

この関数は、オプションのコレクションとページネーションフィルタを使用してバルクインポートジョブを一覧表示します。

## リクエスト構文\{#request-syntax}

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

**パラメータ:**

- **url** (*str*) -<br/>
  **[必須]**

    Zilliz Cloud API サーバーエンドポイント。`https://api.cloud.zilliz.com` です。

- **collection_name** (*str*) -<br/>
  デフォルト: `""`<br/>
  インポートジョブを一覧表示するコレクションの名前。

- **db_name** (*str*) -<br/>
  デフォルト: `""`<br/>
  インポートジョブを一覧表示するデータベースの名前。

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

- **page_size** (*int*) -<br/>
  デフォルト: `10`<br/>
  ページごとに返すインポートジョブの最大数。

- **current_page** (*int*) -<br/>
  デフォルト: `1`<br/>
  返す 1 ベースのページ番号。

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

一致するインポートジョブとページネーション情報を含む HTTP レスポンス。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否したか、RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーエラーメッセージを検査してください。

## 例\{#examples}

この例は、Zilliz Cloud からインポートジョブを一覧表示します。

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
