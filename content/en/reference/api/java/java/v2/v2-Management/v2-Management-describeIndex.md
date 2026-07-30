---
title: "describeIndex() | Java | v2"
slug: /java/java/v2-Management-describeIndex
sidebar_label: "describeIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation describes a specific index. | Java | v2"
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

This operation describes a specific index.

```java
public DescribeIndexResp describeIndex(DescribeIndexReq request)
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    The name of the target collection.

- `fieldName(String fieldName)` -

    The name of the target field.

- `indexName(String indexName)` -

    The name of the target index.

- `timestamp(Long timestamp)` -

    A timestamp for time-travel queries. Defaults to `0L`.

**RETURNS:**

*DescribeIndexResp*

A **DescribeIndexResp** object that contains the details of the specified index.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

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
