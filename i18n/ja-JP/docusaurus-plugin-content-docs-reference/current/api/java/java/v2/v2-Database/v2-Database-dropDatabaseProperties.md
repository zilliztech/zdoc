---
title: "dropDatabaseProperties() | Java | v2"
slug: /java/java/v2-Database-dropDatabaseProperties
sidebar_label: "dropDatabaseProperties()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、データベースのプロパティをデフォルト値にリセットします。 | Java | v2"
type: docx
token: HSYzdg59FoBzeIxymrLc0EbBnyd
sidebar_position: 5
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabaseProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabaseProperties()

この操作は、データベースのプロパティをデフォルト値にリセットします。

```java
public void dropDatabaseProperties(DropDatabasePropertiesReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropDatabaseProperties(DropDatabasePropertiesReq.builder()
    .databaseName(String databaseName)
    .propertyKeys(List<String> propertyKeys)
    .build()
);
```

**BUILDER メソッド:**

- `databaseName(String databaseName)` -

    データベースの名前。指定しない場合は、現在のデータベースがデフォルトになります。

- `propertyKeys(List<String> propertyKeys)` -

    削除するプロパティキー名のリスト。

**戻り値:**

*void*

*void*

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.DropDatabasePropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop database properties
List<String> propertyKeys = new ArrayList<>();
propertyKeys.add("database.replica.number");

DropDatabasePropertiesReq dropDatabasePropertiesReq = DropDatabasePropertiesReq.builder()
        .databaseName(databaseName)
        .propertyKeys(propertyKeys)
        .build();
client.dropDatabaseProperties(alterDatabaseReq);
```
