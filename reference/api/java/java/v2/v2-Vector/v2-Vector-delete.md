---
title: "delete() | Java | v2"
slug: /java/java/v2-Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation deletes entities by their IDs or with a boolean expression. | Java | v2"
type: docx
token: NTCHdGKwNo9kl2xFzgKcjo8wndg
sidebar_position: 1
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - javaV230
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
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .filter(String filter)
    .ids(List<Object> ids)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    The name of the target collection.

- `partitionName(String partitionName)` -

    The name of the target partition.

- `filter(String filter)` -

    A boolean expression to filter results.

- `ids(List<Object> ids)` -

    A list of primary key values to identify specific entities.

- `filterTemplateValues(Map<String, Object> filterTemplateValues)` -

    A map of template variable values for parameterized filters.

**RETURNS:**

*DeleteResp*

A **DeleteResp** object contains the number of deleted entities.

**EXCEPTIONS:**

- **MilvusClientException**

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
