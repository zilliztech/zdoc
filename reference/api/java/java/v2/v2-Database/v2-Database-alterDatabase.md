---
displayed_sidbar: javaSidebar
title: "alterDatabase() | Java | v2"
slug: /java/java/v2-Database-alterDatabase
sidebar_label: "alterDatabase()"
beta: false
notebook: false
description: "This operation alters a database's properties. | Java | v2"
type: docx
token: PBYIdLALvoHd0pxwI8Ec4JsTnBX
sidebar_position: 1
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabase()
  - javaV2
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterDatabase()

This operation alters a database's properties. 

```java
public void alterDatabase(AlterDatabaseReq request)
```

## Request Syntax{#request-syntax}

```java
alterDatabase(AlterDatabaseReq.builder()
    .databaseName(String databaseName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database.

- `properties(Map<String, String> properties)`

The properties of the database, such as replica number, resource groups.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
Map<String, String> properties = new HashMap<>();
properties.put(Constant.DATABASE_REPLICA_NUMBER, "1");
AlterDatabaseReq alterDatabaseReq = AlterDatabaseReq.builder()
        .databaseName(databaseName)
        .properties(properties)
        .build();
client.alterDatabase(alterDatabaseReq);
```

