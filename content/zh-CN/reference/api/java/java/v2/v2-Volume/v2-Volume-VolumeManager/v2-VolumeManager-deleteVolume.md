---
title: "deleteVolume() | Java | v2"
slug: /java/java/v2-VolumeManager-deleteVolume
sidebar_label: "deleteVolume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个卷。 | Java | v2"
type: docx
token: OalndLUMRoUqpMxr2QscYTCenre
sidebar_position: 2
keywords: 
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - deleteVolume()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# deleteVolume()

此操作会删除一个卷。

```java
public void deleteVolume(DeleteVolumeRequest request)
```

## 请求语法\{#request-syntax}

```java
deleteVolume(DeleteVolumeRequest.builder()
    .volumeName(String volumeName)
    .build();
)
```

**参数**

- **volumeName** (*str*) -

    **[必需]**

    要删除的卷名称。

**返回类型**

*void*

**返回**

无

## 示例\{#example}

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;
import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);

DeleteVolumeRequest request = DeleteVolumeRequest.builder()
    .volumeName("my_volume")
    .build();

volumeManager.deleteVolume(request);

System.out.printf("\nVolume %s deleted%n", "my_volume");

// Volume my_volume deleted
```

