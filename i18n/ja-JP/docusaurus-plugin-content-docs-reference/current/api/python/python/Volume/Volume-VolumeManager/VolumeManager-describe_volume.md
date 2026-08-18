---
title: "describe_volume() | Python"
slug: /python/python/VolumeManager-describe_volume
sidebar_label: "describe_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のボリュームに関する詳細情報を返します。 | Python"
type: docx
token: MwfQdhukeoxOh0xPLySc0wJjn5f
sidebar_position: 3
keywords: 
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - milvus ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - describe_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_volume()

この操作は、特定のボリュームに関する詳細情報を返します。

## リクエスト構文\{#request-syntax}

```python
describe_volume(
    volume_name: str,
) -> requests.Response
```

**パラメーター:**

- **volume_name** (*str*) -<br/>
  **[必須]**<br/>
  説明するZilliz Cloudボリュームの名前。

**戻り値の型:**

*requests.Response*

**戻り値:**

リクエストされたボリュームの詳細情報を含む HTTP レスポンスです。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

この例では、describe volume の使用方法を示しています。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
