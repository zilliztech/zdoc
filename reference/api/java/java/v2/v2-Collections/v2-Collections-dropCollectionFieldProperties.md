---
title: "dropCollectionFieldProperties() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFieldProperties
sidebar_label: "dropCollectionFieldProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops the specified properties of a field. | Java | v2"
type: docx
token: O3E9duLvfoMC26x8AmDcomlWneh
sidebar_position: 26
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionFieldProperties()
  - javaV226
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionFieldProperties()

This operation drops the specified properties of a field.

```java
public void dropCollectionFieldProperties(DropCollectionFieldPropertiesReq request)
```

## Request Syntax\{#request-syntax}

```java
dropCollectionFieldProperties(DropCollectionFieldPropertiesReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .fieldName(String fieldName)
    .propertyKeys(List<String> propertyKeys)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `databaseName(String databaseName)`

    The name of a database that has the collection mentioned above. 

- `fieldName(String fieldName)`

    The name of the target field in the specified collection.

- `propertyKeys(List<String> propertyKeys)`

    The names of the properties to drop from the specified field.

**RETURN TYPE:**

*void*

**RETURNS:** 

None

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionFieldPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop field's properties
client.dropCollectionFieldProperties(DropCollectionFieldPropertiesReq.builder()
        .collectionName(collectionName)
        .fieldName("fieldName")
        .propertyKeys(Collections.singletonList(Constant.MMAP_ENABLED))
        .build());
```
