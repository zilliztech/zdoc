---
title: "compact() | Java | v2"
slug: /java/java/v2-Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过将小分段合并为较大的分段来压缩集合。建议在向集合中插入大量数据后调用此操作。 | Java | v2"
type: docx
token: LDQsdzUJQotV2GxWGaqcFkDenuq
sidebar_position: 2
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# compact()

此操作通过将小分段合并为较大的分段来压缩集合。建议在向集合中插入大量数据后调用此操作。

```java
public CompactResp compact(CompactReq request)
```

## 请求语法\{#request-syntax}

```java
compact(CompactReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .isClustering(Boolean isClustering)
    .isL0(Boolean isL0)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)`

    数据库名称。若未指定，则默认使用当前数据库。

- `collectionName(String collectionName)`

    目标集合的名称。

- `isClustering(Boolean isClustering)`

    是否执行聚类压缩。默认值为 `Boolean.FALSE`。

- `isL0(Boolean isL0)`

    是否请求 L0 压缩。默认值为 `Boolean.FALSE`，并且独立于聚类压缩。

**返回：**

*CompactResp*

**CompactResp** 对象包含一个压缩 ID。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CompactReq;
import io.milvus.v2.service.utility.response.CompactResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.compact(CompactReq.builder()
    .collectionName("my_collection")
    .build();
);
```
