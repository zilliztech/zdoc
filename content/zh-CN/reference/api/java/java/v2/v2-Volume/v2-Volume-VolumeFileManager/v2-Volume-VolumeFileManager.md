---
title: "VolumeFileManager | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager
sidebar_label: "VolumeFileManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeFileManager` 实例维护与 Zilliz Cloud Volume 服务中特定 volume 的连接。在将数据文件上传到 volume 之前，您需要先初始化一个 `VolumeFileManager` 实例。 | Java | v2"
type: docx
token: DK7ZdxRCyoepyxx0odzcH66xnu3
sidebar_position: 2
keywords: 
  - 开源向量数据库
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - VolumeFileManager
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeFileManager

`VolumeFileManager` 实例维护与 Zilliz Cloud Volume 服务中特定 volume 的连接。在将数据文件上传到 volume 之前，您需要先初始化一个 `VolumeFileManager` 实例。

```java
io.milvus.bulkwriter.VolumeFileManager
```

<Admonition type="info" icon="📘" title="Notes">

volume 是一个中间存储位置，您可以在其中保存数据以进行后续处理，例如数据合并、迁移或导入。有关详细信息，请参阅 [Volume](/docs/volume)。

</Admonition>

## 构造函数\{#constructor}

此构造函数会初始化一个新的 `VolumeFileManager` 实例，用于维护与 Zilliz Cloud Volume 服务中特定 volume 的连接。

```java
VolumeFileManager(
    VolumeFileManager.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .withVolumeName(String volumeName)
        .build();
)
```

**参数：**

- **cloudEndpoint** (*str*) -

    **[必需]**

    Zilliz Cloud 的 Endpoint，即 `https://api.cloud.zilliz.com`。

- **apiKey** (*str*) -

    **[必需]**

    您的 Zilliz Cloud API 密钥，需要具有足够的权限来管理 Zilliz Cloud Control Plane 上的 volumes。要获取 Zilliz Cloud API 密钥，请按照 [API Keys](/docs/manage-api-keys) 中的步骤操作。

- **volumeName** (*str*) -

    **[必需]**

    此次操作的目标 volume 名称。

**返回类型：**

`VolumeFileManager`

**返回：**

一个 `VolumeFileManager` 实例。

## 示例\{#examples}

```java
import io.milvus.bulkwriter.VolumeFileManager;
import io.milvus.bulkwriter.VolumeFileManagerParam;

VolumeFileManagerParam volumeFileManagerParam = VolumeFileManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .withVolumeName("my_volume")
    .build();

VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);
```

