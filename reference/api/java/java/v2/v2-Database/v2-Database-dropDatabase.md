---
displayed_sidbar: javaSidebar
title: "dropDatabase() | Java | v2"
slug: /java/java/v2-Database-dropDatabase
sidebar_label: "dropDatabase()"
beta: false
notebook: false
description: "This operation drops a database with a name. | Java | v2"
type: docx
token: LwqSdN6s5oZBhAxzQsxcnXswnah
sidebar_position: 4
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabase()
  - javaV225
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropDatabase()

This operation drops a database with a name. 

```java
public void dropDatabase(DropDatabaseReq request)
```

## Request Syntax{#request-syntax}

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

## Example{#example}

```java
DropDatabaseReq dropDatabaseReq = DropDatabaseReq.builder()
        .databaseName(databaseName)
        .build();
client.dropDatabase(dropDatabaseReq);
```

