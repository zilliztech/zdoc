---
title: "describeIndex() | Java | v2"
slug: /java/java/v2-Management-describeIndex
sidebar_label: "describeIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作描述特定索引。 | Java | v2"
type: docx
token: SgJ7dKfisomLkqx1E3BccMO7nqf
sidebar_position: 4
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describeIndex()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeIndex()

此操作描述特定索引。

```java
public DescribeIndexResp describeIndex(DescribeIndexReq request)
```

## 请求语法\{#request-syntax}

```java
describeIndex(DescribeIndexReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .indexName(String indexName)
    .timestamp(Long timestamp)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    数据库名称。未指定时，默认使用当前数据库。

- `collectionName(String collectionName)` -

    目标集合的名称。

- `fieldName(String fieldName)` -

    目标字段的名称。

- `indexName(String indexName)` -

    目标索引的名称。

- `timestamp(Long timestamp)` -

    用于时间旅行查询的时间戳。默认为 `0L`。

**返回：**

*DescribeIndexResp*

包含指定索引详细信息的 **DescribeIndexResp** 对象。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe the index for the field "vector"
DescribeIndexReq describeIndexReq = DescribeIndexReq.builder()
        .collectionName("test")
        .fieldName("vector")
        .build();
DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);
```
