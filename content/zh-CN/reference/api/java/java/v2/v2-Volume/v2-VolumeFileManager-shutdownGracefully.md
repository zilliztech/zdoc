---
title: "shutdownGracefully() | Java | v2"
slug: /java/java/v2-VolumeFileManager-shutdownGracefully
sidebar_label: "shutdownGracefully()"
beta: false
added_since: false
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会优雅地关闭 VolumeFileManager 的内部执行器服务，允许待处理的上传任务在终止前完成。 | Java | v2"
type: docx
token: TuyKdaa1SoOstTx9DglcWfzknTh
sidebar_position: 3
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - shutdownGracefully()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# shutdownGracefully()

此操作会优雅地关闭 VolumeFileManager 的内部执行器服务，允许待处理的上传任务在终止前完成。

```java
public void shutdownGracefully()
```

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.bulkwriter.VolumeFileManager;
import io.milvus.bulkwriter.VolumeFileManagerParam;
import io.milvus.bulkwriter.common.clientenum.ConnectType;
import io.milvus.bulkwriter.model.UploadFilesResult;
import io.milvus.bulkwriter.request.volume.UploadFilesRequest;

// Initialize VolumeFileManager
VolumeFileManagerParam param = VolumeFileManagerParam.newBuilder()
        .withCloudEndpoint("https://api.cloud.zilliz.com")
        .withApiKey("your_api_key")
        .withVolumeName("your_volume_name")
        .withConnectType(ConnectType.AUTO)
        .build();
VolumeFileManager manager = new VolumeFileManager(param);

// Upload files asynchronously
UploadFilesRequest request = UploadFilesRequest.builder()
        .sourceFilePath("/path/to/data/")
        .targetVolumePath("data/")
        .build();
UploadFilesResult result = manager.uploadFilesAsync(request).get();

// Gracefully shut down the manager when done
manager.shutdownGracefully();
```
