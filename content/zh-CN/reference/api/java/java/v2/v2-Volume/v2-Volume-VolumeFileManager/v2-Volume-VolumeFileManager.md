---
title: "VolumeFileManager | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager
sidebar_label: "VolumeFileManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeFileManager` 实例维护与 Zilliz Cloud Volume 服务中特定存储卷的连接。在将数据文件上传到存储卷之前，您需要先初始化一个 `VolumeFileManager` 实例。 | Java | v2"
type: docx
token: DK7ZdxRCyoepyxx0odzcH66xnu3
sidebar_position: 2
keywords: 
  - 开源向量 Database
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量 Database
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

`VolumeFileManager` 实例维护与 Zilliz Cloud Volume 服务中特定存储卷的连接。在将数据文件上传到存储卷之前，您需要先初始化一个 `VolumeFileManager` 实例。

```java
io.milvus.bulkwriter.VolumeFileManager
```

## 构造函数\{#constructor}

此构造函数会初始化一个新的 `VolumeFileManager` 实例，用于维护与 Zilliz Cloud Volume 服务中特定存储卷的连接。

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

- **cloudEndpoint** （*str*） -

    **[必需]**

    Zilliz Cloud Endpoint，即 `https://api.cloud.zilliz.com`。

- **apiKey** （*str*） -

    **[必需]**

    您的 Zilliz Cloud API key，具有足够权限管理 Zilliz Cloud Control Plane 上的存储卷。要获取 Zilliz Cloud API key，请按照 [API 密钥](/docs/manage-api-keys) 中的步骤操作。

- **volumeName** （*str*） -

    **[必需]**

    此次操作的目标存储卷的名称。

**返回类型：**

*VolumeFileManager*

**返回：**

一个 `VolumeFileManager` 实例，其中保存目标存储卷的连接设置，包含以下字段：

**参数：**

- **cloudEndpoint** （*String*） -

    用于申请存储卷并刷新临时存储凭据的 Zilliz Cloud Endpoint。

- **apiKey** （*String*） -

    用于对存储卷访问进行身份验证的 Zilliz Cloud API key。

- **volumeName** （*String*） -

    目标 Zilliz Cloud 存储卷的名称。

- **connectType** （*ConnectType*） -

    用于访问存储卷的连接策略。该值默认为 `ConnectType.AUTO`。

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
