---
title: "currentUsedDatabase() | Java | v2"
slug: /java/java/v2-Database-currentUsedDatabase
sidebar_label: "currentUsedDatabase()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、このクライアントが現在使用しているデータベースの名前を返します。 | Java | v2"
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

この操作は、このクライアントが現在使用しているデータベースの名前を返します。

```java
public String currentUsedDatabase()
```

**返り値:**

*String*

現在アクティブなデータベースの名前。

## 例\{#example}

```java
String dbName = client.currentUsedDatabase();
System.out.println("Current database: " + dbName);
```
