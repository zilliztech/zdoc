---
title: "bulkImport() | Java | v2"
slug: /java/java/v2-BulkImport-bulkImport
sidebar_label: "bulkImport()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "根据 Milvus 或 Zilliz Cloud 中准备好的数据文件创建批量导入任务。 | Java | v2"
type: docx
token: HlcKdFOnpouIUjxL5hLcUU1GnFb
sidebar_position: 2
keywords: 
  - 信息检索
  - 降维
  - hnsw 算法
  - 向量相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - bulkImport()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# bulkImport()

根据 Milvus 或 Zilliz Cloud 中准备好的数据文件创建批量导入任务。

```java
public static String bulkImport(String url, BaseImportRequest request)
```

## 请求语法\{#request-syntax}

将存储桶数据导入 Zilliz Cloud 时，请使用此请求。

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
  身份验证凭证。对于 Cloud 请求，请使用 Zilliz Cloud API 密钥；对于 Milvus 请求，请使用 `username:password`。

- **clusterId** (*String*) -<br/>
  基于集群的部署的集群标识符。对于项目 Database 部署，请改用 `projectId` 和 `regionId`。

- **projectId** (*String*) -<br/>
  项目 Database 部署的项目标识符。请与 `regionId` 搭配使用，而不要使用 `clusterId`。

- **regionId** (*String*) -<br/>
  项目 Database 部署的区域标识符。请与 `projectId` 搭配使用，而不要使用 `clusterId`。

- **dbName** (*String*) -<br/>
  默认值：`default`<br/>
  Dedicated 部署的目标 Database 名称。

- **collectionName** (*String*) -<br/>
  目标 Collection 名称。

- **partitionName** (*String*) -<br/>
  默认值：`default`<br/>
  当 Collection 未使用 Partition 键时的目标 Partition 名称。

- **objectUrls** (*List&lt;List&lt;String&gt;&gt;*) -<br/>
  要导入的存储桶文件夹或文件。支持多个路径和文件组。

- **objectUrl** (*String*) -<br/>
  已弃用的单个存储桶文件夹或文件 URL。对于新的集成，请使用 `objectUrls`。

- **accessKey** (*String*) -<br/>
  存储访问密钥。请与 `secretKey` 搭配使用；对于临时凭证，还需使用 `token`。

- **secretKey** (*String*) -<br/>
  存储密钥。请与 `accessKey` 搭配使用；对于临时凭证，还需使用 `token`。

- **token** (*String*) -<br/>
  使用短期凭证时的临时存储凭证令牌。

- **options** (*Map&lt;String, Object&gt;*) -<br/>
  传递给服务的其他导入选项。

**返回值：**

*String*

JSON 响应，其中的 `data.jobId` 用于标识已创建的导入任务。

## 示例\{#example}

为 Zilliz Cloud 中的项目 Database 创建导入任务。

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

