---
title: "shutdownGracefully() | Java | v2"
slug: /java/java/v2-VolumeFileManager-shutdownGracefully
sidebar_label: "shutdownGracefully()"
beta: false
added_since: false
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation gracefully shuts down the internal executor service of the VolumeFileManager, allowing pending upload tasks to complete before termination. | Java | v2"
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

This operation gracefully shuts down the internal executor service of the VolumeFileManager, allowing pending upload tasks to complete before termination.

```java
public void shutdownGracefully()
```

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

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
