---
title: "dropDatabaseProperties() | Java | v2"
slug: /java/java/v2-Database-dropDatabaseProperties
sidebar_label: "dropDatabaseProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation resets the database properties to their default values. | Java | v2"
type: docx
token: CzC6dm9N8oBvQZxRMyocNfTpn9f
sidebar_position: 5
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabaseProperties()
  - javaV226
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabaseProperties()

This operation resets the database properties to their default values.

```java
public Void dropDatabaseProperties(DropDatabasePropertiesReq request)
```

## Request Syntax\{#request-syntax}

```java
dropDatabaseProperties(DropDatabasePropertiesReq.builder()
    .databaseName(String databaseName)
    .propertyKeys(List<String> propertyKeys)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database.

- `propertyKeys(List<String propertyKeys>)`

    The properties of the database, such as replica number, resource groups. Possible database properties are as follows:

    - **database.replica.number** -

        Number of replicas for the database.

    - **database.resource_groups**  -

        Resource groups dedicated to the database.

    - **database.diskQuota.mb** -

        Disk quota allocated to the database in megabytes (**MB**).

    - **database.max.collections** -

        Maximum number of collections allowed in the database.

    - **database.force.deny.writing** -

        Whether to deny all write operations in the database.

    - **database.force.deny.reading** -

        Whether to deny all read operations in the database.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.DropDatabasePropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop database properties
List<String> propertyKeys = new ArrayList<>();
propertyKeys.add("database.replica.number");

DropDatabasePropertiesReq dropDatabasePropertiesReq = DropDatabasePropertiesReq.builder()
        .databaseName(databaseName)
        .propertyKeys(propertyKeys)
        .build();
client.dropDatabaseProperties(alterDatabaseReq);
```

