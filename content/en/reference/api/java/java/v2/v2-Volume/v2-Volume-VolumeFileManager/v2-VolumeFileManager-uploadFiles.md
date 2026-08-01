---
title: "uploadFiles() | Java | v2"
slug: /java/java/v2-VolumeFileManager-uploadFiles
sidebar_label: "uploadFiles()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Synchronously uploads a file or directory to a Zilliz Cloud volume with retry, concurrency, multipart, and progress controls. | Java | v2"
type: docx
token: FiyGdmoSHoDbrPxhSdncsMWbnhc
sidebar_position: 4
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - uploadFiles()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# uploadFiles()

Synchronously uploads a file or directory to a Zilliz Cloud volume with retry, concurrency, multipart, and progress controls.

```java
public UploadFilesResult uploadFiles(UploadFilesRequest request)
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

*UploadFilesResult*

Identifies the target volume and uploaded path.

**EXCEPTIONS:**

- **Exception**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

```java
UploadFilesResult result = manager.uploadFiles(UploadFilesRequest.builder()
    .sourceFilePath("./data")
    .targetVolumePath("imports/")
    .uploadConcurrency(5)
    .maxRetries(5)
    .progressListener(progress -> System.out.println(progress.getPercent()))
    .build());
```
