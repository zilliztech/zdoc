---
title: "ListCollectionsV2() | Java | v2"
slug: /java/java/v2-Collections-ListCollectionsV2
sidebar_label: "ListCollectionsV2()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出指定 Database 中所有现有的 Collection。 | Java | v2"
type: docx
token: WY4idJdzCozGGnxmLoFcIjC2ndw
sidebar_position: 29
keywords: 
  - 句子转换器
  - 推荐系统
  - 信息检索
  - 降维
  - zilliz
  - zilliz cloud
  - 云
  - ListCollectionsV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# ListCollectionsV2()

此操作会列出指定 Database 中所有现有的 Collection。

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

    目标 Database 的名称。指定后，此操作将返回该 Database 中的所有 Collection。

**返回类型：**

*ListCollectionsResp*

**返回：**

包含 Collection 名称列表的 **ListCollectionsResp** 对象。如果没有任何 Collection，则返回空列表。

**参数：**

- **collectionNames** (*List&lt;String&gt;*)

    包含所有现有 Collection 名称的字符串列表。

- **collectionInfos** (*List&lt;CollectionInfo&gt;*)

    **CollectionInfo** 对象列表。**CollectionInfo** 对象包含以下字段：

    - **collectionName** (*String*)

        Collection 的名称。

    - **shardNum** (*Integer*)

        上述 Collection 中的分片数量。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

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

