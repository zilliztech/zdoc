---
title: "getVolumeUploadResult() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getVolumeUploadResult
sidebar_label: "getVolumeUploadResult()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检索对指定存储卷的更新结果。 | Java | v2"
type: docx
token: GoMYdKZRforUT0x23CDcyDKgnFf
sidebar_position: 6
keywords: 
  - 视频去重
  - 视频相似度搜索
  - 向量检索
  - 音频相似度搜索
  - zilliz
  - zilliz cloud
  - 云
  - getVolumeUploadResult()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getVolumeUploadResult()

此操作检索对指定存储卷的更新结果。

```java
public UploadFilesResult getVolumeUploadResult()
```

**参数：**

*无*

**返回类型：**

*UploadFilesResult*

**返回值：**

一个具有以下方法的 UploadFilesResult 实例：

- `getVolumeName()`

    返回目标存储卷的名称。

- `setVolumeName()`

    设置目标存储卷的名称。

- `getPath()`

    返回上传到目标存储卷的文件路径。

- `setPath()`

    设置上传到目标存储卷的文件路径。

- `toString()`

    将 UploadFilesResult 实例转换为字符串。

## 示例\{#example}

```java
VolumeBulkWriter writer = new VolumeBulkWriter(config);
// ... append rows
UploadFilesResult result = writer.getVolumeUploadResult();

System.out.println("Target volume: " + result.getVolumeName());
System.out.println("Target paths: " + result.getPath());
```

