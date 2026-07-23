---
title: "listImportJobs() | Java | v2"
slug: /java/java/v2-BulkImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Milvus または Zilliz Cloud の一括インポートジョブを一覧表示します。 | Java | v2"
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

Milvus または Zilliz Cloud の一括インポートジョブを一覧表示します。

```java
public static String listImportJobs(String url, BaseListImportJobsRequest request)
```

## リクエスト構文\{#request-syntax}

このリクエストを使用して、Zilliz Cloud のインポートジョブを一覧表示します。

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

**パラメーター:**

- **apiKey** (*String*) -<br/>
  認証資格情報です。Cloud リクエストには Zilliz Cloud API key を使用し、Milvus リクエストには `username:password` を使用します。

- **clusterId** (*String*) -<br/>
  クラスターベースのデプロイメント用のクラスター識別子です。プロジェクトデータベースのデプロイメントでは、代わりに `projectId` と `regionId` を使用します。

- **projectId** (*String*) -<br/>
  プロジェクトデータベースのデプロイメント用のプロジェクト識別子です。`clusterId` の代わりに `regionId` と組み合わせて使用します。

- **regionId** (*String*) -<br/>
  プロジェクトデータベースのデプロイメント用のリージョン識別子です。`clusterId` の代わりに `projectId` と組み合わせて使用します。

- **pageSize** (*Integer*) -<br/>
  1ページあたりに返されるインポートジョブ数です。

- **currentPage** (*Integer*) -<br/>
  返すページ番号です。1 始まりです。

**戻り値:**

*String*

一致するインポートジョブとページネーションの詳細を含む JSON レスポンスです。

## 例\{#example}

Zilliz Cloud のプロジェクトデータベースのインポートジョブを一覧表示します。

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

