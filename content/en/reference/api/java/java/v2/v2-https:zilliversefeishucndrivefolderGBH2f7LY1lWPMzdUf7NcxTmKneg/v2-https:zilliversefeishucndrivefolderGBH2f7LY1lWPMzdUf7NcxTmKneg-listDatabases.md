---
title: "listDatabases() | Java | v2"
slug: /java/java/v2-https:zilliversefeishucndrivefolderGBH2f7LY1lWPMzdUf7NcxTmKneg-listDatabases
sidebar_label: "listDatabases()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all the database names. | Java | v2"
type: docx
token: X2dbdeazuofnEVxVQtgcBHujnvf
sidebar_position: 5
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - listDatabases()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listDatabases()

This operation lists all the database names. 

```java
public ListDatabasesResp listDatabases()
```

**RETURN TYPE:**

*ListDatabasesResp*

**RETURNS:**

A ListDatabasesResp object contains a list of all database names.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.response.ListDatabasesResp;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List databases
ListDatabasesResp listDatabasesResp = client.listDatabases();
List<String> dbNames = listDatabasesResp.getDatabaseNames();
```
