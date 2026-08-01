---
title: "bulkImport() | Java | v2"
slug: /java/java/v2-BulkImport-bulkImport
sidebar_label: "bulkImport()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Creates a bulk import job from prepared data files in Milvus or Zilliz Cloud. | Java | v2"
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

Creates a bulk import job from prepared data files in Milvus or Zilliz Cloud.

```java
public static String bulkImport(String url, BaseImportRequest request)
```

## Request Syntax\{#request-syntax}

Use this request when importing bucket data into Zilliz Cloud.

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
  Authentication credential. Use the Zilliz Cloud API key for Cloud requests or `username:password` for Milvus requests.

- **clusterId** (*String*) -<br/>
  Cluster identifier for cluster-based deployments. For project database deployments, use `projectId` and `regionId` instead.

- **projectId** (*String*) -<br/>
  Project identifier for project database deployments. Use with `regionId` instead of `clusterId`.

- **regionId** (*String*) -<br/>
  Region identifier for project database deployments. Use with `projectId` instead of `clusterId`.

- **dbName** (*String*) -<br/>
  Default: `default`<br/>
  Target database name for Dedicated deployments.

- **collectionName** (*String*) -<br/>
  Target collection name.

- **partitionName** (*String*) -<br/>
  Default: `default`<br/>
  Target partition name when the collection does not use a partition key.

- **objectUrls** (*List&lt;List&lt;String&gt;&gt;*) -<br/>
  Bucket folders or files to import. Supports multiple paths and file groups.

- **objectUrl** (*String*) -<br/>
  Deprecated single bucket folder or file URL. Use `objectUrls` for new integrations.

- **accessKey** (*String*) -<br/>
  Storage access key. Use with `secretKey` and, for temporary credentials, `token`.

- **secretKey** (*String*) -<br/>
  Storage secret key. Use with `accessKey` and, for temporary credentials, `token`.

- **token** (*String*) -<br/>
  Temporary storage credential token when short-term credentials are used.

- **options** (*Map&lt;String, Object&gt;*) -<br/>
  Additional import options passed to the service.

**RETURNS:**

*String*

A JSON response whose `data.jobId` identifies the created import job.

## Example\{#example}

Creates an import job for a project database in Zilliz Cloud.

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

