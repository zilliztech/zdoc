---
title: "renameCollection() | Java | v2"
slug: /java/java/v2-Collections-renameCollection
sidebar_label: "renameCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会重命名现有的 Collection。 | Java | v2"
type: docx
token: U7Ipdm0FTo8FCVxaxbZcwMygnWd
sidebar_position: 19
keywords: 
  - 检索增强生成
  - 大语言模型
  - 向量化
  - k 近邻算法
  - Zilliz
  - Zilliz Cloud
  - 云
  - renameCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# renameCollection()

此操作会重命名现有的 Collection。

```java
public void renameCollection(RenameCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
renameCollection(RenameCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .newCollectionName(String newCollectionName)
    .targetDbName(String targetDbName)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，则默认为当前 Database。

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `newCollectionName(String newCollectionName)` -

    Collection 的新名称。

- `targetDbName(String targetDbName)` -

    目标 Database 的名称。当将 Collection 移到另一个 Database 时，请设置此参数。

**异常：**

- **MilvusClientException**

    如果在此操作期间发生任何错误，则会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.RenameCollectionReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Rename collection "test" to "test2"
RenameCollectionReq renameCollectionReq = RenameCollectionReq.builder()
        .collectionName("test")
        .newCollectionName("test2")
        .build();
client.renameCollection(renameCollectionReq);
```
