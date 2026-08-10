---
title: "create_volume() | Python"
slug: /python/python/VolumeManager-create_volume
sidebar_label: "create_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "添加 project/region 和 external-volume 参数。 | Python"
type: docx
token: GtNKdyeDCoPxQXxvohIcYQ47nee
sidebar_position: 1
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - zilliz
  - zilliz cloud
  - 云
  - create_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_volume()

添加 project/region 和 external-volume 参数。

## 请求语法\{#request-syntax}

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

**参数：**

- **project_id** (*str*) -<br/>
  **[REQUIRED]**<br/>
  要在其中创建该卷的 Zilliz Cloud 项目 ID。

- **region_id** (*str*) -<br/>
  **[REQUIRED]**<br/>
  要在其中创建该卷的 Zilliz Cloud 区域 ID。

- **volume_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  要创建的卷名称。

- **volume_type** (*Optional[str]*) -<br/>
  默认值：`None`<br/>
  卷类型。支持的值为 `MANAGED` 和 `EXTERNAL`；默认值为 `MANAGED`。

- **storage_integration_id** (*Optional[str]*) -<br/>
  默认值：`None`<br/>
  `EXTERNAL` 卷所需的存储集成 ID。

- **path** (*Optional[str]*) -<br/>
  默认值：`None`<br/>
  `EXTERNAL` 卷的存储路径。省略时，将使用存储集成根路径；如果提供了路径，则必须以 `/` 结尾。

**返回类型：**

*requests.Response*

**返回值：**

描述卷创建请求的 HTTP 响应。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝该请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败详情。

## 示例\{#examples}

以下示例演示了 create volume 的用法。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
