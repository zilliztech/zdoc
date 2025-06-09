---
displayed_sidbar: javaSidebar
title: "listPartitions() | Java | v2"
slug: /java/java/v2-Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
notebook: false
description: "This operation lists the partitions in a specified collection. | Java | v2"
type: docx
token: RJcgdJpGDouomlxPTqZc5S8Lngc
sidebar_position: 5
keywords: 
  - Unstructured Data
  - vector database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - listPartitions()
  - javaV225
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listPartitions()

This operation lists the partitions in a specified collection.

```java
public List<String> listPartitions(ListPartitionsReq request)
```

## Request Syntax{#request-syntax}

```java
listPartitions(ListPartitionsReq.builder()
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

**RETURN TYPE:**

*List\<String\>*

**RETURNS:**

A list of partition names.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ListPartitionsReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List partitions in collection
ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("test")
        .build();
List<String> res = client.listPartitions(listPartitionsReq);
```

