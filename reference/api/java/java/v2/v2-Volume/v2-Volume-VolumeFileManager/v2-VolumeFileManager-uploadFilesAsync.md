---
title: "uploadFilesAsync | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager/v2-VolumeFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "Uploads a local file or directory to a volume asynchronously. | Java | v2"
type: docx
token: K8JSdXyEJoN8XKxDWebc8TfPnge
sidebar_position: 4
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


# uploadFilesAsync()

Uploads a local file or directory to a volume asynchronously.

```java
public CompletableFuture<UploadFilesResult> uploadFilesAsync(UploadFilesRequest request)
```

## Request Syntax\{#request-syntax}

```java
UploadFilesRequest.builder()
    .sourceFilePath(sourceFilePath)
    .targetVolumePath(targetVolumePath)
    .uploadConcurrency(uploadConcurrency)
    .maxRetries(maxRetries)
    .retryIntervalMillis(retryIntervalMillis)
    .progressListener(progressListener)
    .partSizeBytes(partSizeBytes)
    .build();
```

**BUILDER METHODS:**

- `sourceFilePath(String sourceFilePath)`

    The full path of the local file or directory to upload. Directory paths must end with `/`.

- `targetVolumePath(String targetVolumePath)`

    The destination directory in the volume. Leave it empty for the root directory, or end it with `/` for a folder.

- `uploadConcurrency(int uploadConcurrency)`

    The maximum number of files uploaded concurrently. Defaults to **5**.

- `maxRetries(int maxRetries)`

    The maximum number of retries for each file. Defaults to **5**.

- `retryIntervalMillis(long retryIntervalMillis)`

    The interval between retries, in milliseconds. Defaults to **5,000** milliseconds.

- `progressListener(ProgressListener progressListener)`

    The optional `ProgressListener` callback that receives upload progress snapshots.

- `partSizeBytes(long partSizeBytes)`

    The multipart upload part size in bytes. A value of **0** or less selects the part size automatically.

**RETURNS:**

*CompletableFuture&lt;UploadFilesResult&gt;*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    Raised when any error occurs during this operation. Inspect the exception message for the exact failure reason.

## Example\{#example}

### Java example\{#java-example}

Uploads a local file or directory to a volume asynchronously.

```java
CompletableFuture<UploadFilesResult> future = volumeFileManager.uploadFilesAsync(
    UploadFilesRequest.builder()
        .sourceFilePath("/data/books.json")
        .targetVolumePath("imports/books.json")
        .uploadConcurrency(5)
        .build());
UploadFilesResult result = future.get();
```
