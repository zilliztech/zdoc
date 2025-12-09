---
title: "delete() | Java | v2"
slug: /java/java/v2-Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes entities by their IDs or with a boolean expression. | Java | v2"
type: docx
token: NOX7dAR3zodEH3xinMecMjq5n4S
sidebar_position: 1
keywords: 
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - javaV226
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# delete()

This operation deletes entities by their IDs or with a boolean expression.

```java
public DeleteResp delete(DeleteReq request)
```

## Request Syntax\{#request-syntax}

```java
delete(DeleteReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .filter(String filter)
    .ids(List<Object> ids)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionName(String partitionName)`

    The name of a partition.

- `filter(String filter)`

    A scalar filtering condition to filter matching entities. 

    The value defaults to an empty string, indicating that no condition applies.

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Scalar Expression Rules](https://milvus.io/docs/boolean.md).

- `ids(List<Object> ids)`

    A specific entity ID or a list of entity IDs.

**RETURN TYPE:**

*DeleteResp*

**RETURNS:**

A **DeleteResp** object contains the number of deleted entities.

**PARAMETERS:**

- **deleteCnt** (*long*)

    The count of deleted entities.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.DeleteReq;
import io.milvus.v2.service.vector.response.DeleteResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Delete entities with filter "id > 10"
DeleteReq deleteReq = DeleteReq.builder()
        .collectionName("test")
        .filter("id > 10")
        .build();
DeleteResp deleteResp = client.delete(deleteReq);
```

