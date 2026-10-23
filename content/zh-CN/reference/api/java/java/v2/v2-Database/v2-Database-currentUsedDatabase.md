---
title: "currentUsedDatabase() | Java | v2"
slug: /java/java/v2-Database-currentUsedDatabase
sidebar_label: "currentUsedDatabase()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作返回此客户端当前正在使用的 Database 名称。 | Java | v2"
type: docx
token: UCpTdpkNEoHDyjxxCqqcZLSXnAe
sidebar_position: 8
keywords: 
  - 向量 Database 对比
  - OpenAI 向量 Database
  - 自然语言处理 Database
  - 低成本向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - currentUsedDatabase()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# currentUsedDatabase()

此操作返回此客户端当前正在使用的 Database 名称。

```java
public String currentUsedDatabase()
```

**返回类型：**

*String*

**返回：**

当前处于活动状态的 Database 名称。

**参数：**

- **databaseName**（*String*）-

    此客户端当前正在使用的 Database 名称。如果尚未配置任何 Database，则返回 `default`。

## 示例\{#example}

```java
String dbName = client.currentUsedDatabase();
System.out.println("Current database: " + dbName);
```
