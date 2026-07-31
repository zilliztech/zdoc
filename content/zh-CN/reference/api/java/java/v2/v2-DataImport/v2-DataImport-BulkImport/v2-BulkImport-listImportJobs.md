---
title: "listImportJobs() | Java | v2"
slug: /java/java/v2-BulkImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出指定 collection 的所有现有导入作业。 | Java | v2"
type: docx
token: CN9sdiCicoERZpx9GhmcLa4Wn7g
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

此操作列出指定 collection 的所有现有导入作业。

```java
public static String listImportJobs(String url, BaseListImportJobsRequest request)
```

## 请求语法\{#request-syntax}

```java
bulkImport.listImportJobs(
    url,
    request
)
```

**参数：**

- **url** (*String*) -

    Zilliz Cloud 的 Control Plane API 端点。端点 URL 应采用以下格式：

    ```python
    https://api.cloud.zilliz.com
    ```

- **request** (*[BaseListImportRequest](./v2-BulkImport-listImportJobs#baselistimportrequest)*) -  

    一个 **BaseImportRequest** 实例。

**返回类型：**

*String*

**返回：**

指定 collection 的导入作业 ID 列表。

## BaseListImportRequest\{#baselistimportrequest}

**BaseListImportRequest** 实例在 **CloudListImportRequest** 中实现。

### CloudListImportRequest\{#cloudlistimportrequest}

```java
CloudListImportRequest.builder()
    .apiKey(String apiKey)
    .collectionName(String collectionName)
    .build()
```

**构建器方法：**

- `apiKey(String apiKey)`

    具有足够权限来操作集群的有效 Zilliz Cloud API 密钥。

- `collectionName(String collectionName)`

    此操作目标 collection 的名称。

## 示例\{#example}

```java

```

