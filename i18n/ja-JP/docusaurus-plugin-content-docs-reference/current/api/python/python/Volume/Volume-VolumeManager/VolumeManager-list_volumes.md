---
title: "list_volumes() | Python"
slug: /python/python/VolumeManager-list_volumes
sidebar_label: "list_volumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、プロジェクト内のボリュームをページネーション付きで一覧表示します。 | Python"
type: docx
token: SyiHdehPHoO4l4x11tqcjzpOnLd
sidebar_position: 4
keywords: 
  - openai ベクトルDB
  - 自然言語処理データベース
  - 低価格のベクトルデータベース
  - マネージドベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - list_volumes()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_volumes()

この操作は、プロジェクト内のボリュームをページネーション付きで一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_volumes(
    project_id: str,
    current_page: int = 1,
    page_size: int = 10,
    volume_type: Optional[str] = None,
) -> requests.Response
```

**パラメーター:**

- **project_id** (*str*) -<br/>
  **[必須]**<br/>
  ボリュームが一覧表示される Zilliz Cloud プロジェクトの ID。

- **current_page** (*int*) -<br/>
  デフォルト: `1`<br/>
  返すページ番号（1から始まる）。

- **page_size** (*int*) -<br/>
  デフォルト: `10`<br/>
  1ページあたりに返すボリュームの最大数。

- **volume_type** (*Optional[str]*) -<br/>
  デフォルト: `None`<br/>
  結果をフィルタリングするボリュームタイプ。サポートされている値は `MANAGED` と `EXTERNAL` です。

**戻り値の型:**

*requests.Response*

**戻り値:**

このプロジェクトのボリュームを1ページ分含む HTTP レスポンス。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細は、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

この例では、ボリューム一覧の使用方法を示しています。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
