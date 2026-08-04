---
title: "listImportJobs() | Java | v2"
slug: /java/java/v2-BulkImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "列出 Milvus 或 Zilliz Cloud 中的批量导入作业。 | Java | v2"
type: docx
token: KZc2dLt74oh6VzxS4EYc7cEsn3d
sidebar_position: 4
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - listImportJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listImportJobs()

列出 Milvus 或 Zilliz Cloud 中的批量导入作业。

```java
public static String listImportJobs(String url, BaseListImportJobsRequest request)
```

## 请求语法\{#request-syntax}

使用此请求列出 Zilliz Cloud 中的导入作业。

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
  身份验证凭证。对于 Cloud 请求，使用 Zilliz Cloud API key；对于 Milvus 请求，使用 `username:password`。

- **clusterId** (*String*) -<br/>
  基于集群的部署的集群标识符。对于项目数据库部署，请改用 `projectId` 和 `regionId`。

- **projectId** (*String*) -<br/>
  项目数据库部署的项目标识符。请与 `regionId` 一起使用，而不是 `clusterId`。

- **regionId** (*String*) -<br/>
  项目数据库部署的区域标识符。请与 `projectId` 一起使用，而不是 `clusterId`。

- **pageSize** (*Integer*) -<br/>
  每页返回的导入作业数量。

- **currentPage** (*Integer*) -<br/>
  要返回的页码，从 1 开始。

**返回：**

*String*

包含匹配的导入作业和分页详情的 JSON 响应。

## 示例\{#example}

列出某个 Zilliz Cloud 项目数据库的导入作业。

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

