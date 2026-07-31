---
title: "createVolume() | Java | v2"
slug: /java/java/v2-VolumeManager-createVolume
sidebar_label: "createVolume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建 volume。 | Java | v2"
type: docx
token: Efi4dCKhFoYpEZxRfWRcvFEXnBg
sidebar_position: 1
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - createVolume()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createVolume()

此操作用于创建 volume。

```java
public void createVolume(CreateVolumeRequest request)
```

## 请求语法\{#request-syntax}

```java
createVolume(CreateVolumeRequest.builder()
    .projectId(String projectId)
    .regionId(String regionId)
    .volumeName(String volumeName)
    .build();
)
```

**参数**

- **projectId** (*str*) -

    **[必填]**

    要创建的 volume 所属项目的 ID。

- **regionId** (*str*) -

    **[必填]**

    将创建 volume 的云区域 ID。你可以使用 [列出云区域](/reference/restful/list-cloud-regions-v2) 查看可选值。

- **volumeName** (*str*) -

    **[必填]**

    要创建的 volume 名称。

**返回类型**

*void*

**返回值**

无

## 示例\{#example}

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;
import io.milvus.bulkwriter.request.volume.CreateVolumeRequest;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);

CreateVolumeRequest request = CreateVolumeRequest.builder()
    .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
    .regionId("aws-us-west-1")
    .volumeName("my_volume")
    .build();

volumeManager.createVolume(request);

System.out.printf("\nVolume %s created%n", "my_volume");

// Volume my_volume created
```

