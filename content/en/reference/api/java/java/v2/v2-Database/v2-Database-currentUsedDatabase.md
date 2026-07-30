---
title: "currentUsedDatabase() | Java | v2"
slug: /java/java/v2-Database-currentUsedDatabase
sidebar_label: "currentUsedDatabase()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation returns the name of the database currently being used by this client. | Java | v2"
type: docx
token: UCpTdpkNEoHDyjxxCqqcZLSXnAe
sidebar_position: 8
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - currentUsedDatabase()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# currentUsedDatabase()

This operation returns the name of the database currently being used by this client.

```java
public String currentUsedDatabase()
```

**RETURNS:**

*String*

The name of the currently active database.

## Example\{#example}

```java
String dbName = client.currentUsedDatabase();
System.out.println("Current database: " + dbName);
```
