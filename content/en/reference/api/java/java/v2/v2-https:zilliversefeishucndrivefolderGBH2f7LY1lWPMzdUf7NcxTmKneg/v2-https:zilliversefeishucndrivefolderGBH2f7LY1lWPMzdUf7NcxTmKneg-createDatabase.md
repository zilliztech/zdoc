---
title: "createDatabase() | Java | v2"
slug: /java/java/v2-https:zilliversefeishucndrivefolderGBH2f7LY1lWPMzdUf7NcxTmKneg-createDatabase
sidebar_label: "createDatabase()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a database with the specified name. | Java | v2"
type: docx
token: LirKdHD5lomrfSxXrZzcOAWpnMf
sidebar_position: 2
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - createDatabase()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createDatabase()

This operation creates a database with the specified name. 

```java
public void createDatabase(CreateDatabaseReq request)
```

## Request Syntax\{#request-syntax}

```java
createDatabase(CreateDatabaseReq.builder()
    .databaseName(String databaseName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database to create.

- `properties(Map<String, String> properties)`

The properties of the database, such as the replica number and resource groups.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.param.Constant;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.CreateDatabaseReq;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a database
Map<String, String> properties = new HashMap<>();
properties.put(Constant.DATABASE_REPLICA_NUMBER, "2");
CreateDatabaseReq createDatabaseReq = CreateDatabaseReq.builder()
        .databaseName(databaseName)
        .properties(properties)
        .build();
client.createDatabase(createDatabaseReq);
```
