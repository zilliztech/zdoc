---
title: "batchDescribeCollection() | Java | v2"
slug: /java/java/v2-Collections-batchDescribeCollection
sidebar_label: "batchDescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作可批量获取多个 Collection 的描述。 | Java | v2"
type: docx
token: B4CpdqvN7oZy3zxB9fscTAG8n7E
sidebar_position: 32
keywords: 
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管式向量 Database
  - Pinecone 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - batchDescribeCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# batchDescribeCollection()

此操作可批量获取多个 Collection 的描述。

```java
public List<DescribeCollectionResp> batchDescribeCollection(BatchDescribeCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
batchDescribeCollection(BatchDescribeCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionNames(List<String> collectionNames)
    .collectionIds(List<Long> collectionIds)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -<br/>
  Database 的名称。如果未指定，则默认为当前 Database。

- `collectionNames(List<String> collectionNames)` -

- `collectionIds(List<Long> collectionIds)` -<br/>
  用于批量描述的 Collection ID 列表。

**返回：**

*List&lt;DescribeCollectionResp&gt;*

**DescribeCollectionResp** 对象列表。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.BatchDescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get the collection detail
BatchDescribeCollectionReq describeCollectionReq = BatchDescribeCollectionReq.builder()
        .collectionNames(Collections.singletonList("test"))
        .build();
List<DescribeCollectionResp> batchResp = client.batchDescribeCollection(describeCollectionReq);
```
