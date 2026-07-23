---
title: "list_volumes() | Python"
slug: /python/python/VolumeManager-list_volumes
sidebar_label: "list_volumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "project_id と volume_type のフィルタリングを追加します。 | Python"
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

project_id と volume_type のフィルタリングを追加します。

## Request Syntax\{#request-syntax}

```python
list_volumes(
    project_id: str,
    current_page: int = 1,
    page_size: int = 10,
    volume_type: Optional[str] = None,
) -> requests.Response
```

**PARAMETERS:**

- **project_id** (*str*) -<br/>
  **[REQUIRED]**<br/>
  volume を一覧表示する対象の Zilliz Cloud project の ID。

- **current_page** (*int*) -<br/>
  Default: `1`<br/>
  返される、1 から始まるページ番号。

- **page_size** (*int*) -<br/>
  Default: `10`<br/>
  1 ページあたりに返される volume の最大数。

- **volume_type** (*Optional[str]*) -<br/>
  Default: `None`<br/>
  結果をフィルタリングする volume のタイプ。サポートされる値は `MANAGED` および `EXTERNAL` です。

**RETURN TYPE:**

*requests.Response*

**RETURNS:**

project の volume の 1 ページ分を含む HTTP レスポンス。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

この例では、list volumes の使用方法を示します。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
