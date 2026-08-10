---
title: "commitImport() | Java | v2"
slug: /java/java/v2-BulkImport-commitImport
sidebar_label: "commitImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "提交已准备好的批量导入任务。 | Java | v2"
type: docx
token: DFyndL57goJMr0xAcMEcVq5Lnhh
sidebar_position: 6
keywords: 
  - NLP
  - 神经网络
  - 深度学习
  - 知识库
  - zilliz
  - zilliz cloud
  - 云
  - commitImport()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# commitImport()

提交已准备好的批量导入任务。

```java
public static String commitImport(String url, BaseDescribeImportRequest request)
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

对于 Zilliz Cloud，使用 `CloudDescribeImportRequest`。设置 `clusterId`，或对于项目 Database 部署，同时设置 `projectId` 和 `regionId`。

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

    要提交的导入任务标识符。

**返回值：**

*String*

导入 Endpoint 返回的 JSON 响应体。

**异常：**

- **Exception**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示如何在 Zilliz Cloud 中使用 commitImport()。

```java
String response = BulkImportUtils.commitImport(CLOUD_URL,
    CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(JOB_ID)
        .build());
```
