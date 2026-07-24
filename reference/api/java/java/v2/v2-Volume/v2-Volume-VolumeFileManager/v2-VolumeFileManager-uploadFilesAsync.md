---
title: "uploadFilesAsync() | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager/v2-VolumeFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Asynchronously uploads a file or directory to a Zilliz Cloud volume with configurable retry, concurrency, multipart, and progress reporting. | Java | v2"
type: docx
token: Op8ydBXyZo2rlZxhgfNcaC3unRg
sidebar_position: 5
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - zilliz
  - zilliz cloud
  - cloud
  - uploadFilesAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# uploadFilesAsync()

Asynchronously uploads a file or directory to a Zilliz Cloud volume with configurable retry, concurrency, multipart, and progress reporting.

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

    The local file or directory to upload.

- `targetVolumePath(String targetVolumePath)`

    The destination directory inside the volume.

- `uploadConcurrency(int uploadConcurrency)`

    The maximum number of files uploaded concurrently.

- `maxRetries(int maxRetries)`

    The maximum number of retries for each file.

- `retryIntervalMillis(long retryIntervalMillis)`

    The delay between retry attempts in milliseconds.

- `progressListener(ProgressListener progressListener)`

    A callback that receives UploadProgress snapshots.

- `partSizeBytes(long partSizeBytes)`

    The multipart upload part size in bytes. Non-positive values enable automatic sizing.

**RETURNS:**

*CompletableFuture&lt;UploadFilesResult&gt;*

Identifies the target volume and uploaded path.

**EXCEPTIONS:**

- **Exception**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

```java
CompletableFuture<UploadFilesResult> future = manager.uploadFilesAsync(UploadFilesRequest.builder()
    .sourceFilePath("./data")
    .targetVolumePath("imports/")
    .uploadConcurrency(5)
    .maxRetries(5)
    .progressListener(progress -> System.out.println(progress.getPercent()))
    .build());
```
