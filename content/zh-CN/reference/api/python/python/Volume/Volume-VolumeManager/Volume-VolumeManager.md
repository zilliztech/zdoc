---
title: "VolumeManager | Python"
slug: /python/python/Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeManager` 实例维护与 Zilliz Cloud 的 Volume 服务的连接。在创建、列出或删除卷之前，您需要先初始化一个 `VolumeManager` 实例。 | Python"
type: docx
token: G5c6dxWkno5FRAxeDMycR6AVntf
sidebar_position: 5
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - VolumeManager
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VolumeManager

`VolumeManager` 实例维护与 Zilliz Cloud 的 Volume 服务的连接。在创建、列出或删除卷之前，您需要先初始化一个 `VolumeManager` 实例。

```python
class pymilvus.bulk_writer.volume_manager import VolumeManager
```

<Admonition type="info" icon="📘" title="Notes">

卷是一个中间存储位置，您可以在其中保存数据以进行进一步处理，例如数据合并、迁移或导入。有关详细信息，请参阅 [Volume](/docs/volume)。

</Admonition>

## 构造函数\{#constructor}

此构造函数会初始化一个新的 `VolumeManager` 实例，用于维护与 Zilliz Cloud 的 Volume 服务的连接。

```python
VolumeManager(
    cloud_endpoint: str,
    api_key: str
)
```

**参数：**

- **cloud_endpoint** (*str*) -

    **[必填]**

    Zilliz Cloud 的 Endpoint，即 `https:*//*api.cloud.zilliz.com`。

- **api_key** (*str*) -

    **[必填]**

    您在 Zilliz Cloud 的 Volume 服务上管理卷所需的、具有足够权限的 Zilliz Cloud API 密钥。要获取 Zilliz Cloud API 密钥，请按照 [API Keys](/docs/manage-api-keys) 中的步骤操作。

**返回类型：**

`VolumeManager`

**返回：**

一个 `VolumeManager` 实例。

## 示例\{#examples}

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)
```

