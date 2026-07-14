---
title: "list_volumes() | Python"
slug: /python/python/VolumeManager-list_volumes
sidebar_label: "list_volumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、project 配下の volume をページネーション付きで一覧表示し、必要に応じて volume type によるフィルタリングを行います。 | Python"
type: docx
token: SyiHdehPHoO4l4x11tqcjzpOnLd
sidebar_position: 4
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - list_volumes()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_volumes()

この関数は、project 配下の volume をページネーション付きで一覧表示し、必要に応じて volume type によるフィルタリングを行います。

## Request Syntax\{#request-syntax}

```python
volume_manager.list_volumes(
    project_id: str,
    current_page: int = 1,
    page_size: int = 10,
    volume_type: str | None = None,
)
```

**PARAMETERS:**

- **project_id** (*str*) -

    **[REQUIRED]**

    クエリ対象の Project ID。

- **current_page** (*int*) -

    クエリするページ番号。

- **page_size** (*int*) -

    1 ページあたりに返されるレコード数。

- **volume_type** (*str*) -

    volume type のオプションのフィルターです。サポートされる値は `MANAGED` および `EXTERNAL` です。

**RETURN TYPE:**
*requests.Response*

ページネーションされた volume の一覧を返します。

volume 一覧の結果を含む HTTP レスポンス。

**EXCEPTIONS:**

- **MilvusException**

    一覧取得リクエストが失敗したときに発生します。

## Examples\{#examples}

```python
from pymilvus.bulk_writer import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
)

resp = volume_manager.list_volumes(
    project_id="proj-xxx",
    current_page=1,
    page_size=20,
    volume_type="EXTERNAL",
)

print(resp.json())
```
