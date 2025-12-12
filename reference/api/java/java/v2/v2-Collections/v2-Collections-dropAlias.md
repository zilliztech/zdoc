---
title: "dropAlias() | Java | v2"
slug: /java/java/v2-Collections-dropAlias
sidebar_label: "dropAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "This operation drops a specified collection alias. | Java | v2"
type: docx
token: ARw0dIb0hojCNbxKkOacs1K7nQf
sidebar_position: 13
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - dropAlias()
  - javaV226
  - IVF
  - knn
  - Image Search
  - LLMs
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropAlias()

This operation drops a specified collection alias. 

```java
public void dropAlias(DropAliasReq request)
```

## Request Syntax\{#request-syntax}

```java
dropAlias(DropAliasReq.builder()
    .databaseName(String databaseName)
    .alias(String alias)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database to which the target alias belongs.

- `alias(String alias)`

    The alias of a collection. 

    Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.DropAliasReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop alias "test_alias"
DropAliasReq dropAliasReq = DropAliasReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .alias("test_alias")
        .build();
client.dropAlias(dropAliasReq);
```
