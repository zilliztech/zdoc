---
displayed_sidbar: javaSidebar
title: "dropCollectionProperties() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionProperties
sidebar_label: "dropCollectionProperties()"
beta: false
notebook: false
description: "This operation resets the properties of a specified collection to their default values. | Java | v2"
type: docx
token: OPPHd2AabonMIzxzfupcyNS9n1a
sidebar_position: 16
keywords: 
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionProperties()
  - javaV225
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropCollectionProperties()

This operation resets the properties of a specified collection to their default values.

```java
public Void dropCollectionProperties(DropCollectionPropertiesReq request)
```

## Request Syntax{#request-syntax}

```java
dropCollectionProperties(DropCollectionPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .propertyKeys(List<String> propertyKeys)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database that holds the target collection.

- `collectionName(String collectionName)`

    The name of the target collection.

- `propertyKeys(List<String> propertyKeys)`

    The properties to reset to their default values. Possible properties are as follows:

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
// drop the `collection.ttl.seconds` property
List<String> propertyKeys = new ArrayList<>()
propertyKeys.add("collection.ttl.seconds")

DropCollectionPropertiesReq dropCollectionPropertiesReq = DropCollectionPropertiesReq.builder()
        .collectionName("test")
        .propertyKeys(propertyKeys)
        .build();
        
client.dropCollectionProperties(dropCollectionPropertiesReq)
```

