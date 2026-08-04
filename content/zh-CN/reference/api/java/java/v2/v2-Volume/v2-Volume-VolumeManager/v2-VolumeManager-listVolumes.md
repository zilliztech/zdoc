---
title: "listVolumes() | Java | v2"
slug: /java/java/v2-VolumeManager-listVolumes
sidebar_label: "listVolumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "列出卷，可选择使用项目、类型和分页过滤器。 | Java | v2"
type: docx
token: CWVPd10ixoosYHxkJSScNe8mnoh
sidebar_position: 3
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - listVolumes()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listVolumes()

列出卷，可选择使用项目、类型和分页过滤器。

```java
public ListVolumesResponse listVolumes(ListVolumesRequest request)
```

## 请求语法\{#request-syntax}

```java
ListVolumesRequest.builder()
    .projectId(projectId)
    .pageSize(pageSize)
    .currentPage(currentPage)
    .type(type)
    .build();
```

**构建器方法：**

- `projectId(String projectId)`

    Zilliz Cloud 项目的 ID。

- `pageSize(Integer pageSize)`

    每页返回的卷数量。

- `currentPage(Integer currentPage)`

    要返回的页码。

- `type(String type)`

    可选的卷类型过滤器：`MANAGED` 或 `EXTERNAL`。

**返回：**

*ListVolumesResponse*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

列出卷，可选择使用项目、类型和分页过滤器。

```java
ListVolumesResponse response = volumeManager.listVolumes(
    ListVolumesRequest.builder()
        .projectId(PROJECT_ID)
        .type("S3")
        .currentPage(1)
        .pageSize(20)
        .build());
```
