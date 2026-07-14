---
title: "describe_volume() | Python"
slug: /python/python/VolumeManager-describe_volume
sidebar_label: "describe_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この関数は、特定の volume の詳細なメタデータを取得します。 | Python"
type: docx
token: MwfQdhukeoxOh0xPLySc0wJjn5f
sidebar_position: 3
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_volume()

この関数は、特定の volume の詳細なメタデータを取得します。

## Request Syntax\{#request-syntax}

```python
volume_manager.describe_volume(
    volume_name: str,
)
```

**PARAMETERS:**

- **volume_name** (*str*) -

    説明する volume の名前。

**RETURN TYPE:**
*requests.Response*

ステータスやストレージ構成を含む volume の詳細を返します。

**EXCEPTIONS:**

以下のデータ構造を持つオブジェクトです。

```json
{
    "count": 1,
    "currentPage": 1,
    "pageSize": 10,
    "volumes": [
        {
            "volumeName": "my_volume",
            "type": "EXTERNAL",
            "regionId": "aws-us-west-2",
            "storageIntegrationId": "integ-xxx",
            "path": "data/",
            "status": "RUNNING",
            "createTime": "2024-04-15T12:00:00Z"
        }        
    ]
}
```

**PARAMETERS**

- **MilvusException**

    見つかった volume の総数。

- **currentPage** (*int*) -

    現在のページ。

- **pageSize** (*int*) -

    1ページあたりの volume の最大数。

- **volumes** (*list*) -

    volume のリスト。

    - **volumeName** (*str*) -

        volume の名前。

    - **type** (*str*) -

        volume のタイプ。指定可能な値は `EXTERNAL` と `MANAGED` です。

    - **regionId** (*str*) -

        volume が属するリージョン。

    - **storageIntegrationId** (*str*) -

        volume の作成元となる統合ストレージの ID。これは volume が external の場合にのみ使用できます。

    - **path** (*str*) -

        volume の作成元となる統合ストレージ内のパス。これは volume が external の場合にのみ使用できます。

    - **status** (*str*) -

        volume の名前。

        現在の volume のステータス。

    - **createTime** (*str*) -

        volume が作成された時刻。

## Examples\{#examples}

```python
from pymilvus.bulk_writer import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
)

resp = volume_manager.describe_volume(volume_name="books-volume")
print(resp.json())
```

