---
title: "listImportJobs() | Java | v2"
slug: /java/java/v2-BulkImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "列出 Milvus 或 Zilliz Cloud 中的批量导入任务。 | Java | v2"
type: docx
token: KZc2dLt74oh6VzxS4EYc7cEsn3d
sidebar_position: 4
keywords: 
  - milvus 向量数据库
  - Zilliz Cloud
  - 什么是 milvus
  - milvus Database
  - zilliz
  - zilliz cloud
  - 云
  - listImportJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listImportJobs()

列出 Milvus 或 Zilliz Cloud 中的批量导入任务。

```java
public static String listImportJobs(String url, BaseListImportJobsRequest request)
```

## 请求语法\{#request-syntax}

使用此请求可列出 Zilliz Cloud 中的导入任务。

```java
CloudListImportJobsRequest.builder()
    .apiKey(apiKey)
    .clusterId(clusterId)
    .projectId(projectId)
    .regionId(regionId)
    .pageSize(pageSize)
    .currentPage(currentPage)
    .build();
```

**参数：**

- **apiKey** (*String*) -<br/>
  身份验证凭据。对于 Cloud 请求，请使用 Zilliz Cloud API 密钥；对于 Milvus 请求，请使用 `username:password`。

- **clusterId** (*String*) -<br/>
  基于集群的部署的集群标识符。对于项目 Database 部署，请改用 `projectId` 和 `regionId`。

- **projectId** (*String*) -<br/>
  项目 Database 部署的项目标识符。请将其与 `regionId` 配合使用，而不要使用 `clusterId`。

- **regionId** (*String*) -<br/>
  项目 Database 部署的区域标识符。请将其与 `projectId` 配合使用，而不要使用 `clusterId`。

- **pageSize** (*Integer*) -<br/>
  每页返回的导入任务数量。

- **currentPage** (*Integer*) -<br/>
  要返回的页码，从 1 开始。

**返回值：**

*String*

包含匹配导入任务和分页详细信息的 JSON 响应。

## 示例\{#example}

列出 Zilliz Cloud 项目 Database 的导入任务。

```java
CloudListImportJobsRequest request = CloudListImportJobsRequest.builder()
    .projectId(PROJECT_ID)
    .regionId(REGION_ID)
    .currentPage(1)
    .pageSize(10)
    .apiKey(API_KEY)
    .build();
String response = BulkImportUtils.listImportJobs("https://api.cloud.zilliz.com", request);
```

