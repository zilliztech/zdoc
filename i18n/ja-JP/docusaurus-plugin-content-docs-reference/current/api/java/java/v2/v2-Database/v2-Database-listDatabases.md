---
title: "listDatabases() | Java | v2"
slug: /java/java/v2-Database-listDatabases
sidebar_label: "listDatabases()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、すべてのデータベース名を一覧表示します。 | Java | v2"
type: docx
token: X2dbdeazuofnEVxVQtgcBHujnvf
sidebar_position: 6
keywords: 
  - LLM 評価
  - スパースベクトルと密ベクトル
  - 密ベクトル
  - 階層型ナビゲーブルスモールワールド
  - zilliz
  - zilliz cloud
  - クラウド
  - listDatabases()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listDatabases()

この操作は、すべてのデータベース名を一覧表示します。

```java
public ListDatabasesResp listDatabases()
```

**RETURN TYPE:**

*ListDatabasesResp*

**RETURNS:**

ListDatabasesResp オブジェクトには、すべてのデータベース名のリストが含まれます。

**PARAMETERS:**

- **databaseNames** (*List&lt;String&gt;*) -

    すべてのデータベース名のリストです。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

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
