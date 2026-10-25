---
title: "describeIndex() | Java | v2"
slug: /java/java/v2-Management-describeIndex
sidebar_label: "describeIndex()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会描述指定的索引。 | Java | v2"
type: docx
token: HH9bdZvbuoblNfxXeLycoHsSn9g
sidebar_position: 4
keywords: 
  - 向量数据库比较
  - OpenAI 向量数据库
  - 自然语言处理 Database
  - 低成本向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - describeIndex()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeIndex()

此操作会描述指定的索引。

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

    Database 的名称。如果未指定，则该值默认为当前 Database。

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `fieldName(String fieldName)` -

    目标字段的名称。

- `indexName(String indexName)` -

    目标索引的名称。

- `timestamp(Long timestamp)` -

    用于时间旅行查询的时间戳。该值默认为 `0L`。

**返回类型：**

*DescribeIndexResp*

**返回：**

一个包含指定索引详细信息的 **DescribeIndexResp** 对象。

**参数：**

- **indexDescriptions** （*List&lt;IndexDesc&gt;*） -

    索引描述列表，其中每个元素都是一个 **IndexDesc** 对象，包含以下字段：

    - **fieldName** （*String*） -

        构建索引时所用的字段名称。

    - **indexName** （*String*） -

        索引的名称。

    - **id** （*long*） -

        索引的 ID。

    - **indexType** （*IndexParam.IndexType*） -

        索引的类型。

    - **metricType** （*IndexParam.MetricType*） -

        用于衡量此索引下向量相似度的度量类型。

    - **extraParams** （*Map&lt;String, String&gt;*） -

        索引的额外参数。

    - **indexedRows** （*long*） -

        已建立索引的行数。

    - **totalRows** （*long*） -

        目标字段中的总行数。

    - **pendingIndexRows** （*long*） -

        等待建立索引的行数。

    - **indexState** （*IndexBuildState*） -

        索引构建任务的状态。可能的值包括：`IndexStateNone`、`Unissued`、`InProgress`、`Finished`、`Failed`、`Retry`。

    - **indexFailedReason** （*String*） -

        索引构建任务失败的原因。

    - **properties** （*Map&lt;String, String&gt;*） -

        索引属性。已弃用：索引属性现已分发到 `extraParams`。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;
import java.util.Set;

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
