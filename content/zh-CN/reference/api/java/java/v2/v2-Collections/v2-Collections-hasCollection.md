---
title: "hasCollection() | Java | v2"
slug: /java/java/v2-Collections-hasCollection
sidebar_label: "hasCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作用于检查特定 Collection 是否存在。 | Java | v2"
type: docx
token: RaBJd4clVo6KX4xjGJoc3Mz7nhg
sidebar_position: 18
keywords: 
  - 稠密向量
  - 层次化可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - hasCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hasCollection()

此操作用于检查特定 Collection 是否存在。

```java
public Boolean hasCollection(HasCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
hasCollection(HasCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标 Collection 所属的 Database 名称。

- `collectionName(String collectionName)`

    Collection 的名称。

**返回类型：**

*bool*

**返回值：**

一个布尔值，指示指定的 Collection 是否存在。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.HasCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Check whether the collection exists
HasCollectionReq hasCollectionReq = HasCollectionReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.hasCollection(hasCollectionReq);
```

