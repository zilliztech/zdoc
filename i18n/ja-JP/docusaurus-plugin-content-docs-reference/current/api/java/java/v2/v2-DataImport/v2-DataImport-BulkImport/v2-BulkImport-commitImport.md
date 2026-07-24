---
title: "commitImport() | Java | v2"
slug: /java/java/v2-BulkImport-commitImport
sidebar_label: "commitImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "準備済みの一括インポートジョブをコミットします。 | Java | v2"
type: docx
token: DFyndL57goJMr0xAcMEcVq5Lnhh
sidebar_position: 6
keywords: 
  - NLP
  - ニューラルネットワーク
  - 深層学習
  - ナレッジベース
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

準備済みの一括インポートジョブをコミットします。

```java
public static String commitImport(String url, BaseDescribeImportRequest request)
```

## リクエスト構文\{#request-syntax}

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

Zilliz Cloud には `CloudDescribeImportRequest` を使用します。Zilliz Cloud cluster デプロイメントには `clusterId` を設定するか、プロジェクトデータベースデプロイメントには `projectId` と `regionId` の両方を設定します。

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

    コミットするインポートジョブ識別子です。

**RETURNS:**

*String*

インポートエンドポイントから返される JSON レスポンス本文です。

**EXCEPTIONS:**

- **Exception**

    リクエストの検証、トランスポート、またはサーバー実行が失敗したときに発生します。正確な失敗理由については例外メッセージを確認してください。

## 例\{#example}

Zilliz Cloud に対する commitImport() の使用例を示します。

```java
String response = BulkImportUtils.commitImport(CLOUD_URL,
    CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(JOB_ID)
        .build());
```
