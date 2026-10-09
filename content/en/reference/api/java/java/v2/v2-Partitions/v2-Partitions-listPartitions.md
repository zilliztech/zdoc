---
title: "listPartitions() | Java | v2"
slug: /java/java/v2-Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the partitions in a specified collection. | Java | v2"
type: docx
token: Jj60dRCiVoLLRzxVCiGcjI37nHc
sidebar_position: 5
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - listPartitions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listPartitions()

This operation lists the partitions in a specified collection.

```java
public List<String> listPartitions(ListPartitionsReq request)
```

## Request Syntax\{#request-syntax}

```java
listPartitions(ListPartitionsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database to which the target collection belongs.

- `collectionName(String collectionName)`

    The name of an existing collection.

**RETURN TYPE:**

*List&lt;String&gt;*

**RETURNS:**

A list of partition names.

**PARAMETERS:**

- **partitionNames** (*List&lt;String&gt;*) -

    A list of the partition names in the specified collection.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when an error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ListPartitionsReq;
import java.util.List;
import java.util.Set;

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
