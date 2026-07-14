---
title: "shutdownGracefully() | Java | v2"
slug: /java/java/v2-VolumeFileManager-shutdownGracefully
sidebar_label: "shutdownGracefully()"
beta: false
added_since: false
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、VolumeFileManager の内部 executor service を正常にシャットダウンし、終了前に保留中のアップロードタスクが完了できるようにします。 | Java | v2"
type: docx
token: TuyKdaa1SoOstTx9DglcWfzknTh
sidebar_position: 3
keywords: 
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - shutdownGracefully()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# shutdownGracefully()

この操作は、VolumeFileManager の内部 executor service を正常にシャットダウンし、終了前に保留中のアップロードタスクが完了できるようにします。

```java
public void shutdownGracefully()
```

**戻り値:**

*void*

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

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
