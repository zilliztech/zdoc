---
displayed_sidbar: javaSidebar
title: "createDatabase() | Java | v2"
slug: /java/java/v2-Database-createDatabase
sidebar_label: "createDatabase()"
beta: false
notebook: false
description: "This operation creates a database with a name. | Java | v2"
type: docx
token: IqQudFVIKot4mVxWD4xclJymn8g
sidebar_position: 2
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - createDatabase()
  - javaV225
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createDatabase()

This operation creates a database with a name. 

```java
public void createDatabase(CreateDatabaseReq request)
```

## Request Syntax{#request-syntax}

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

The properties of the database, such as replica number, resource groups.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.param.Constant;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.CreateDatabaseReq;

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

