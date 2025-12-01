---
title: "get() | Java | v2"
slug: /java/java/v2-Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation gets specific entities by their IDs. | Java | v2"
type: docx
token: DDshdoIEoo7X1BxpciBc66Rlndd
sidebar_position: 2
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - get()
  - javaV226
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# get()

This operation gets specific entities by their IDs.

```java
public GetResp get(GetReq request)
```

## Request Syntax\{#request-syntax}

```java
get(GetReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .ids(List<Object> ids)
    .outputFields(List<String> outputFields)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database to which the target collection belongs.

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionName(String partitionName)`

    The name of a partition.

- `ids(List<Object> ids)`

    A specific entity ID or a list of entity IDs.

- `outputFields(List<String> outputFields)`

    A list of names of the fields to be included in the query result.

**RETURN TYPE:**

*GetResp*

**RETURNS:**

A **GetResp** object representing one or more queried entities.

**PARAMETERS:**

- **getResults** (*List\<QueryResp.QueryResult\>*)

    A list of **QueryResp.QueryResult** objects.

- **fields** (*Map\<String,Object\>*)

    A map that contains key-value pairs of field names and their values.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get entity with id 0
GetReq getReq = GetReq.builder()
        .collectionName("test")
        .ids(Collections.singletonList("0"))
        .build();
GetResp getResp = client.get(getReq);
```

