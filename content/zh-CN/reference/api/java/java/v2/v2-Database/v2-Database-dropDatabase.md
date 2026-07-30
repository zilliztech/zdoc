---
displayed_sidbar: javaSidebar
title: "dropDatabase() | Java | v2"
slug: /java/java/v2-Database-dropDatabase
sidebar_label: "dropDatabase()"
added_since: v2.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops a database with a name. | Java | v2"
type: docx
token: LwqSdN6s5oZBhAxzQsxcnXswnah
sidebar_position: 4
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabase()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropDatabase()

This operation drops a database with a name. 

```java
public void dropDatabase(DropDatabaseReq request)
```

## Request Syntax

```java
dropDatabase(DropDatabaseReq.builder()
    .databaseName(String databaseName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database to drop.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.DropDatabaseReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a database
DropDatabaseReq dropDatabaseReq = DropDatabaseReq.builder()
        .databaseName(databaseName)
        .build();
client.dropDatabase(dropDatabaseReq);
```

