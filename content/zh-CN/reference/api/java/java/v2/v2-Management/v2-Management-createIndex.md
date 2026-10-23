---
title: "createIndex() | Java | v2"
slug: /java/java/v2-Management-createIndex
sidebar_label: "createIndex()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作为特定 Collection 创建索引。 | Java | v2"
type: docx
token: Mz7NdzJkfo3A17x7YAlc3m0Xnbc
sidebar_position: 3
keywords: 
  - RAG 向量 Database
  - 什么是向量 Database
  - 什么是向量 Database
  - 向量 Database 比较
  - zilliz
  - Zilliz Cloud
  - 云
  - createIndex()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createIndex()

此操作为特定 Collection 创建索引。

```java
public void createIndex(CreateIndexReq request)
```

## 请求语法\{#request-syntax}

```java
createIndex(CreateIndexReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .indexParams(List<IndexParam> indexParams)
    .sync(Boolean sync)
    .timeout(Long timeout)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，则该值默认为当前 Database。

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `indexParams(List<IndexParam> indexParams)` -

    一组定义索引配置的 IndexParam 对象。

- `sync(Boolean sync)` -

    是否同步等待，直到操作完成。该值默认为 `Boolean.TRUE`。

- `timeout(Long timeout)` -

    超时时长，单位为毫秒。该值默认为 `60000L`。

**异常：**

- **MilvusClientException**

    此操作过程中发生任何错误时，会抛出此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Collections;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create an index for the field "vector"
IndexParam indexParam = IndexParam.builder()
        .metricType(IndexParam.MetricType.L2)
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .fieldName("vector")
        .build();
CreateIndexReq createIndexReq = CreateIndexReq.builder()
        .collectionName("test")
        .indexParams(Collections.singletonList(indexParam))
        .build();
client.createIndex(createIndexReq);
```
