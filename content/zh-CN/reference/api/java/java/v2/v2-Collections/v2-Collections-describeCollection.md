---
title: "describeCollection() | Java | v2"
slug: /java/java/v2-Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出特定 Collection 的详细信息。 | Java | v2"
type: docx
token: WEE6ddFntowCIixVMCmc3pESnug
sidebar_position: 12
keywords: 
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - describeCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeCollection()

此操作列出特定 Collection 的详细信息。

```java
public DescribeCollectionResp describeCollection(DescribeCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
describeCollection(DescribeCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .collectionId(Long collectionId)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，则默认使用当前 Database。

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `collectionId(Long collectionId)` -

    Collection 的数字 ID。当您需要通过 ID 而不是名称来标识 Collection 时，请使用此项。

**返回：**

*DescribeCollectionResp*

包含指定 Collection 详细信息的 **DescribeCollectionResp** 对象。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get the collection detail
DescribeCollectionReq describeCollectionReq = DescribeCollectionReq.builder()
        .collectionName("test")
        .build();
DescribeCollectionResp describeCollectionResp = client.describeCollection(describeCollectionReq);
```
