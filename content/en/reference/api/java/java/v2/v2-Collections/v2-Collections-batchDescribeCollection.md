---
title: "batchDescribeCollection() | Java | v2"
slug: /java/java/v2-Collections-batchDescribeCollection
sidebar_label: "batchDescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves the descriptions of multiple collections in a batch. | Java | v2"
type: docx
token: B4CpdqvN7oZy3zxB9fscTAG8n7E
sidebar_position: 30
keywords: 
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - zilliz
  - zilliz cloud
  - cloud
  - batchDescribeCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# batchDescribeCollection()

This operation retrieves the descriptions of multiple collections in a batch.

```java
public List<DescribeCollectionResp> batchDescribeCollection(BatchDescribeCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
batchDescribeCollection(BatchDescribeCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionNames(List<String> collectionNames)
    .collectionIds(List<Long> collectionIds)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionNames(List<String> collectionNames)` -

    A list of collection names to describe in batch.

- `collectionIds(List<Long> collectionIds)` -

    A list of collection IDs to describe in batch.

**RETURN TYPE:**

*List&lt;DescribeCollectionResp&gt;*

**RETURNS:**

A list of **DescribeCollectionResp** objects. Each **DescribeCollectionResp** object contains the following fields:

**PARAMETERS:**

- **collectionName** (*String*) -

    The name of the collection.

- **collectionID** (*Long*) -

    The ID of the collection.

- **databaseName** (*String*) -

    The name of the database that holds the collection.

- **description** (*String*) -

    The description of the collection.

- **numOfPartitions** (*Long*) -

    The number of partitions in the collection.

- **fieldNames** (*List&lt;String&gt;*) -

    A list of the names of all fields in the collection.

- **vectorFieldNames** (*List&lt;String&gt;*) -

    A list of the names of the vector fields in the collection.

- **primaryFieldName** (*String*) -

    The name of the primary key field of the collection.

- **enableDynamicField** (*Boolean*) -

    Whether the dynamic field is enabled for the collection.

- **autoID** (*Boolean*) -

    Whether Milvus auto-generates primary key values for the collection.

- **collectionSchema** (*CreateCollectionReq.CollectionSchema*) -

    The schema of the collection.

- **createTime** (*Long*) -

    The timestamp when the collection was created.

- **createUtcTime** (*Long*) -

    The UTC timestamp when the collection was created.

- **consistencyLevel** (*ConsistencyLevel*) -

    The consistency level of the collection.

- **shardsNum** (*Integer*) -

    The number of shards in the collection.

- **properties** (*Map&lt;String, String&gt;*) -

    The properties of the collection.

- **aliases** (*List&lt;String&gt;*) -

    A list of the aliases of the collection.

- **updateTimestamp** (*Long*) -

    The timestamp when the collection was last updated.

- **enableNamespace** (*Boolean*) -

    Whether the namespace feature is enabled for the collection.

- **schemaVersion** (*Integer*) -

    The schema version of the collection.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.BatchDescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;
import java.util.Collections;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get the collection detail
BatchDescribeCollectionReq describeCollectionReq = BatchDescribeCollectionReq.builder()
        .collectionNames(Collections.singletonList("test"))
        .build();
List<DescribeCollectionResp> batchResp = client.batchDescribeCollection(describeCollectionReq);
```
