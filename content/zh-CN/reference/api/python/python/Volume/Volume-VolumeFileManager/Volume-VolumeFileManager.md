---
title: "VolumeFileManager | Python"
slug: /python/python/Volume-VolumeFileManager
sidebar_label: "VolumeFileManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeFileManager` 实例维护与特定 Zilliz Cloud 托管卷的连接。在将数据文件上传到卷之前，您需要先初始化一个 `VolumeFileManager` 实例。 | Python"
type: docx
token: IbWgdAwWOoTa1exF2LicP9henJJ
sidebar_position: 2
keywords: 
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - IVF
  - zilliz
  - zilliz cloud
  - 云
  - VolumeFileManager
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VolumeFileManager

`VolumeFileManager` 实例维护与特定 Zilliz Cloud 托管卷的连接。在将数据文件上传到卷之前，您需要先初始化一个 `VolumeFileManager` 实例。

```python
class pymilvus.bulk_writer.volume_file_manager import VolumeFileManager
```

<Admonition type="info" icon="📘" title="Notes">

此方法将文件上传到 Zilliz Cloud 上的托管卷。它不会将文件上传到外部卷，后者是对外部对象存储中数据的只读引用。有关详细信息，请参阅 [Volume](/docs/volume)。

</Admonition>

## 构造函数\{#constructor}

此构造函数会初始化一个新的 `VolumeFileManager` 实例，用于维护与特定 Zilliz Cloud 卷的连接。

```python
VolumeFileManager(
    cloud_endpoint: str,
    api_key: str,
    volume_name: str
)
```

**参数：**

- **cloud_endpoint** (*str*) -

    **[必需]**

    Zilliz Cloud Endpoint，即 `https://api.cloud.zilliz.com`。

- **api_key** (*str*) -

    **[必需]**

    您的 Zilliz Cloud API 密钥必须具有足够的权限来管理 Zilliz Cloud Volume 服务上的卷。要获取 Zilliz Cloud API 密钥，请按照 [API Keys](/docs/manage-api-keys) 中的步骤操作。

- **volume_name** (*str*) -

    **[必需]**

    此次操作的目标卷名称。

**返回类型：**

`VolumeFileManager`

**返回：**

一个 `VolumeFileManager` 实例。

## 示例\{#examples}

```python
from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager

volume_file_manager = VolumeFileManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    volume_name="my_volume"
)
```

