---
title: "useDatabase() | Java | v2"
slug: /java/java/v2-https:zilliversefeishucndrivefolderGBH2f7LY1lWPMzdUf7NcxTmKneg-useDatabase
sidebar_label: "useDatabase()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation changes the database in use. | Java | v2"
type: docx
token: I0cddYcHmorxaYxChficr214nAf
sidebar_position: 6
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - useDatabase()
  - javaV230
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

    This exception is raised when any error occurs during disconnection from Milvus.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Switch the client to another database
client.useDatabase("my_database");
```
