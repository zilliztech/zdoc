---
title: "releaseCollection() | Java | v2"
slug: /java/java/v2-Management-releaseCollection
sidebar_label: "releaseCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将特定 Collection 的数据从内存中释放。 | Java | v2"
type: docx
token: AjbDdUJTuoB9MqxN5PDcyYeLnRe
sidebar_position: 16
keywords: 
  - IVF
  - knn
  - 图像搜索
  - LLMs
  - Zilliz
  - Zilliz Cloud
  - 云
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

    Database 名称。如果未指定，则默认为当前 Database。

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `async(Boolean async)` -

    是否异步运行此操作。该值默认为 `Boolean.TRUE`。

- `timeout(Long timeout)` -

    超时时间，单位为毫秒。该值默认为 `60000L`。

**异常：**

- **MilvusClientException**

    如果此操作过程中发生错误，则会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;
import java.util.Set;

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
