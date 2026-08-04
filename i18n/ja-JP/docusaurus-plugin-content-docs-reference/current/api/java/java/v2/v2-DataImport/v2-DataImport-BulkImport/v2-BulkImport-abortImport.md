---
title: "abortImport() | Java | v2"
slug: /java/java/v2-BulkImport-abortImport
sidebar_label: "abortImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "既存の bulk-import ジョブを中止します。 | Java | v2"
type: docx
token: RayydoBX1oNrb0xAiOtciVyen9c
sidebar_position: 5
keywords: 
  - ANN Search
  - vector embeddings とは
  - vector database tutorial
  - vector databases はどのように動作するか
  - zilliz
  - zilliz cloud
  - cloud
  - abortImport()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# abortImport()

既存の bulk-import ジョブを中止します。

```java
public static String abortImport(String url, BaseDescribeImportRequest request)
```

## Request Syntax\{#request-syntax}

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

Zilliz Cloud では `CloudDescribeImportRequest` を使用します。Zilliz Cloud cluster デプロイメントには `clusterId` を設定し、project database デプロイメントには `projectId` と `regionId` の両方を設定します。

**BUILDER METHODS:**

- `apiKey(String apiKey)`

    認証資格情報。Milvus には `userName:password` を、または Zilliz Cloud API key を使用します。

- `clusterId(String clusterId)`

    Zilliz Cloud cluster デプロイメントの cluster ID。

- `projectId(String projectId)`

    Zilliz Cloud project database デプロイメントの project ID。

- `regionId(String regionId)`

    Zilliz Cloud project database デプロイメントの region ID。

- `jobId(String jobId)`

    中止する import ジョブ識別子。

**RETURNS:**

*String*

`import` エンドポイントから返される JSON レスポンスボディ。

**EXCEPTIONS:**

- **Exception**

    リクエストの検証、転送、またはサーバー実行に失敗した場合に発生します。正確な失敗理由は例外メッセージを確認してください。

## Example\{#example}

Zilliz Cloud に対する abortImport() の使用例を示します。

```java
String response = BulkImportUtils.abortImport(CLOUD_URL,
    CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(JOB_ID)
        .build());
```
