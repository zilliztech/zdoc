---
title: "getImportProgress() | Java | v2"
slug: /java/java/v2-BulkImport-getImportProgress
sidebar_label: "getImportProgress()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Milvus または Zilliz Cloud の一括インポートジョブの現在の状態と進行状況を取得します。 | Java | v2"
type: docx
token: OFZ3dUGwmoarOBx6FHScZwwtn8f
sidebar_position: 3
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - getImportProgress()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getImportProgress()

Milvus または Zilliz Cloud の一括インポートジョブの現在の状態と進行状況を取得します。

```java
public static String getImportProgress(String url, BaseDescribeImportRequest request)
```

## Request Syntax\{#request-syntax}

Zilliz Cloud で作成されたインポートジョブには、このリクエストを使用します。

```java
CloudDescribeImportRequest.builder()
    .apiKey(apiKey)
    .clusterId(clusterId)
    .projectId(projectId)
    .regionId(regionId)
    .jobId(jobId)
    .build();
```

**PARAMETERS:**

- **apiKey** (*String*) -<br/>
  認証資格情報。Cloud リクエストには Zilliz Cloud API キーを使用し、Milvus リクエストには `username:password` を使用します。

- **clusterId** (*String*) -<br/>
  クラスター型デプロイメント用のクラスター識別子。プロジェクトデータベースデプロイメントでは、代わりに `projectId` と `regionId` を使用します。

- **projectId** (*String*) -<br/>
  プロジェクトデータベースデプロイメント用のプロジェクト識別子。`clusterId` の代わりに `regionId` と一緒に使用します。

- **regionId** (*String*) -<br/>
  プロジェクトデータベースデプロイメント用のリージョン識別子。`clusterId` の代わりに `projectId` と一緒に使用します。

- **jobId** (*String*) -<br/>
  確認対象のインポートジョブの識別子。

**RETURNS:**

*String*

インポートジョブの状態、進行状況、および関連する詳細を含む JSON レスポンス。

## Example\{#example}

プロジェクト識別子とリージョン識別子を使用してインポートの進行状況を取得します。

```java
CloudDescribeImportRequest request = CloudDescribeImportRequest.builder()
    .projectId(PROJECT_ID)
    .regionId(REGION_ID)
    .jobId(jobId)
    .apiKey(API_KEY)
    .build();
String response = BulkImportUtils.getImportProgress("https://api.cloud.zilliz.com", request);
```

