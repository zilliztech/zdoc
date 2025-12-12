---
title: "dropIndexProperties() | Java | v2"
slug: /java/java/v2-Management-dropIndexProperties
sidebar_label: "dropIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation resets the specified index properties to their default values. | Java | v2"
type: docx
token: IdNAdlMhjoM40pxjpKecpc7inbd
sidebar_position: 6
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndexProperties()
  - javaV226
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropIndexProperties()

This operation resets the specified index properties to their default values.

```java
public Void dropIndexProperties(DropIndexPropertiesReq request)
```

## Request Syntax\{#request-syntax}

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

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DropIndexPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop the `mmap.enabled` property
List<String> propertyKeys = new ArrayList<>()
propertyKeys.add("mmap.enabled")

DropIndexPropertiesReq dropIndexPropertiesReq = DropIndexPropertiesReq.builder()
        .collectionName("test")
        .indexName("vector")
        .propertyKeys(propertyKeys)
        .build();
client.dropIndexProperties(dropIndexPropertiesReq)
```

