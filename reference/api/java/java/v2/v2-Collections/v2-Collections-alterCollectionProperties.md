---
displayed_sidbar: javaSidebar
title: "alterCollectionProperties() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionProperties
sidebar_label: "alterCollectionProperties()"
beta: false
notebook: false
description: "This operation modifies the properties of a specified collection. | Java | v2"
type: docx
token: JQ4QdTaadoIDSPxDJRZcSDu3n5g
sidebar_position: 3
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionProperties()
  - javaV225
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterCollectionProperties()

This operation modifies the properties of a specified collection.

```java
public Void alterCollectionProperties(AlterCollectionPropertiesReq request)
```

## Request Syntax{#request-syntax}

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

## Example{#example}

```java
// alter the `collection.ttl.seconds` property
Map<String, String> properties = new HashMap<>()
properties.put("collection.ttl.seconds", "86400")

AlterCollectionFieldReq alterCollectionFieldReq = AlterCollectionFieldReq.builder()
        .collectionName("test")
        .properties(properties)
        .build();
client.alterCollectionProperties(alterCollectionFieldReq)
```

