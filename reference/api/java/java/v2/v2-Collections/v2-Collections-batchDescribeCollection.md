---
title: "batchDescribeCollection() | Java | v2"
slug: /java/java/v2-Collections-batchDescribeCollection
sidebar_label: "batchDescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets the descriptions of multiple collections in a batch. | Java | v2"
type: docx
token: B4CpdqvN7oZy3zxB9fscTAG8n7E
sidebar_position: 32
keywords: 
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - zilliz
  - zilliz cloud
  - cloud
  - batchDescribeCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# batchDescribeCollection()

This operation gets the descriptions of multiple collections in a batch.

```java
public List<DescribeCollectionResp> batchDescribeCollection(BatchDescribeCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
batchDescribeCollection(BatchDescribeCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionNames(List<String> collectionNames)
    .collectionIds(List<Long> collectionIds)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -
The name of the database. Defaults to the current database if not specified.

- `collectionNames(List<String> collectionNames)` -

- `collectionIds(List<Long> collectionIds)` -
A list of collection IDs to describe in batch.

**RETURNS:**

*List&lt;DescribeCollectionResp&gt;*

A list of **DescribeCollectionResp** objects.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

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
