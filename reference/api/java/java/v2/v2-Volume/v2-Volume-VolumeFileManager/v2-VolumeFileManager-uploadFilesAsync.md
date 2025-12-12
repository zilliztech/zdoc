---
title: "uploadFilesAsync | Java | v2"
slug: /java/java/v2-VolumeFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "This operation uploads the local file at the specified source path to the target file path within the specified volume. | Java | v2"
type: docx
token: GE25dbBmMoU8glxCWbJckYObnN1
sidebar_position: 1
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - uploadFilesAsync
  - javaV226
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# uploadFilesAsync

This operation uploads the local file at the specified source path to the target file path within the specified volume.

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

    The path to the local data file to be uploaded to the specified volume.

- **targetVolumePath** (*str*) -

    **[REQUIRED]**

    The path to the data file within the specified volume after this operation.

**RETURN TYPE**

*CompletableFuture\<UploadFilesResult>*

**RETURNS**

A **CompletableFuture\<UploadFilesResult>** instance that resolves to an **UploadFilesResult** instance that has the following attributes.

- **volumeName** (*str*) -

    **[REQUIRED]**

    The name of the target volume of this operation.

- **path** (*str*) -

    **[REQUIRED]**

    The path to the data file within the specified volume after this operation.

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
