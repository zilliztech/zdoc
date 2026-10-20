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
  - ベクトルデータベースの比較
  - openai ベクトルデータベース
  - 自然言語処理データベース
  - 低コストのベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
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

**戻り値の型：**

*String*

**戻り値：**

現在アクティブなデータベースの名前です。

**パラメーター：**

- **databaseName**（*String*）-

    このクライアントが現在使用しているデータベースの名前です。データベースが構成されていない場合は `default` を返します。

## 例\{#example}

```java
String dbName = client.currentUsedDatabase();
System.out.println("Current database: " + dbName);
```
