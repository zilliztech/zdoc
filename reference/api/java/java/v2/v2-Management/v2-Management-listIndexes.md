---
title: "listIndexes() | Java | v2"
slug: /java/java/v2-Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation lists the indexes of a field in a specific collection. | Java | v2"
type: docx
token: LxwIdeFiGoYaRAxKS72cdjNkneh
sidebar_position: 12
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - listIndexes()
  - javaV226
  - LLMs
  - Machine Learning
  - RAG
  - NLP
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listIndexes()

This operation lists the indexes of a field in a specific collection.

```java
public List<String> listIndexes(ListIndexesReq request)
```

## Request Syntax\{#request-syntax}

```java
listIndexes(ListIndexesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database to which the target collection belongs.

- `collectionName(String collectionName)`

    The name of a collection.

- `fieldName(String fieldName)`

    The name of the target field.

**RETURNS:**

*List\<String>*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.ListIndexesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List the indexes on the `varchar` field in the `test` collection
ListIndexesReq listIndexesReq = ListIndexesReq.builder()
        .collectionName("test")
        .fieldName("varchar")
        .build();
        
List<String> indexes = client.listIndexes(ListIndexesReq);
```

