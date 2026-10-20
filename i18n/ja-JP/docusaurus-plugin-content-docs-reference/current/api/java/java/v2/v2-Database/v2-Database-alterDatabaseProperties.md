---
title: "alterDatabaseProperties() | Java | v2"
slug: /java/java/v2-Database-alterDatabaseProperties
sidebar_label: "alterDatabaseProperties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はデータベースのプロパティを変更します。 | Java | v2"
type: docx
token: HQXgddhkMoC3onxxjFjc46W3nNf
sidebar_position: 1
keywords: 
  - Machine Learning
  - RAG
  - NLP
  - Neural Network
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabaseProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabaseProperties()

この操作はデータベースのプロパティを変更します。 

```java
public Void alterDatabaseProperties(AlterDatabasePropertiesReq request)
```

## Request Syntax\{#request-syntax}

```java
alterDatabaseProperties(AlterDatabasePropertiesReq.builder()
    .databaseName(String databaseName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベースの名前。

- `properties(Map<String, String> properties)`

    レプリカ数、resource group などのデータベースのプロパティ。使用可能なデータベースプロパティは以下のとおりです。

    - **データベース.replica.number** -

        データベースのレプリカ数。

    - **データベース.resource_groups**  -

        データベース専用の resource group。

    - **データベース.diskQuota.mb** -

        データベースに割り当てられるディスククォータ（メガバイト（**MB**）単位）。

    - **データベース.max.コレクション** -

        Maximum number of コレクション allowed in the データベース.

    - **データベース.force.deny.writing** -

        データベース内のすべての書き込み操作を拒否するかどうか。

    - **データベース.force.deny.reading** -

        データベース内のすべての読み取り操作を拒否するかどうか。

- `property(String key, String value)`

    Adds a single property to the データベース.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.AlterDatabasePropertiesReq;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter database properties
Map<String, String> properties = new HashMap<>();
properties.put("database.replica.number", "1");
AlterDatabasePropertiesReq alterDatabasePropertiesReq = AlterDatabasePropertiesReq.builder()
        .databaseName(databaseName)
        .properties(properties)
        .build();
client.alterDatabaseProperties(alterDatabaseReq);
```
