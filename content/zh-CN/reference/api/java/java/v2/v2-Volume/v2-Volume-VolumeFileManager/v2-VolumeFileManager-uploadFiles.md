---
title: "uploadFiles() | Java | v2"
slug: /java/java/v2-VolumeFileManager-uploadFiles
sidebar_label: "uploadFiles()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可同步将文件或目录上传到 Zilliz Cloud 存储卷，并支持重试、并发、分段上传和进度控制。 | Java | v2"
type: docx
token: FiyGdmoSHoDbrPxhSdncsMWbnhc
sidebar_position: 4
keywords: 
  - IVF
  - knn
  - 图像搜索
  - 大语言模型
  - Zilliz
  - Zilliz Cloud
  - 云
  - uploadFiles()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# uploadFiles()

此操作可同步将文件或目录上传到 Zilliz Cloud 存储卷，并支持重试、并发、分段上传和进度控制。

```java
public UploadFilesResult uploadFiles(UploadFilesRequest request)
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

    存储卷内的目标目录。

- `uploadConcurrency(int uploadConcurrency)`

    并发上传的最大文件数。

- `maxRetries(int maxRetries)`

    每个文件的最大重试次数。

- `retryIntervalMillis(long retryIntervalMillis)`

    各次重试之间的延迟，单位为毫秒。

- `progressListener(ProgressListener progressListener)`

    用于接收 UploadProgress 快照的回调。

- `partSizeBytes(long partSizeBytes)`

    分段上传的分片大小，单位为字节。非正值会启用自动调整大小。

**返回类型：**

*UploadFilesResult*

**返回：**

一个 **UploadFilesResult** 对象，用于标识目标存储卷和已上传路径，包含以下字段：

**参数：**

- **volumeName** （*String*） -

    文件上传到的存储卷名称。

- **path** （*String*） -

    已上传文件在存储卷内的路径。

**异常：**

- **Exception**

    当请求验证、传输或服务器执行失败时抛出。请检查异常消息以了解确切的失败原因。

## 示例\{#example}

```java
UploadFilesResult result = manager.uploadFiles(UploadFilesRequest.builder()
    .sourceFilePath("./data")
    .targetVolumePath("imports/")
    .uploadConcurrency(5)
    .maxRetries(5)
    .progressListener(progress -> System.out.println(progress.getPercent()))
    .build());
```
