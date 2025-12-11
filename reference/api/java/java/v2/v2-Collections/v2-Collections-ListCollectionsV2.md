---
title: "ListCollectionsV2() | Java | v2"
slug: /java/java/v2-Collections-ListCollectionsV2
sidebar_label: "ListCollectionsV2()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all existing collections in a specified database. | Java | v2"
type: docx
token: WY4idJdzCozGGnxmLoFcIjC2ndw
sidebar_position: 29
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
  - zilliz
  - zilliz cloud
  - cloud
  - ListCollectionsV2()
  - javaV226
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# ListCollectionsV2()

This operation lists all existing collections in a specified database.

```java
public ListCollectionsResp listCollectionsV2(ListCollectionsReq request)
```

## Request Syntax\{#request-syntax}

```java
listCollectionsV2(ListCollectionsReq.builder()
    .databaseName(String databaseName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the target database. Once specified, this operation returns all collections in the specified database.

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
import io.milvus.v2.service.collection.request.ListCollectionsReq;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List collections
ListCollectionReq listCollectionReq = ListCollectionReq.builder()
    .databaseName("my_database")
    .build();

ListCollectionsResp listAliasResp = client.listCollectionsV2(listCollectionReq);
```

