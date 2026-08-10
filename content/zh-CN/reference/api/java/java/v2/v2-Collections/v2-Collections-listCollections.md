---
title: "listCollections() | Java | v2"
slug: /java/java/v2-Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会列出所有现有的 Collection。| Java | v2"
type: docx
token: Vv4NdWVa5o5BSrx11OZcNVnQnbh
sidebar_position: 20
keywords: 
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - listCollections()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listCollections()

此操作会列出所有现有的 Collection。

```java
public ListCollectionsResp listCollections()
```

## 请求语法\{#request-syntax}

```java
listCollections()
```

**返回类型：**

*ListCollectionsResp*

**返回值：**

一个包含 Collection 名称列表的 **ListCollectionsResp** 对象。如果当前没有任何 Collection，则会返回空列表。

**参数：**

- **collectionNames** (*List&lt;String&gt;*)

    一个字符串列表，包含所有现有 Collection 的名称。

- **collectionInfos** (*List&lt;CollectionInfo&gt;*)

    一个 **CollectionInfo** 对象列表。**CollectionInfo** 对象包含以下字段：

    - **collectionName** (*String*)

        Collection 的名称。

    - **shardNum** (*Integer*)

        上述 Collection 中的分片数量。

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

