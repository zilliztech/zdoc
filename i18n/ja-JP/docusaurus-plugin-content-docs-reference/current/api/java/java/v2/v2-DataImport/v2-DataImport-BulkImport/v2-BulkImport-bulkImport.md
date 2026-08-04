---
title: "bulkImport() | Java | v2"
slug: /java/java/v2-BulkImport-bulkImport
sidebar_label: "bulkImport()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Milvus または Zilliz Cloud 内の準備済みデータファイルから bulk import ジョブを作成します。 | Java | v2"
type: docx
token: HlcKdFOnpouIUjxL5hLcUU1GnFb
sidebar_position: 2
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - bulkImport()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# bulkImport()

Milvus または Zilliz Cloud 内の準備済みデータファイルから bulk import ジョブを作成します。

```java
public static String bulkImport(String url, BaseImportRequest request)
```

## Request Syntax\{#request-syntax}

Zilliz Cloud に bucket データをインポートする場合は、このリクエストを使用します。

```java
CloudImportRequest.builder()
    .apiKey(apiKey)
    .clusterId(clusterId)
    .projectId(projectId)
    .regionId(regionId)
    .dbName(dbName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .objectUrls(objectUrls)
    .objectUrl(objectUrl)
    .accessKey(accessKey)
    .secretKey(secretKey)
    .token(token)
    .options(options)
    .build();
```

**PARAMETERS:**

- **apiKey** (*String*) -<br/>
  認証資格情報。Cloud リクエストには Zilliz Cloud API key を使用し、Milvus リクエストには `username:password` を使用します。

- **clusterId** (*String*) -<br/>
  cluster ベースのデプロイ向けの cluster 識別子。project database デプロイでは、代わりに `projectId` と `regionId` を使用します。

- **projectId** (*String*) -<br/>
  project database デプロイ向けの project 識別子。`clusterId` の代わりに `regionId` と組み合わせて使用します。

- **regionId** (*String*) -<br/>
  project database デプロイ向けのリージョン識別子。`clusterId` の代わりに `projectId` と組み合わせて使用します。

- **dbName** (*String*) -<br/>
  デフォルト: `default`<br/>
  Dedicated デプロイ向けの対象データベース名。

- **collectionName** (*String*) -<br/>
  対象 collection 名。

- **partitionName** (*String*) -<br/>
  デフォルト: `default`<br/>
  collection が partition key を使用しない場合の対象 partition 名。

- **objectUrls** (*List&lt;List&lt;String&gt;&gt;*) -<br/>
  インポートする bucket フォルダまたはファイル。複数のパスとファイルグループをサポートします。

- **objectUrl** (*String*) -<br/>
  非推奨の単一 bucket フォルダまたはファイル URL。新しい連携では `objectUrls` を使用してください。

- **accessKey** (*String*) -<br/>
  ストレージ access key。`secretKey` と、必要に応じて一時的な認証情報用の `token` と一緒に使用します。

- **secretKey** (*String*) -<br/>
  ストレージ secret key。`accessKey` と、必要に応じて一時的な認証情報用の `token` と一緒に使用します。

- **token** (*String*) -<br/>
  短期認証情報を使用する場合の一時的なストレージ認証トークン。

- **options** (*Map&lt;String, Object&gt;*) -<br/>
  サービスに渡される追加のインポートオプション。

**RETURNS:**

*String*

`data.jobId` が作成されたインポートジョブを識別する JSON レスポンスです。

## Example\{#example}

Zilliz Cloud 内の project database 用のインポートジョブを作成します。

```java
CloudImportRequest request = CloudImportRequest.builder()
    .projectId(PROJECT_ID)
    .regionId(REGION_ID)
    .collectionName("books")
    .objectUrls(List.of(List.of("s3://bucket/books.parquet")))
    .accessKey(ACCESS_KEY)
    .secretKey(SECRET_KEY)
    .apiKey(API_KEY)
    .build();
String response = BulkImportUtils.bulkImport("https://api.cloud.zilliz.com", request);
```

