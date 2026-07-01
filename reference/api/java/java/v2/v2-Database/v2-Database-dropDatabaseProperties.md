---
title: "dropDatabaseProperties() | Java | v2"
slug: /java/java/v2-Database-dropDatabaseProperties
sidebar_key: java/v2-Database-dropDatabaseProperties
sidebar_label: "dropDatabaseProperties()"
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This operation resets the database properties to their default values. | Java | v2"
type: docx
token: HSYzdg59FoBzeIxymrLc0EbBnyd
sidebar_position: 5
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabaseProperties()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropDatabaseProperties()

This operation resets the database properties to their default values.

```java
public void dropDatabaseProperties(DropDatabasePropertiesReq request)
```

## Request Syntax\{#request-syntax}

```java
dropDatabaseProperties(DropDatabasePropertiesReq.builder()
    .databaseName(String databaseName)
    .propertyKeys(List<String> propertyKeys)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `propertyKeys(List<String> propertyKeys)` -

    A list of property key names to drop.

**RETURNS:**

*void*

*void*

**EXCEPTIONS:**

- **MilvusClientException**

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
