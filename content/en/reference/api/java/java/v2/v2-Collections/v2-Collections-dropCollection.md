---
title: "dropCollection() | Java | v2"
slug: /java/java/v2-Collections-dropCollection
sidebar_label: "dropCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation drops a collection. | Java | v2"
type: docx
token: SW6Cdt9QeoY1J1x9SYQcZrc6nbg
sidebar_position: 14
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollection()

This operation drops a collection.

```java
public void dropCollection(DropCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
dropCollection(DropCollectionReq.builder()
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

    Whether to run the operation asynchronously.

- `timeout(Long timeout)` -

    The timeout duration in milliseconds.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// drop a collection: test
DropCollectionReq dropCollectionReq = DropCollectionReq.builder()
        .collectionName("test")
        .build();
client.dropCollection(dropCollectionReq);
```
