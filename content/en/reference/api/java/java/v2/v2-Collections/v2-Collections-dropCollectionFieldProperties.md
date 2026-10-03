---
title: "dropCollectionFieldProperties() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFieldProperties
sidebar_label: "dropCollectionFieldProperties()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops the specified properties of a field. | Java | v2"
type: docx
token: DU5gdncRGoDE0exDDUXcxAOsnIi
sidebar_position: 23
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionFieldProperties()
  - javaV230
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

    The name of a database that contains the collection specified above. 

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
import java.util.Collections;
import java.util.Set;

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
