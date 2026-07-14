---
title: "list_import_jobs() | Python"
slug: /python/python/BulkImport-list_import_jobs
sidebar_label: "list_import_jobs()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この関数は、オプションの collection およびページネーションフィルターを使用して一括インポートジョブを一覧表示し、プロジェクトデータベース向けの project/region フィルターも含みます。 | Python"
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

この関数は、オプションの collection およびページネーションフィルターを使用して一括インポートジョブを一覧表示し、プロジェクトデータベース向けの project/region フィルターも含みます。

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
    
    project_id: str = "",
    region_id: str = "",
    
    verify: bool | str = True,
    cert: str | tuple | None = None,
    **kwargs,
)
```

**パラメーター:**

- **url** (*str*) -

    **[必須]**

    一括インポート API 用のサーバーエンドポイント。

- **collection_name** (*str*) -

    オプションの collection フィルター。

- **db_name** (*str*) -

    オプションのデータベースフィルター。

- **cluster_id** (*str*) -

    Cloud cluster ID。

- **api_key** (*str*) -

    cloud 認証用の API key。

- **page_size** (*int*) -

    1ページあたりに返されるジョブ数。

- **current_page** (*int*) -

    問い合わせるページ番号。

- **project_id** (*str*) -

    有効な Zilliz Cloud project ID。 

    これは、オンデマンドコンピュート用のデータベースに一括インポートする場合に適用されます。

- **region_id** (*str*) -

    有効な Zilliz Cloud region ID。

    これは、オンデマンドコンピュート用のデータベースに一括インポートする場合に適用されます。

- **verify** (*bool | str*) -

    TLS 検証設定。

- **cert** (*str | tuple*) -

    クライアント証明書のパス、または `(cert, key)` タプル。

- **project_id** (*str*) -

    追加の HTTP リクエストオプション。

**戻り値の型:**
*requests.Response*

インポートジョブのページ分割された一覧を返します。

ページ分割されたインポートジョブの概要を含む HTTP レスポンス。

**例外:**

- **MilvusException**

    ジョブ一覧の取得に失敗した場合に発生します。

## 例\{#examples}

```python
from pymilvus.bulk_writer import list_import_jobs

resp = list_import_jobs(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    collection_name="book_catalog",
    page_size=20,
    current_page=1,
)

print(resp.json())
```

