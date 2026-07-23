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
  - 情報検索
  - 次元削減
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

## リクエスト構文\{#request-syntax}

bucket データを Zilliz Cloud にインポートする場合は、このリクエストを使用します。

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

**パラメータ:**

- **apiKey** (*String*) -<br/>
  認証資格情報です。Cloud リクエストには Zilliz Cloud API key を使用し、Milvus リクエストには `username:password` を使用します。

- **clusterId** (*String*) -<br/>
  cluster ベースのデプロイ用の cluster 識別子です。プロジェクトデータベースのデプロイでは、代わりに `projectId` と `regionId` を使用します。

- **projectId** (*String*) -<br/>
  プロジェクトデータベースのデプロイ用のプロジェクト識別子です。`clusterId` の代わりに `regionId` と組み合わせて使用します。

- **regionId** (*String*) -<br/>
  プロジェクトデータベースのデプロイ用のリージョン識別子です。`clusterId` の代わりに `projectId` と組み合わせて使用します。

- **dbName** (*String*) -<br/>
  デフォルト: `default`<br/>
  Dedicated デプロイ用の対象データベース名です。

- **collectionName** (*String*) -<br/>
  対象 collection 名です。

- **partitionName** (*String*) -<br/>
  デフォルト: `default`<br/>
  collection が partition key を使用しない場合の対象 partition 名です。

- **objectUrls** (*List&lt;List&lt;String&gt;&gt;*) -<br/>
  インポートする bucket フォルダまたはファイルです。複数のパスとファイルグループをサポートします。

- **objectUrl** (*String*) -<br/>
  非推奨の単一 bucket フォルダまたはファイル URL です。新しい統合では `objectUrls` を使用してください。

- **accessKey** (*String*) -<br/>
  ストレージ access key です。`secretKey` と、必要に応じて一時的な認証情報用の `token` と一緒に使用します。

- **secretKey** (*String*) -<br/>
  ストレージ secret key です。`accessKey` と、必要に応じて一時的な認証情報用の `token` と一緒に使用します。

- **token** (*String*) -<br/>
  短期認証情報を使用する場合の一時的なストレージ認証情報トークンです。

- **options** (*Map&lt;String, Object&gt;*) -<br/>
  サービスに渡される追加のインポートオプションです。

**戻り値:**

*String*

`data.jobId` に作成されたインポートジョブの識別子を含む JSON レスポンスです。

## 例\{#example}

Zilliz Cloud のプロジェクトデータベース用のインポートジョブを作成します。

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

