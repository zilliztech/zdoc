---
title: "commitImport() | Java | v2"
slug: /java/java/v2-BulkImport-commitImport
sidebar_label: "commitImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "準備済みの bulk-import ジョブをコミットします。 | Java | v2"
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

準備済みの bulk-import ジョブをコミットします。

```java
public static String commitImport(String url, BaseDescribeImportRequest request)
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

Zilliz Cloud では `CloudDescribeImportRequest` を使用します。Zilliz Cloud cluster デプロイメントでは `clusterId` を設定するか、project database デプロイメントでは `projectId` と `regionId` の両方を設定します。

**BUILDER METHODS:**

- `apiKey(String apiKey)`

    認証資格情報です。Milvus には `userName:password` を、または Zilliz Cloud API key を使用します。

- `clusterId(String clusterId)`

    Zilliz Cloud cluster デプロイメントの cluster ID です。

- `projectId(String projectId)`

    Zilliz Cloud project database デプロイメントの project ID です。

- `regionId(String regionId)`

    Zilliz Cloud project database デプロイメントの region ID です。

- `jobId(String jobId)`

    コミットする import ジョブ識別子です。

**RETURNS:**

*String*

`import` エンドポイントから返される JSON レスポンス本文です。

**EXCEPTIONS:**

- **Exception**

    リクエストの検証、トランスポート、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

## Example\{#example}

Zilliz Cloud に対する commitImport() の例を示します。

```java
String response = BulkImportUtils.commitImport(CLOUD_URL,
    CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(JOB_ID)
        .build());
```
