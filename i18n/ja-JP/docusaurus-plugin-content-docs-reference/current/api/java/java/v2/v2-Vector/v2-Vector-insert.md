---
title: "insert() | Java | v2"
slug: /java/java/v2-Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection にデータを挿入します。 | Java | v2"
type: docx
token: Y0N1dL4bVoyUnXxfSu7cjrgRnlc
sidebar_position: 4
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# insert()

この操作は、特定の collection にデータを挿入します。

```java
public InsertResp insert(InsertReq request)
```

## リクエスト構文\{#request-syntax}

```java
insert(InsertReq.builder()
    .data(List<JsonObject> data)
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
);
```

**BUILDER メソッド:**

- `data(List<JsonObject> data)` -

    JSON オブジェクトとして挿入/アップサートするデータ行のリスト。

- `databaseName(String databaseName)` -

    データベース名。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象の collection 名。

- `partitionName(String partitionName)` -

    対象の partition 名。

**戻り値:**

*InsertResp*

挿入されたエンティティ数に関する情報を含む **InsertResp** オブジェクト。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.InsertReq;

// 1. クライアントをセットアップします
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. collection に 1 行追加します。この collection には "id" フィールド
// と次元 2 の "vector" フィールドがあります
JsonObject row = new JsonObject();
List<Float> vectorList = new ArrayList<>();
vectorList.add(1.0f);
vectorList.add(2.0f);
row.add("vector", gson.toJsonTree(vectorList));
row.addProperty("id", 0L);

InsertReq insertReq = InsertReq.builder()
        .collectionName("test")
        .data(Collections.singletonList(row))
        .build();
client.insert(insertReq);
```
