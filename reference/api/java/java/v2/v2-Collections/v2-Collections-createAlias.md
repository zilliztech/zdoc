---
title: "createAlias() | Java | v2"
slug: /java/java/v2-Collections-createAlias
sidebar_label: "createAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation creates an alias for an existing collection. | Java | v2"
type: docx
token: BujpdsEJnozVT4xY3NFczyfrnDe
sidebar_position: 6
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - createAlias()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createAlias()

This operation creates an alias for an existing collection.

```java
public void createAlias(CreateAliasReq request)
```

## Request Syntax\{#request-syntax}

```java
createAlias(CreateAliasReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .alias(String alias)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    The name of the target collection.

- `alias(String alias)` -

    The alias name.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CreateAliasReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create an alias "test_alias" for collection "test"
CreateAliasReq createAliasReq = CreateAliasReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .alias("test_alias")
        .build();
client.createAlias(createAliasReq);
```
