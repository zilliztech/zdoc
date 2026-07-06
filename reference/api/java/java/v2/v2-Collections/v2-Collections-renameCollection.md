---
title: "renameCollection() | Java | v2"
slug: /java/java/v2-Collections-renameCollection
sidebar_label: "renameCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation renames an existing collection. | Java | v2"
type: docx
token: U7Ipdm0FTo8FCVxaxbZcwMygnWd
sidebar_position: 21
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - renameCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# renameCollection()

This operation renames an existing collection.

```java
public void renameCollection(RenameCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
renameCollection(RenameCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .newCollectionName(String newCollectionName)
    .targetDbName(String targetDbName)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    The name of the target collection.

- `newCollectionName(String newCollectionName)` -

    The new name for the collection.

- `targetDbName(String targetDbName)` -

    The name of the target database. Set this when the renamed collection should be moved into another database.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.RenameCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Rename collection "test" to "test2"
RenameCollectionReq renameCollectionReq = RenameCollectionReq.builder()
        .collectionName("test")
        .newCollectionName("test2")
        .build();
client.renameCollection(renameCollectionReq);
```
