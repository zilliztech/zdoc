---
title: "VolumeManager | Java | v2"
slug: /java/java/v2-Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeManager` 实例维护与 Zilliz Cloud Volume 服务的连接。在创建、列出或删除卷之前，您需要初始化一个 `VolumeManager` 实例。 | Java | v2"
type: docx
token: QHyGdm4FyoFwCzxDgUUc9yQrnPf
sidebar_position: 4
keywords: 
  - 稠密向量
  - Hierarchical Navigable Small Worlds
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - VolumeManager
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeManager

`VolumeManager` 实例维护与 Zilliz Cloud Volume 服务的连接。在创建、列出或删除卷之前，您需要初始化一个 `VolumeManager` 实例。

```java
io.milvus.bulkwriter.VolumeManager
```

<Admonition type="info" icon="📘" title="Notes">

卷是一个中间存储位置，您可以在其中暂存数据以进行后续处理，例如数据合并、迁移或导入。有关详细信息，请参阅 [Volume](/docs/volume)。

</Admonition>

## 构造函数\{#constructor}

此构造函数初始化一个新的 `VolumeManager` 实例，用于维护与 Zilliz Cloud Volume 服务的连接。

```java
VolumeManager(
    VolumeManagerParam.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .build();
)
```

**参数：**

- **cloudEndpoint** (*str*) -

    **[必需]**

    Zilliz Cloud Endpoint，即 `https:*//*api.cloud.zilliz.com`。

- **apiKey** (*str*) -

    **[必需]**

    您的 Zilliz Cloud API 密钥，需要具有足够的权限来管理 Zilliz Cloud Volume 服务上的卷。要获取 Zilliz Cloud API 密钥，请按照 [API Keys](/docs/manage-api-keys) 中的步骤操作。

**返回类型：**

`VolumeManager`

**返回：**

一个 `VolumeManager` 实例。

## 示例\{#examples}

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
```

