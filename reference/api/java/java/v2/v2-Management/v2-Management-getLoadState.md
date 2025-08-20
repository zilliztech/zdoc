---
displayed_sidbar: javaSidebar
title: "getLoadState() | Java | v2"
slug: /java/java/v2-Management-getLoadState
sidebar_label: "getLoadState()"
beta: false
notebook: false
description: "This operation displays whether a specified collection or partition is loaded or not. | Java | v2"
type: docx
token: QcaFdMJE9oHX1Axe11rcqfiynEd
sidebar_position: 6
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - getLoadState()
  - javaV225
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getLoadState()

This operation displays whether a specified collection or partition is loaded or not.

```java
public Boolean getLoadState(GetLoadStateReq request)
```

## Request Syntax{#request-syntax}

```java
getLoadState(GetLoadStateReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

- `partitionName(String partitionName)`

    The name of a partition.

**RETURN TYPE:**

*Boolean*

**RETURNS:**

A Boolean value that indicates the status of the specified collection or partition. 

<Admonition type="info" icon="📘" title="Notes">

<p>A collection is in the loaded state if any or all of its partitions are loaded.</p>

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetLoadStateReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get load state for collection "test"
GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.getLoadState(getLoadStateReq);
```
