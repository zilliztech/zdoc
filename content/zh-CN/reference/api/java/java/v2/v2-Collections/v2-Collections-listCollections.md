---
title: "listCollections() | Java | v2"
slug: /java/java/v2-Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作列出所有现有集合。 | Java | v2"
type: docx
token: Vv4NdWVa5o5BSrx11OZcNVnQnbh
sidebar_position: 20
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - listCollections()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listCollections()

此操作列出所有现有集合。

```java
public ListCollectionsResp listCollections()
```

## 请求语法\{#request-syntax}

```java
listCollections()
```

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

        集合名称。

    - **shardNum** (*Integer*)

        上述集合中的分片数量。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List collections
ListCollectionsResp listAliasResp = client.listCollections();
```

