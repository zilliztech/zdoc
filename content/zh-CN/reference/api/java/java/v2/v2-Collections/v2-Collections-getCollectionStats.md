---
title: "getCollectionStats() | Java | v2"
slug: /java/java/v2-Collections-getCollectionStats
sidebar_label: "getCollectionStats()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "除 Entity 数量外，还返回完整的 Collection 统计信息映射。| Java | v2"
type: docx
token: RSNDdgCQ2oRIMWxeVafcNf8LnAc
sidebar_position: 17
keywords: 
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - NLP 搜索
  - zilliz
  - zilliz cloud
  - 云
  - getCollectionStats()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getCollectionStats()

除 Entity 数量外，还返回完整的 Collection 统计信息映射。

```java
public GetCollectionStatsResp getCollectionStats(GetCollectionStatsReq request)
```

## 请求语法\{#request-syntax}

```java
GetCollectionStatsReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .build();
```

**构建器方法：**

- `databaseName(String databaseName)`

    Database 的名称。省略时默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

**返回：**

*GetCollectionStatsResp*

包含 numOfEntities 以及 Milvus 返回的完整统计信息映射。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
GetCollectionStatsResp response = client.getCollectionStats(GetCollectionStatsReq.builder()
    .collectionName("books")
    .build());
Map<String, String> stats = response.getStats();
```
