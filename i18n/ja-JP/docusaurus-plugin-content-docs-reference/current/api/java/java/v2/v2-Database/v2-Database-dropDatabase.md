---
title: "dropDatabase() | Java | v2"
slug: /java/java/v2-Database-dropDatabase
sidebar_label: "dropDatabase()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定した名前のデータベースを削除します。 | Java | v2"
type: docx
token: N4TUdZOmso4MVfxTYFbcVQ3Kn1c
sidebar_position: 4
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - dropDatabase()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropDatabase()

この操作は、指定した名前のデータベースを削除します。

```java
public void dropDatabase(DropDatabaseReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropDatabase(DropDatabaseReq.builder()
    .databaseName(String databaseName)
    .build()
)
```

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    削除するデータベースの名前です。

**例外：**

- **MilvusClientExceptions**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.DropDatabaseReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a database
DropDatabaseReq dropDatabaseReq = DropDatabaseReq.builder()
        .databaseName(databaseName)
        .build();
client.dropDatabase(dropDatabaseReq);
```
