---
title: "upsert() | Java | v2"
slug: /java/java/v2-Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "(プレースホルダー) | Java | v2"
type: docx
token: I7UWdVnAJobbSSxSPdHc024unMe
sidebar_position: 9
keywords: 
  - Vector インデックス
  - ベクターデータベース オープンソース
  - オープンソース vector db
  - ベクターデータベースの例
  - zilliz
  - zilliz cloud
  - クラウド
  - upsert()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

# upsert()\{#upsert}

この操作は、collection に新しい行を挿入するか、主キーがすでに存在する場合は既存の行を更新します。部分更新やフィールドレベルの操作を使用して、選択したフィールドを更新することもできます。

```java
public UpsertResp upsert(UpsertReq request)
```

## リクエスト構文\{#request-syntax}

```java
upsert(UpsertReq.builder()
    .data(List<JsonObject> data)
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .partialUpdate(boolean partialUpdate)
    .fieldOps(List<UpsertReq.FieldPartialUpdateOp> fieldOps)
    .build()
);
```

**BUILDER メソッド:**

- `data(List<JsonObject> data)`

    JSON オブジェクトとして挿入/アップサートするデータ行のリスト。

- `databaseName(String databaseName)`

    データベース名。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象の collection 名。

- `partitionName(String partitionName)`

    対象の partition 名。

- `partialUpdate(boolean partialUpdate)`

    upsert 中にフィールドの部分更新を有効にするかどうか。各行で主キーと指定されたフィールドのみを更新したい場合は、これを `true` に設定します。`fieldOps` で `ARRAY_APPEND` または `ARRAY_REMOVE` を使用すると、SDK は自動的に部分更新セマンティクスでリクエストを送信します。

- `fieldOps(List<UpsertReq.FieldPartialUpdateOp> fieldOps)`

    部分 upsert 中に `data` 内のフィールドをどのように適用するかを制御します。ほとんどのフィールドでは、このパラメータを省略するか、デフォルトの `REPLACE` 操作を使用して、リクエストに含まれるフィールド値で置き換えます。`ARRAY` フィールドでは、`ARRAY_APPEND` を使用してリクエストのペイロードを既存の配列に追加したり、`ARRAY_REMOVE` を使用して、最初に配列全体を読み取って書き直すことなく、リクエストのペイロードに一致する既存の要素をすべて削除したりできます。各 `FieldPartialUpdateOp` は 1 つの `fieldName` を対象とします。そのフィールドの `data` 内の値は、配列の `element_type` と一致している必要があります。`ARRAY_APPEND` 実行後、最終的な配列はそのフィールドの `max_capacity` を超えてはなりません。

**FieldPartialUpdateOp BUILDER メソッド:**

- `fieldName(String fieldName)`

    部分更新操作の対象となるフィールド。

- `opType(UpsertReq.FieldPartialUpdateOp.OpType opType)`

    適用する操作。有効な値は `REPLACE`、`ARRAY_APPEND`、`ARRAY_REMOVE` です。`REPLACE` 以外の操作は部分更新セマンティクスを意味します。

**戻り値:**

*UpsertResp*

挿入または更新されたエンティティ数に関する情報を含む **UpsertResp** オブジェクト。

**例外:**

- **MilvusClientException**

    `null` の操作、空の `fieldName`、`null` の `opType` など、無効なフィールドレベル操作パラメータを含め、この操作中に何らかのエラーが発生した場合にこの例外がスローされます。

## 例\{#example}

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;

import java.util.Arrays;
import java.util.Collections;

Gson gson = new Gson();

// 1. Set up a client.
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Upsert a complete row.
JsonObject row = new JsonObject();
row.addProperty("id", 0L);
row.add("vector", gson.toJsonTree(Arrays.asList(2.0f, 3.0f)));
row.addProperty("color", "purple");

UpsertReq upsertReq = UpsertReq.builder()
        .collectionName("test")
        .data(Collections.singletonList(row))
        .build();
client.upsert(upsertReq);

// 3. Partially update selected fields.
JsonObject partialRow = new JsonObject();
partialRow.addProperty("id", 0L);
partialRow.addProperty("color", "green");

UpsertReq partialUpdateReq = UpsertReq.builder()
        .collectionName("test")
        .data(Collections.singletonList(partialRow))
        .partialUpdate(true)
        .build();
client.upsert(partialUpdateReq);

// 4. Apply a field-level operation during upsert.
JsonObject arrayRow = new JsonObject();
arrayRow.addProperty("id", 0L);
arrayRow.add("tags", gson.toJsonTree(Arrays.asList("new-tag")));

UpsertReq fieldOpReq = UpsertReq.builder()
        .collectionName("test")
        .data(Collections.singletonList(arrayRow))
        .partialUpdate(true)
        .fieldOps(Collections.singletonList(
                UpsertReq.FieldPartialUpdateOp.builder()
                        .fieldName("tags")
                        .opType(UpsertReq.FieldPartialUpdateOp.OpType.ARRAY_APPEND)
                        .build()))
        .build();
client.upsert(fieldOpReq);
```
