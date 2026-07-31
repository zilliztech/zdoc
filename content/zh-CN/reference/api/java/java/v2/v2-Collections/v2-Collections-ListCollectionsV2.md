---
title: "ListCollectionsV2() | Java | v2"
slug: /java/java/v2-Collections-ListCollectionsV2
sidebar_label: "ListCollectionsV2()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出指定数据库中的所有现有集合。 | Java | v2"
type: docx
token: WY4idJdzCozGGnxmLoFcIjC2ndw
sidebar_position: 29
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - ListCollectionsV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# ListCollectionsV2()

此操作列出指定数据库中的所有现有集合。

```java
public ListCollectionsResp listCollectionsV2(ListCollectionsReq request)
```

## 请求语法\{#request-syntax}

```java
listCollectionsV2(ListCollectionsReq.builder()
    .databaseName(String databaseName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标数据库的名称。指定后，此操作将返回指定数据库中的所有集合。

**返回类型：**

*ListCollectionsResp*

**返回：**

一个包含集合名称列表的 **ListCollectionsResp** 对象。如果当前没有任何集合，则返回空列表。

**参数：**

- **collectionNames** (*List&lt;String&gt;*)

    一个字符串列表，包含所有现有集合的名称。

- **collectionInfos** (*List&lt;CollectionInfo&gt;*)

    一个 **CollectionInfo** 对象列表。**CollectionInfo** 对象包含以下字段：

    - **collectionName** (*String*)

        集合的名称。

    - **shardNum** (*Integer*)

        上述集合中的分片数量。

**异常：**

- **MilvusClientExceptions**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.ListCollectionsReq;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List collections
ListCollectionReq listCollectionReq = ListCollectionReq.builder()
    .databaseName("my_database")
    .build();

ListCollectionsResp listAliasResp = client.listCollectionsV2(listCollectionReq);
```

