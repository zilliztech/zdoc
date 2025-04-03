---
displayed_sidbar: javaSidebar
title: "dropIndexProperties() | Java | v2"
slug: /java/java/v2-Management-dropIndexProperties
sidebar_label: "dropIndexProperties()"
beta: false
notebook: false
description: "This operation resets the specified index properties to their default values. | Java | v2"
type: docx
token: IdNAdlMhjoM40pxjpKecpc7inbd
sidebar_position: 5
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndexProperties()
  - javaV225
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropIndexProperties()

This operation resets the specified index properties to their default values.

```java
public Void dropIndexProperties(DropIndexPropertiesReq request)
```

## Request Syntax{#request-syntax}

```java
dropIndexProperties(DropIndexPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .indexName(String indexName)
    .propertyKeys(List<String> propertyKeys)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database that holds the target collection.

- `collectionName(String collectionName)`

    The name of the target collection.

- `indexName(String indexName)`

    The name of the target index.

- `propertyKeys(List<String> propertyKeys)`

    The properties to drop. Note that the property values should be strings. Available database properties are as follows:

    - **mmap.enabled** -

        Whether to enable mmap for the current index.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// drop the `mmap.enabled` property
List<String> propertyKeys = new ArrayList<>()
propertyKeys.add("mmap.enabled")

DropIndexPropertiesReq dropIndexPropertiesReq = DropIndexPropertiesReq.builder()
        .collectionName("test")
        .propertyKeys(propertyKeys)
        .build();
        
client.dropIndexProperties(dropIndexPropertiesReq)
```

