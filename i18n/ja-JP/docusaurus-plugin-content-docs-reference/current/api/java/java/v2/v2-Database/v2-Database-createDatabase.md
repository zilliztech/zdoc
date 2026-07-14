---
title: "createDatabase() | Java | v2"
slug: /java/java/v2-Database-createDatabase
sidebar_label: "createDatabase()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、名前を指定してデータベースを作成します。 | Java | v2"
type: docx
token: IqQudFVIKot4mVxWD4xclJymn8g
sidebar_position: 2
keywords: 
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - ベクトル類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - createDatabase()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createDatabase()

この操作は、名前を指定してデータベースを作成します。 

```java
public void createDatabase(CreateDatabaseReq request)
```

## リクエスト構文\{#request-syntax}

```java
createDatabase(CreateDatabaseReq.builder()
    .databaseName(String databaseName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    作成するデータベースの名前です。

- `properties(Map<String, String> properties)`

データベースのプロパティです。たとえば、レプリカ数やリソースグループなどです。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.param.Constant;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.CreateDatabaseReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a database
Map<String, String> properties = new HashMap<>();
properties.put(Constant.DATABASE_REPLICA_NUMBER, "2");
CreateDatabaseReq createDatabaseReq = CreateDatabaseReq.builder()
        .databaseName(databaseName)
        .properties(properties)
        .build();
client.createDatabase(createDatabaseReq);
```

