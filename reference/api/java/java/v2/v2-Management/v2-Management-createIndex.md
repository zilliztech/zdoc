---
title: "createIndex() | Java | v2"
slug: /java/java/v2-Management-createIndex
sidebar_label: "createIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "This operation creates an index for a specific collection. | Java | v2"
type: docx
token: YXPSdlp3JoP82qxhFMYc5GRnn4g
sidebar_position: 3
keywords: 
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - createIndex()
  - javaV226
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createIndex()

This operation creates an index for a specific collection.

```java
public void createIndex(CreateIndexReq request)
```

## Request Syntax\{#request-syntax}

```java
createIndex(CreateIndexReq.builder()
    .collectionName(String collectionName)
    .indexParams(List<IndexParam> indexParams)
    .sync(Boolean sync)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `indexParams(List<[IndexParam](./v2-Management-IndexParam)> indexParams)`

    A list of **IndexParam** objects.

- `sync(Boolean sync)`

    Whether the current operation is synchronous. The default value is `True`.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

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

