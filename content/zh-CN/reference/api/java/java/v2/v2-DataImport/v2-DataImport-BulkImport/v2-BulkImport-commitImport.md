---
title: "commitImport() | Java | v2"
slug: /java/java/v2-BulkImport-commitImport
sidebar_label: "commitImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "提交已准备好的 bulk-import 作业。 | Java | v2"
type: docx
token: DFyndL57goJMr0xAcMEcVq5Lnhh
sidebar_position: 6
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - commitImport()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# commitImport()

提交已准备好的 bulk-import 作业。

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

对于 Zilliz Cloud，使用 `CloudDescribeImportRequest`。设置 `clusterId`，或者对于 project database 部署，同时设置 `projectId` 和 `regionId`。

**构建器方法：**

- `apiKey(String apiKey)`

    身份验证凭证。对于 Milvus，使用 `userName:password`；对于 Zilliz Cloud，使用 API key。

- `clusterId(String clusterId)`

    Zilliz Cloud cluster 部署的集群 ID。

- `projectId(String projectId)`

    Zilliz Cloud project database 部署的项目 ID。

- `regionId(String regionId)`

    Zilliz Cloud project database 部署的地域 ID。

- `jobId(String jobId)`

    要提交的导入作业标识符。

**返回：**

*String*

导入端点返回的 JSON 响应体。

**异常：**

- **Exception**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示如何针对 Zilliz Cloud 调用 commitImport()。

```java
String response = BulkImportUtils.commitImport(CLOUD_URL,
    CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(JOB_ID)
        .build());
```
