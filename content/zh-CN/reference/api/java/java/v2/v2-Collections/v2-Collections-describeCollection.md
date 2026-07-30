---
displayed_sidbar: javaSidebar
title: "describeCollection() | Java | v2"
slug: /java/java/v2-Collections-describeCollection
sidebar_label: "describeCollection()"
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
beta: false
notebook: false
description: "This operation lists detailed information about a specific collection. | Java | v2"
type: docx
token: F8lCdDCa3oD48WxWyURcmfoznYt
sidebar_position: 12
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - describeCollection()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeCollection()

This operation lists detailed information about a specific collection.

```java
public DescribeCollectionResp describeCollection(DescribeCollectionReq request)
```

## Request Syntax

```java
describeCollection(DescribeCollectionReq.builder()
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

    Setting this to a non-existing collection results in **MilvusException**.

**RETURN TYPE:**

*DescribeCollectionResp*

**RETURNS:**

A **DescribeCollectionResp** object that contains detailed information about the specified collection.

**PARAMETERS:**

- **collectionName** (*String*)

    The name of the current collection.

- **collectionID** (*Long*)

    The ID of the collection.

- **databaseName** (*String*)

    The name of the database to which the current collection belongs.

- **description** (*String*)

    The description of the current collection.

- **numOfPartitions** (*long*)

    The number of partitions in the current collection.

- **fieldNames** (*List\<String\>*)

    A list of fields in the current collection.

- **vectorFieldName** (*List\<String\>*)

    The name of the vector field.

- **primaryFieldName** (*String*)

    The name of the primary field.

- **enableDynamicField** (*Boolean*)

    Whether to use the reserved JSON field **&#36;meta** to save non-schema-defined fields and their values as key-value pairs.

- **autoID** (*Boolean*)

    Whether Zilliz Cloud automatically generates the primary key for the collection.

- **collectionSchema** (*CreateCollectionReq.CollectionSchema*)

    The scheme of the collection.

- **createTime** (*Long*)

    The time when the collection was created.

- **createUtcTime** (*Long*) -

    The time when the collection was created in UTC.

- **consistencyLevel** (*ConsistencyLevel*) -

    The consistency level of the collection.

- **shardsNum** (*Integer*) -

    The number of shards in the collection.

- **properties** (*Map\<String, String>*) -

    The properties of the current collection. 

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get the collection detail
DescribeCollectionReq describeCollectionReq = DescribeCollectionReq.builder()
        .collectionName("test")
        .build();
DescribeCollectionResp describeCollectionResp = client.describeCollection(describeCollectionReq);

```
