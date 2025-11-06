---
title: "uploadFilesAsync | Java | v2"
slug: /java/java/v2-StageFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation uploads the local file at the specified source path to the target file path within the specified stage. | Java | v2"
type: docx
token: GE25dbBmMoU8glxCWbJckYObnN1
sidebar_position: 2
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - uploadFilesAsync
  - javaV226
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# uploadFilesAsync

This operation uploads the local file at the specified source path to the target file path within the specified stage.

```java
public CompletableFuture<UploadFilesResult> uploadFilesAsync(UploadFilesRequest request)
```

## Request Syntax\{#request-syntax}

```java
uploadFileAsync(UploadFilesRequest.builder()
    .sourceFilePath(String sourceFilePath)
    .targetStagePath(String targetStagePath)
    .build();
)
```

**PARAMETERS**

- **source_file_path** (*str*) -

    **[REQUIRED]**

    The path to the local data file to be uploaded to the specified stage.

- **target_stage_path** (*str*) -

    **[REQUIRED]**

    The path to the data file within the specified stage after this operation.

**RETURN TYPE**

*CompletableFuture\<UploadFilesResult>*

**RETURNS**

A **CompletableFuture\<UploadFilesResult>** instance that resolves to an **UploadFilesResult** instance that has the following attributes.

- **stageName** (*str*) -

    **[REQUIRED]**

    The name of the target stage of this operation.

- **path** (*str*) -

    **[REQUIRED]**

    The path to the data file within the specified stage after this operation.

## Example\{#example}

```java
import com.google.gson.Gson;
import java.util.concurrent.CompletableFuture;
import io.milvus.bulkwriter.StageFileManager;
import io.milvus.bulkwriter.StageFileManagerParam;
import io.milvus.bulkwriter.request.UploadFilesRequest;
import io.milvus.bulkwriter.model.UploadFilesResult;
import io.milvus.bulkwriter.StageFileManager;
import io.milvus.bulkwriter.StageFileManagerParam;

StageFileManagerParam stageFileManagerParam = StageFileManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .withStageName("my_stage")
    .build();

StageFileManager stageFileManager = new StageFileManager(stageFileManagerParam);

UploadFilesRequest request = UploadFilesRequest.builder()
    .sourceFilePath("/path/to/your/local/data/file")
    .targetStagePath("data/")
    .build();

UploadFilesResult result = stageFileManager.uploadFilesAsync(request).get();

System.out.println("\nuploadFiles results: " + new Gson().toJson(result));

// uploadFileToStage results: 
// 
// {
//     "stageName": "my_stage",
//     "path": "data/"
// }
```
