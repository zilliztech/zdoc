---
title: "releaseCollection() | Java | v2"
slug: /java/java/v2-Management-releaseCollection
sidebar_label: "releaseCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会将特定 Collection 的数据从内存中释放。 | Java | v2"
type: docx
token: K5t2dl0XloN4VHx1lcpc6Uq3nye
sidebar_position: 16
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - releaseCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# releaseCollection()

此操作会将特定 Collection 的数据从内存中释放。

```java
public void releaseCollection(ReleaseCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
releaseCollection(ReleaseCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如未指定，则默认为当前 Database。

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `async(Boolean async)` -

    是否异步运行此操作。默认为 `Boolean.TRUE`。

- `timeout(Long timeout)` -

    超时时长，以毫秒为单位。默认为 `60000L`。

**返回值：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Release collection "test"
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
        .collectionName("test")
        .build();
client.releaseCollection(releaseCollectionReq);
```
