---
title: "describeDatabase() | Java | v2"
slug: /java/java/v2-Database-describeDatabase
sidebar_label: "describeDatabase()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves detailed information about a specific database. | Java | v2"
type: docx
token: VZ64davS5osZHKxxbPac3Ixtnlc
sidebar_position: 3
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - describeDatabase()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeDatabase()

This operation retrieves detailed information about a specific database.

```java
public DescribeDatabaseResp describeDatabase(DescribeDatabaseReq request)
```

## Request Syntax\{#request-syntax}

```java
describeDatabase(DescribeDatabaseReq.builder()
    .databaseName(String databaseName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database.

**RETURN TYPE:**

*DescribeDatabaseResp*

**RETURNS:**

A **DescribeDatabaseResp** object that contains detailed information about the specified database.

**PARAMETERS:**

- **databaseName** (*String*) -

    The name of the database.

- **properties** (*Map&lt;String, String&gt;*) -

    The properties of the database.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.param.Constant;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.DescribeDatabaseReq;
import io.milvus.v2.service.database.response.DescribeDatabaseResp;
import java.util.Map;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe database
DescribeDatabaseResp descResp = client.describeDatabase(DescribeDatabaseReq.builder()
        .databaseName(databaseName)
        .build());
Map<String,String> propertiesResp = descResp.getProperties();
System.out.println(propertiesResp.get(Constant.DATABASE_REPLICA_NUMBER));
```
