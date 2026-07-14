---
title: "addCollectionStructField() | Java | v2"
slug: /java/java/v2-Collections-addCollectionStructField
sidebar_label: "addCollectionStructField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の collection に struct フィールドを追加します。collection がすでに作成された後に、構造化配列フィールドで collection スキーマを拡張するために使用します。 | Java | v2"
type: docx
token: RQT1dGVPloPOLAx8G2mcifFEnCc
sidebar_position: 37
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - zilliz
  - zilliz cloud
  - クラウド
  - addCollectionStructField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionStructField()

この操作は、既存の collection に struct フィールドを追加します。collection がすでに作成された後に、構造化配列フィールドで collection スキーマを拡張するために使用します。

```java
public void addCollectionStructField(AddCollectionStructFieldReq request)
```

## リクエスト構文\{#request-syntax}

```java
addCollectionStructField(AddCollectionStructFieldReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .fieldName(String fieldName)
    .description(String description)
    .maxCapacity(Integer maxCapacity)
    .nullable(Boolean nullable)
    .structFields(List<CreateCollectionReq.FieldSchema> structFields)
    .typeParams(Map<String, String> typeParams)
    .build());
```

**ビルダーメソッド:**

- `collectionName(String collectionName)`

    対象の collection 名です。

- `databaseName(String databaseName)`

    collection を含むデータベースです。このフィールドを省略すると、現在のデータベースが使用されます。

- `fieldName(String fieldName)`

    追加する struct 配列フィールドの名前です。

- `description(String description)`

    新しいフィールドの人間が読める説明です。

- `maxCapacity(Integer maxCapacity)`

    各行で許可される struct 要素の最大数です。

- `nullable(Boolean nullable)`

    struct フィールドを null にできるかどうかを指定します。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)`

    各 struct 要素に含まれる scalar または vector フィールドです。

- `typeParams(Map<String, String> typeParams)`

    struct フィールドについてサーバーに渡される追加の型パラメータです。

**戻り値:**

*void*

**例外:**

- **MilvusClientException**

    バリデーションに失敗した場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

client.addCollectionStructField(AddCollectionStructFieldReq.builder()
    .collectionName("book")
    .fieldName("metadata")
    .maxCapacity(8)
    .nullable(true)
    .structFields(Arrays.asList(
        CreateCollectionReq.FieldSchema.builder()
            .name("author")
            .dataType(DataType.VarChar)
            .maxLength(256)
            .build()))
    .build());
```

{/* category: Collections; action: CREATE; addedSince: v3.0.x */}
