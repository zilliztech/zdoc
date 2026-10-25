---
title: "getImportProgress() | Java | v2"
slug: /java/java/v2-BulkImport-getImportProgress
sidebar_label: "getImportProgress()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Milvus または Zilliz Cloud における bulk import ジョブの現在の状態と進行状況を取得します。 | Java | v2"
type: docx
token: OFZ3dUGwmoarOBx6FHScZwwtn8f
sidebar_position: 3
keywords: 
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - クラウド
  - getImportProgress()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getImportProgress()

Milvus または Zilliz Cloud における bulk import ジョブの現在の状態と進行状況を取得します。

```java
public static String getImportProgress(String url, BaseDescribeImportRequest request)
```

## Request Syntax\{#request-syntax}

Zilliz Cloud で作成された import ジョブには、このリクエストを使用します。

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
  認証資格情報です。Cloud リクエストには Zilliz Cloud API key を、Milvus リクエストには `username:password` を使用します。

- **clusterId** (*String*) -<br/>
  クラスター identifier for クラスター-based deployments. For project データベース deployments, use `projectId` and `regionId` instead.

- **projectId** (*String*) -<br/>
  Project identifier for project データベース deployments. Use with `regionId` instead of `clusterId`.

- **regionId** (*String*) -<br/>
  Region identifier for project データベース deployments. Use with `projectId` instead of `clusterId`.

- **jobId** (*String*) -<br/>
  確認する import ジョブの識別子です。

**RETURNS:**

*String*

A JSON response containing the import job state, progress, and related details.

## Example\{#example}

project と region の識別子を使用して import の進行状況を取得します。

```java
CloudDescribeImportRequest request = CloudDescribeImportRequest.builder()
    .projectId(PROJECT_ID)
    .regionId(REGION_ID)
    .jobId(jobId)
    .apiKey(API_KEY)
    .build();
String response = BulkImportUtils.getImportProgress("https://api.cloud.zilliz.com", request);
```

