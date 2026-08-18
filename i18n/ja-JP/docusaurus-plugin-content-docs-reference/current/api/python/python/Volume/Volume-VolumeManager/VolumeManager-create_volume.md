---
title: "create_volume() | Python"
slug: /python/python/VolumeManager-create_volume
sidebar_label: "create_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定したプロジェクトとリージョンにボリュームを作成します。| Python"
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

この操作は、指定したプロジェクトとリージョンにボリュームを作成します。

## リクエスト構文\{#request-syntax}

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

**パラメーター:**

- **project_id** (*str*) -<br/>
  **[必須]**<br/>
  ボリュームを作成するZilliz CloudプロジェクトのIDです。

- **region_id** (*str*) -<br/>
  **[必須]**<br/>
  ボリュームを作成するZilliz CloudリージョンのIDです。

- **volume_name** (*str*) -<br/>
  **[必須]**<br/>
  作成するボリュームの名前です。

- **volume_type** (*Optional[str]*) -<br/>
  デフォルト: `None`<br/>
  ボリュームタイプです。サポートされている値は `MANAGED` と `EXTERNAL` で、デフォルトは `MANAGED` です。

- **storage_integration_id** (*Optional[str]*) -<br/>
  デフォルト: `None`<br/>
  `EXTERNAL`ボリュームに必要なストレージ統合IDです。

- **path** (*Optional[str]*) -<br/>
  デフォルト: `None`<br/>
  `EXTERNAL`ボリュームのストレージパスです。省略した場合は、ストレージ統合のルートが使用されます。指定したパスは `/` で終わる必要があります。

**戻り値の型:**

*requests.Response*

**戻り値:**

ボリューム作成リクエストを説明するHTTPレスポンスです。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、またはRPCが失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

この例では、ボリュームの作成方法を示します。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
