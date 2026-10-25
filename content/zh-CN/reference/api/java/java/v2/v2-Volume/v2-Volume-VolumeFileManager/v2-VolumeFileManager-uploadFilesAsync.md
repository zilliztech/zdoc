---
title: "uploadFilesAsync() | Java | v2"
slug: /java/java/v2-VolumeFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会以异步方式将文件或目录上传到 Zilliz Cloud 存储卷，并支持可配置的重试、并发、分片上传和进度报告。 | Java | v2"
type: docx
token: Op8ydBXyZo2rlZxhgfNcaC3unRg
sidebar_position: 1
keywords: 
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 的工作原理
  - Zilliz
  - Zilliz Cloud
  - 云
  - uploadFilesAsync()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# uploadFilesAsync()

此操作会以异步方式将文件或目录上传到 Zilliz Cloud 存储卷，并支持可配置的重试、并发、分片上传和进度报告。

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

    存储卷内的目标目录。

- `uploadConcurrency(int uploadConcurrency)`

    并发上传的最大文件数。

- `maxRetries(int maxRetries)`

    每个文件的最大重试次数。

- `retryIntervalMillis(long retryIntervalMillis)`

    重试尝试之间的延迟，单位为毫秒。

- `progressListener(ProgressListener progressListener)`

    接收 UploadProgress 快照的回调。

- `partSizeBytes(long partSizeBytes)`

    分片上传的分片大小，单位为字节。非正值会启用自动大小计算。

**返回类型：**

*CompletableFuture&lt;UploadFilesResult&gt;*

**返回：**

一个 **CompletableFuture**，在所有文件上传完成后会以 **UploadFilesResult** 完成，其中标识目标存储卷和上传路径，并包含以下字段：

**参数：**

- **volumeName** （*String*） -

    文件所上传到的存储卷名称。

- **path** （*String*） -

    上传文件在存储卷内的路径。

**异常：**

- **Exception**

    当请求验证、传输或服务器执行失败时会抛出此异常。请检查异常消息以获取确切的失败原因。

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
