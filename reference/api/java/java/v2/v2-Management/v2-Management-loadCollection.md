---
title: "loadCollection() | Java | v2"
slug: /java/java/v2-Management-loadCollection
sidebar_label: "loadCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation loads the data of a specific collection into memory. | Java | v2"
type: docx
token: Y3q1d5FzmoSiNkxsWDLcHnAlnQf
sidebar_position: 13
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# loadCollection()

This operation loads the data of a specific collection into memory.

```java
public void loadCollection(LoadCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
loadCollection(LoadCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .numReplicas(Integer numReplicas)
    .async(Boolean async)
    .sync(Boolean sync)
    .timeout(Long timeout)
    .refresh(Boolean refresh)
    .loadFields(List<String> loadFields)
    .skipLoadDynamicField(Boolean skipLoadDynamicField)
    .resourceGroups(List<String> resourceGroups)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    The name of the target collection.

- `numReplicas(Integer numReplicas)` -

    The number of replicas to load. Defaults to `1`.

- `async(Boolean async)` -

    Whether to run the operation asynchronously. Defaults to `Boolean.FALSE`.

- `sync(Boolean sync)` -

    Whether to wait synchronously until the operation completes. Defaults to `Boolean.TRUE`.

- `timeout(Long timeout)` -

    The timeout duration in milliseconds. Defaults to `60000L`.

- `refresh(Boolean refresh)` -

    Whether to refresh load to include new fields. Defaults to `Boolean.FALSE`.

- `loadFields(List<String> loadFields)` -

    A list of specific field names to load. Defaults to `new ArrayList<>()`.

- `skipLoadDynamicField(Boolean skipLoadDynamicField)` -

    Whether to skip loading the dynamic field. Defaults to `Boolean.FALSE`.

- `resourceGroups(List<String> resourceGroups)` -

    A list of resource group names for load balancing. Defaults to `new ArrayList<>()`.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.LoadCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Load collection "test"
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("test")
        .build();
client.loadCollection(loadCollectionReq);
```
