---
title: "useDatabase() | Java | v2"
slug: /java/java/v2-Database-useDatabase
sidebar_label: "useDatabase()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation changes the database in use. | Java | v2"
type: docx
token: LAJHdQKQQoPjmYxcfQgcvjvLnqh
sidebar_position: 7
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - useDatabase()
  - javaV226
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# useDatabase()

This operation changes the database in use.

```java
public void useDatabase(String dbName)
```

## Request Syntax\{#request-syntax}

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

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Switch the client to another database
client.useDatabase("my_database")
```
