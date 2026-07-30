---
title: "releaseCollection() | Java | v2"
slug: /java/java/v2-Management-releaseCollection
sidebar_label: "releaseCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation releases the data of a specific collection from memory. | Java | v2"
type: docx
token: K5t2dl0XloN4VHx1lcpc6Uq3nye
sidebar_position: 16
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - releaseCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# releaseCollection()

This operation releases the data of a specific collection from memory.

```java
public void releaseCollection(ReleaseCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
releaseCollection(ReleaseCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    The name of the target collection.

- `async(Boolean async)` -

    Whether to run the operation asynchronously. Defaults to `Boolean.TRUE`.

- `timeout(Long timeout)` -

    The timeout duration in milliseconds. Defaults to `60000L`.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Release collection "test"
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
        .collectionName("test")
        .build();
client.releaseCollection(releaseCollectionReq);
```
