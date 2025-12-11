---
title: "listCollections() | Java | v2"
slug: /java/java/v2-Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation lists all existing collections. | Java | v2"
type: docx
token: Vv4NdWVa5o5BSrx11OZcNVnQnbh
sidebar_position: 20
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - listCollections()
  - javaV226
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listCollections()

This operation lists all existing collections.

```java
public ListCollectionsResp listCollections()
```

## Request Syntax\{#request-syntax}

```java
listCollections()
```

**RETURN TYPE:**

*ListCollectionsResp*

**RETURNS:**

A **ListCollectionsResp** object containing a list of collection names. If there is not any collection, an empty list will be returned.

**PARAMETERS:**

- **collectionNames** (*List\<String>*)

    A list of strings containing the names of all existing collections.

- **collectionInfos** (*List\<CollectionInfo>*)

    A list of **CollectionInfo** objects. A **CollectionInfo** object has the following fields:

    - **collectionName** (*String*)

        The name of a collection.

    - **shardNum** (*Integer*)

        The number of shards in the above collection.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List collections
ListCollectionsResp listAliasResp = client.listCollections();
```

