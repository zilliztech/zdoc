---
title: "create_volume() | Python"
slug: /python/python/VolumeManager-create_volume
sidebar_label: "create_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "project/region と external-volume パラメータを追加します。 | Python"
type: docx
token: GtNKdyeDCoPxQXxvohIcYQ47nee
sidebar_position: 1
keywords: 
  - ベクトルデータベース
  - IVF
  - knn
  - 画像検索
  - zilliz
  - zilliz cloud
  - クラウド
  - create_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_volume()

project/region および external-volume パラメータを追加します。

## Request Syntax\{#request-syntax}

```python
create_volume(
    project_id: str,
    region_id: str,
    volume_name: str,
    volume_type: Optional[str] = None,
    storage_integration_id: Optional[str] = None,
    path: Optional[str] = None,
) -> requests.Response
```

**PARAMETERS:**

- **project_id** (*str*) -<br/>
  **[REQUIRED]**<br/>
  volume を作成する Zilliz Cloud project の ID。

- **region_id** (*str*) -<br/>
  **[REQUIRED]**<br/>
  volume を作成する Zilliz Cloud region の ID。

- **volume_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  作成する volume の名前。

- **volume_type** (*Optional[str]*) -<br/>
  Default: `None`<br/>
  volume のタイプ。サポートされる値は `MANAGED` と `EXTERNAL` で、デフォルトは `MANAGED` です。

- **storage_integration_id** (*Optional[str]*) -<br/>
  Default: `None`<br/>
  `EXTERNAL` volume に必要な storage integration ID。

- **path** (*Optional[str]*) -<br/>
  Default: `None`<br/>
  `EXTERNAL` volume のストレージパス。省略した場合は storage integration のルートが使用されます。指定する path は `/` で終わる必要があります。

**RETURN TYPE:**

*requests.Response*

**RETURNS:**

volume 作成リクエストを説明する HTTP レスポンス。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

この例では、create volume の使用方法を示します。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
