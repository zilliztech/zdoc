---
title: "bulkImport() | Java | v2"
slug: /java/java/v2-BulkImport-bulkImport
sidebar_label: "bulkImport()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "从 Milvus 或 Zilliz Cloud 中准备好的数据文件创建批量导入任务。 | Java | v2"
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

从 Milvus 或 Zilliz Cloud 中准备好的数据文件创建批量导入任务。

```java
public static String bulkImport(String url, BaseImportRequest request)
```

## 请求语法\{#request-syntax}

将 bucket 数据导入到 Zilliz Cloud 时，请使用此请求。

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

**参数：**

- **apiKey** (*String*) -<br/>
  身份验证凭据。对于 Cloud 请求，请使用 Zilliz Cloud API 密钥；对于 Milvus 请求，请使用 `username:password`。

- **clusterId** (*String*) -<br/>
  基于集群的部署的集群标识符。对于项目数据库部署，请改用 `projectId` 和 `regionId`。

- **projectId** (*String*) -<br/>
  项目数据库部署的项目标识符。与 `regionId` 一起使用，以替代 `clusterId`。

- **regionId** (*String*) -<br/>
  项目数据库部署的区域标识符。与 `projectId` 一起使用，以替代 `clusterId`。

- **dbName** (*String*) -<br/>
  默认值：`default`<br/>
  Dedicated 部署的目标数据库名称。

- **collectionName** (*String*) -<br/>
  目标集合名称。

- **partitionName** (*String*) -<br/>
  默认值：`default`<br/>
  当集合未使用分区键时的目标分区名称。

- **objectUrls** (*List&lt;List&lt;String&gt;&gt;*) -<br/>
  要导入的 bucket 文件夹或文件。支持多个路径和文件组。

- **objectUrl** (*String*) -<br/>
  已弃用的单个 bucket 文件夹或文件 URL。对于新的集成，请使用 `objectUrls`。

- **accessKey** (*String*) -<br/>
  存储访问密钥。与 `secretKey` 一起使用；对于临时凭据，还需配合 `token` 使用。

- **secretKey** (*String*) -<br/>
  存储密钥。与 `accessKey` 一起使用；对于临时凭据，还需配合 `token` 使用。

- **token** (*String*) -<br/>
  使用短期凭据时的临时存储凭证令牌。

- **options** (*Map&lt;String, Object&gt;*) -<br/>
  传递给服务的其他导入选项。

**返回：**

*String*

JSON 响应，其中 `data.jobId` 标识已创建的导入任务。

## 示例\{#example}

为 Zilliz Cloud 中的项目数据库创建导入任务。

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

