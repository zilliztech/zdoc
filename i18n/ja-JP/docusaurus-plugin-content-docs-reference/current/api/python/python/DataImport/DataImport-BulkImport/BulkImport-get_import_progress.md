---
title: "get_import_progress() | Python"
slug: /python/python/BulkImport-get_import_progress
sidebar_label: "get_import_progress()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この関数は、cloud project databases の project/region スコープのジョブを含む、bulk import ジョブの現在のステータスを返します。 | Python"
type: docx
token: CNQIdgQvXoux0KxpXHxca8EMnjg
sidebar_position: 2
keywords: 
  - Vector embeddings
  - Vector store
  - オープンソース vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - get_import_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_import_progress()

この関数は、cloud project databases の project/region スコープのジョブを含む、bulk import ジョブの現在のステータスを返します。

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
    
    project_id: str = "",
    region_id: str = "",
    
    verify: bool | str = True,
    cert: str | tuple | None = None,
    **kwargs,
)
```

**PARAMETERS:**

- **url** (*str*) -

    **[REQUIRED]**

    bulk import API のサーバーエンドポイント。

- **job_id** (*str*) -

    **[REQUIRED]**

    `bulk_import()` によって返される import ジョブ ID。

- **cluster_id** (*str*) -

    Cloud cluster ID。

- **api_key** (*str*) -

    Cloud 認証用の API key。

- **db_name** (*str*) -

    リクエストルーティング用のデータベース名。

- **project_id** (*str*) -

    有効な Zilliz Cloud project ID。 

    これは、オンデマンドコンピュート用のデータベースに bulk import する場合に適用されます。

- **region_id** (*str*) -

    有効な Zilliz Cloud region ID。

    これは、オンデマンドコンピュート用のデータベースに bulk import する場合に適用されます。

- **verify** (*bool | str*) -

    TLS 検証設定。

- **cert** (*str | tuple*) -

    クライアント証明書パス、または `(cert, key)` タプル。

- **project_id** (*str*) -

    追加の HTTP リクエストオプション。

**RETURN TYPE:**
*requests.Response*

現在の import-job progress ペイロードを返します。

**EXCEPTIONS:**

- **MilvusException**

    progress の参照に失敗したときに発生します。

## 例\{#examples}

```python
from pymilvus.bulk_writer import get_import_progress

resp = get_import_progress(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    job_id="448996221577371648",
    db_name="book_db",
)

print(resp.json())
```

