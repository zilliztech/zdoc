---
title: "abortImport() | Java | v2"
slug: /java/java/v2-BulkImport-abortImport
sidebar_label: "abortImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "中止现有的批量导入作业。 | Java | v2"
type: docx
token: RayydoBX1oNrb0xAiOtciVyen9c
sidebar_position: 5
keywords: 
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - zilliz
  - zilliz cloud
  - 云
  - abortImport()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# abortImport()

中止现有的批量导入作业。

```java
public static String abortImport(String url, BaseDescribeImportRequest request)
```

## 请求语法\{#request-syntax}

```java
CloudDescribeImportRequest.builder()
    .apiKey(apiKey)
    .clusterId(clusterId)
    .projectId(projectId)
    .regionId(regionId)
    .jobId(jobId)
    .build();
```

### CloudDescribeImportRequest\{#clouddescribeimportrequest}

Zilliz Cloud 使用 `CloudDescribeImportRequest`。对于项目 Database 部署，请设置 `clusterId`，或同时设置 `projectId` 和 `regionId`。

**构建器方法：**

- `apiKey(String apiKey)`

    身份验证凭证。对于 Milvus，请使用 `userName:password`；对于 Zilliz Cloud，请使用 API 密钥。

- `clusterId(String clusterId)`

    Zilliz Cloud 集群部署的集群 ID。

- `projectId(String projectId)`

    Zilliz Cloud 项目 Database 部署的项目 ID。

- `regionId(String regionId)`

    Zilliz Cloud 项目 Database 部署的区域 ID。

- `jobId(String jobId)`

    要中止的导入作业标识符。

**返回值：**

*String*

导入 Endpoint 返回的 JSON 响应体。

**异常：**

- **Exception**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示针对 Zilliz Cloud 的 abortImport()。

```java
String response = BulkImportUtils.abortImport(CLOUD_URL,
    CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(JOB_ID)
        .build());
```
