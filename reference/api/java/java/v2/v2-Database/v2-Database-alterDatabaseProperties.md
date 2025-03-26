---
displayed_sidbar: javaSidebar
title: "alterDatabaseProperties() | Java | v2"
slug: /java/java/v2-Database-alterDatabaseProperties
sidebar_label: "alterDatabaseProperties()"
beta: false
notebook: false
description: "This operation alters a database's properties. | Java | v2"
type: docx
token: PBYIdLALvoHd0pxwI8Ec4JsTnBX
sidebar_position: 1
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabaseProperties()
  - javaV225
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterDatabaseProperties()

This operation alters a database's properties. 

```java
public Void alterDatabaseProperties(AlterDatabasePropertiesReq request)
```

## Request Syntax{#request-syntax}

```java
alterDatabaseProperties(AlterDatabasePropertiesReq.builder()
    .databaseName(String databaseName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database.

- `properties(Map<String, String> properties)`

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

## Example{#example}

```java
Map<String, String> properties = new HashMap<>();
properties.put("database.replica.number", "1");
AlterDatabasePropertiesReq alterDatabasePropertiesReq = AlterDatabasePropertiesReq.builder()
        .databaseName(databaseName)
        .properties(properties)
        .build();
client.alterDatabaseProperties(alterDatabaseReq);
```

