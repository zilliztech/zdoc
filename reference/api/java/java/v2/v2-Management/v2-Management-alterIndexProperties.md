---
displayed_sidbar: javaSidebar
title: "alterIndexProperties() | Java | v2"
slug: /java/java/v2-Management-alterIndexProperties
sidebar_label: "alterIndexProperties()"
beta: false
notebook: false
description: "This operation modifies the properties of a specified index. | Java | v2"
type: docx
token: ITkydrfmroQyLLxusZtc6t1nnjf
sidebar_position: 1
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - alterIndexProperties()
  - javaV225
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterIndexProperties()

This operation modifies the properties of a specified index.

```java
public Void alterIndexProperties(AlterIndexPropertiesReq request)
```

## Request Syntax{#request-syntax}

```java
alterIndexProperties(AlterIndexPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .indexName(String indexName)
    .properties(Map<String, String> properties)
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

- `properties(Map<String, String> properties)`

    The properties to modify and their expected values. Note that the property values should be strings. Available database properties are as follows:

    - **mmap.enabled** -

        Whether to enable mmap for the current index.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// alter the `mmap.enabled` property
Map<String, String> properties = new HashMap<>()
properties.put("mmap.enabled", "true")

AlterIndexPropertiesReq alterIndexPropertiesReq = AlterIndexPropertiesReq.builder()
        .collectionName("test")
        .properties(properties)
        .build();
client.alterIndexProperties(alterCollectionFieldReq)
```

