---
title: "uploadFilesAsync() | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager/v2-VolumeFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "以异步方式将文件或目录上传到 Zilliz Cloud volume，并支持可配置的重试、并发、多部分上传和进度报告。 | Java | v2"
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

以异步方式将文件或目录上传到 Zilliz Cloud volume，并支持可配置的重试、并发、多部分上传和进度报告。

```java
public CompletableFuture<UploadFilesResult> uploadFilesAsync(UploadFilesRequest request)
```

## 请求语法\{#request-syntax}

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

**构建器方法：**

- `sourceFilePath(String sourceFilePath)`

    要上传的本地文件或目录。

- `targetVolumePath(String targetVolumePath)`

    volume 内的目标目录。

- `uploadConcurrency(int uploadConcurrency)`

    同时上传的最大文件数量。

- `maxRetries(int maxRetries)`

    每个文件的最大重试次数。

- `retryIntervalMillis(long retryIntervalMillis)`

    重试尝试之间的延迟时间，单位为毫秒。

- `progressListener(ProgressListener progressListener)`

    一个接收 UploadProgress 快照的回调。

- `partSizeBytes(long partSizeBytes)`

    多部分上传中每个分片的大小，单位为字节。非正值将启用自动大小设置。

**返回：**

*CompletableFuture&lt;UploadFilesResult&gt;*

用于标识目标 volume 和已上传路径。

**异常：**

- **Exception**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
CompletableFuture<UploadFilesResult> future = manager.uploadFilesAsync(UploadFilesRequest.builder()
    .sourceFilePath("./data")
    .targetVolumePath("imports/")
    .uploadConcurrency(5)
    .maxRetries(5)
    .progressListener(progress -> System.out.println(progress.getPercent()))
    .build());
```
