---
title: "listImportJobs() | Java | v2"
slug: /java/java/v2-BulkImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Milvus または Zilliz Cloud の bulk import ジョブを一覧表示します。 | Java | v2"
type: docx
token: KZc2dLt74oh6VzxS4EYc7cEsn3d
sidebar_position: 4
keywords: 
  - milvus ベクトル db
  - Zilliz Cloud
  - what is milvus
  - milvus データベース
  - zilliz
  - zilliz cloud
  - cloud
  - listImportJobs()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listImportJobs()

Milvus または Zilliz Cloud の bulk import ジョブを一覧表示します。

```java
public static String listImportJobs(String url, BaseListImportJobsRequest request)
```

## Request Syntax\{#request-syntax}

このリクエストを使用して、Zilliz Cloud の import ジョブを一覧表示します。

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

**PARAMETERS:**

- **apiKey** (*String*) -<br/>
  認証資格情報です。Cloud リクエストには Zilliz Cloud API key を使用し、Milvus リクエストには `username:password` を使用します。

- **clusterId** (*String*) -<br/>
  クラスター identifier for クラスター-based deployments. For project データベース deployments, use `projectId` and `regionId` instead.

- **projectId** (*String*) -<br/>
  Project identifier for project データベース deployments. Use with `regionId` instead of `clusterId`.

- **regionId** (*String*) -<br/>
  Region identifier for project データベース deployments. Use with `projectId` instead of `clusterId`.

- **pageSize** (*Integer*) -<br/>
  1 ページあたりに返される import ジョブの数です。

- **currentPage** (*Integer*) -<br/>
  返される 1 始まりのページ番号です。

**RETURNS:**

*String*

一致する import ジョブとページネーションの詳細を含む JSON レスポンスです。

## Example\{#example}

Lists import jobs for a Zilliz Cloud project データベース.

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

