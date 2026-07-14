---
title: "create_volume() | Python"
slug: /python/python/VolumeManager-create_volume
sidebar_label: "create_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、プロジェクトとリージョン内に新しい Zilliz Cloud ボリュームを作成し、マネージドまたは外部ボリューム設定をサポートします。 | Python"
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

この関数は、プロジェクトとリージョン内に新しい Zilliz Cloud ボリュームを作成し、マネージドまたは外部ボリューム設定をサポートします。

## Request Syntax\{#request-syntax}

```python
volume_manager.create_volume(
    project_id: str,
    region_id: str,
    volume_name: str,
    volume_type: str | None = None,
    storage_integration_id: str | None = None,
    path: str | None = None,
)
```

**PARAMETERS:**

- **project_id** (*str*) -

    **[REQUIRED]**

    ボリュームを所有するプロジェクト ID。

- **region_id** (*str*) -

    **[REQUIRED]**

    ボリュームが作成されるリージョン ID。

- **volume_name** (*str*) -

    **[REQUIRED]**

    ボリュームの名前。

- **volume_type** (*str*) -

    ボリュームのタイプ。サポートされる値は `MANAGED` と `EXTERNAL` です。省略した場合は `MANAGED` が使用されます。

- **storage_integration_id** (*str*) -

    Storage Integration ID。`volume_type="EXTERNAL"` の場合に必須です。

- **path** (*str*) -

    外部ストレージのパス。設定する場合は `/` で終わる必要があります。

**RETURN TYPE:**
*requests.Response*

ボリューム作成レスポンスを返します。

create volume API からの HTTP レスポンス。

**EXCEPTIONS:**

- **MilvusException**

    ボリュームの作成に失敗した場合に発生します。

## Examples\{#examples}

```python
from pymilvus.bulk_writer import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
)

resp = volume_manager.create_volume(
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    volume_name="books-volume",
    volume_type="EXTERNAL",
    storage_integration_id="integ-xxx",
    path="book-data/",
)

print(resp.json())
```
