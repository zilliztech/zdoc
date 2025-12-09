---
title: "alterCollectionProperties() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionProperties
sidebar_label: "alterCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies the properties of a specified collection. | Java | v2"
type: docx
token: JQ4QdTaadoIDSPxDJRZcSDu3n5g
sidebar_position: 3
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionProperties()
  - javaV226
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionProperties()

This operation modifies the properties of a specified collection.

```java
public Void alterCollectionProperties(AlterCollectionPropertiesReq request)
```

## Request Syntax\{#request-syntax}

```java
alterCollectionProperties(AlterCollectionPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database that holds the target collection.

- `collectionName(String collectionName)`

    The name of the target collection.

- `properties(Map<String, String> properties)`

    The properties to modify and their expected values. Note that the property values should be strings. Available database properties are as follows:

    - **collection.ttl.seconds** -

        The time-to-live (TTL) of a collection in seconds.

    - **mmap.enabled** -

        Whether to enable mmap for the raw data and indexes of all fields in the collection.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the `collection.ttl.seconds` property
Map<String, String> properties = new HashMap<>()
properties.put("collection.ttl.seconds", "86400")

AlterCollectionPropertiesReq alterCollectionFieldReq = AlterCollectionPropertiesReq.builder()
        .collectionName("test")
        .properties(properties)
        .build();
client.alterCollectionProperties(alterCollectionFieldReq)
```

