---
displayed_sidbar: javaSidebar
title: "listDatabases() | Java | v2"
slug: /java/java/v2-Database-listDatabases
sidebar_label: "listDatabases()"
beta: false
notebook: false
description: "This operation lists all the database names. | Java | v2"
type: docx
token: IHoodknUJohFAbxMFg3c0q8un6f
sidebar_position: 6
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - listDatabases()
  - javaV225
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
displayed_sidebar: javaSidebar

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

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
ListDatabasesResp listDatabasesResp = client.listDatabases();
List<String> dbNames = listDatabasesResp.getDatabaseNames();
```

