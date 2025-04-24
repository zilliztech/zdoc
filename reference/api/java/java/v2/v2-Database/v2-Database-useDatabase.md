---
displayed_sidbar: javaSidebar
title: "useDatabase() | Java | v2"
slug: /java/java/v2-Database-useDatabase
sidebar_label: "useDatabase()"
beta: false
notebook: false
description: "This operation changes the database in use. | Java | v2"
type: docx
token: LAJHdQKQQoPjmYxcfQgcvjvLnqh
sidebar_position: 7
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - useDatabase()
  - javaV225
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# useDatabase()

This operation changes the database in use.

```java
public void useDatabase(String dbName)
```

## Request Syntax{#request-syntax}

```java
useDatabase(String dbName)
```

**PARAMETERS**

- **dbName** (*String*) -

    The name of the target database.

**RETURNS**

*void*

**EXCEPTIONS**

- InterruptedException

    This exception will be raised when any error occurs during disconnection from Milvus.

## Example{#example}

```java
client.useDatabase("my_database")
```
