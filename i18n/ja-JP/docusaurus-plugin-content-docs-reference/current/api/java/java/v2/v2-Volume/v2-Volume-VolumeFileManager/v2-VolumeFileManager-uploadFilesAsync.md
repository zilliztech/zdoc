---
title: "uploadFilesAsync | Java | v2"
slug: /java/java/v2-VolumeFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたソースパスにあるローカルファイルを、指定された volume 内のターゲットファイルパスにアップロードします。 | Java | v2"
type: docx
token: GE25dbBmMoU8glxCWbJckYObnN1
sidebar_position: 1
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - uploadFilesAsync
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# uploadFilesAsync

この操作は、指定されたソースパスにあるローカルファイルを、指定された volume 内のターゲットファイルパスにアップロードします。

```java
public CompletableFuture<UploadFilesResult> uploadFilesAsync(UploadFilesRequest request)
```

## Request Syntax\{#request-syntax}

```java
uploadFileAsync(UploadFilesRequest.builder()
    .sourceFilePath(String sourceFilePath)
    .targetVolumePath(String targetVolumePath)
    .build();
)
```

**PARAMETERS**

- **sourceFilePath** (*str*) -

    **[REQUIRED]**

    指定された volume にアップロードするローカルデータファイルへのパス。

- **targetVolumePath** (*str*) -

    **[REQUIRED]**

    この操作後に、指定された volume 内でデータファイルが配置されるパス。

**RETURN TYPE**

*CompletableFuture&lt;UploadFilesResult&gt;*

**RETURNS**

**CompletableFuture&lt;UploadFilesResult&gt;** インスタンスを返します。これは、以下の属性を持つ **UploadFilesResult** インスタンスに解決されます。

- **volumeName** (*str*) -

    **[REQUIRED]**

    この操作のターゲット volume の名前。

- **path** (*str*) -

    **[REQUIRED]**

    この操作後に、指定された volume 内でデータファイルが配置されるパス。

## Example\{#example}

```java
import com.google.gson.Gson;
import java.util.concurrent.CompletableFuture;
import io.milvus.bulkwriter.VolumeFileManager;
import io.milvus.bulkwriter.VolumeFileManagerParam;
import io.milvus.bulkwriter.request.volume.UploadFilesRequest;
import io.milvus.bulkwriter.model.UploadFilesResult;

VolumeFileManagerParam volumeFileManagerParam = VolumeFileManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .withVolumeName("my_volume")
    .build();

VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);

UploadFilesRequest request = UploadFilesRequest.builder()
    .sourceFilePath("/path/to/your/local/data/file")
    .targetVolumePath("data/")
    .build();

UploadFilesResult result = volumeFileManager.uploadFilesAsync(request).get();

System.out.println("\nuploadFiles results: " + new Gson().toJson(result));

// uploadFiles results: 
// 
// {
//     "volumeName": "my_volume",
//     "path": "data/"
// }
```
