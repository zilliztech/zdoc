---
title: "describe_volume() | Python"
slug: /python/python/VolumeManager-describe_volume
sidebar_label: "describe_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此函数检索指定 volume 的详细元数据。 | Python"
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

此函数检索指定 volume 的详细元数据。

## 请求语法\{#request-syntax}

```python
volume_manager.describe_volume(
    volume_name: str,
)
```

**参数：**

- **volume_name** (*str*) -

    要描述的 volume 名称。

**返回类型：**
*requests.Response*

返回 volume 详情，包括状态和存储配置。

**异常：**

具有以下数据结构的对象：

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

**参数**

- **MilvusException**

    找到的 volume 总数。

- **currentPage** (*int*) -

    当前页。

- **pageSize** (*int*) -

    每页的最大 volume 数。

- **volumes** (*list*) -

    volume 列表。

    - **volumeName** (*str*) -

        volume 的名称。

    - **type** (*str*) -

        volume 的类型。可能的值为 `EXTERNAL` 和 `MANAGED`。

    - **regionId** (*str*) -

        volume 所属的区域。

    - **storageIntegrationId** (*str*) -

        创建该 volume 所基于的集成存储 ID。仅当 volume 为 external 时可用。

    - **path** (*str*) -

        创建该 volume 所基于的集成存储中的路径。仅当 volume 为 external 时可用。

    - **status** (*str*) -

        volume 的名称。

        当前 volume 的状态。

    - **createTime** (*str*) -

        volume 的创建时间。

## 示例\{#examples}

```python
from pymilvus.bulk_writer import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
)

resp = volume_manager.describe_volume(volume_name="books-volume")
print(resp.json())
```

