---
title: "addCollectionStructField() | Java | v2"
slug: /java/java/v2-Collections-addCollectionStructField
sidebar_label: "addCollectionStructField()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションに struct フィールドを追加します。コレクションがすでに作成された後に、構造化配列フィールドでコレクションスキーマを拡張するために使用します。 | Java | v2"
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

この操作は、既存のコレクションに struct フィールドを追加します。コレクションがすでに作成された後に、構造化配列フィールドでコレクションスキーマを拡張するために使用します。

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

- `collectionName(String collectionName)`<br/>
  対象のコレクション名です。

- `databaseName(String databaseName)`<br/>
  コレクションを含むデータベースです。このフィールドを省略すると、現在のデータベースが使用されます。

- `fieldName(String fieldName)`<br/>
  追加する struct 配列フィールドの名前です。

- `description(String description)`<br/>
  新しいフィールドの人間が読み取れる説明です。

- `maxCapacity(Integer maxCapacity)`<br/>
  各行で許可される struct 要素の最大数です。

- `nullable(Boolean nullable)`<br/>
  struct フィールドを null にできるかどうかです。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)`<br/>
  各 struct 要素に含まれるスカラーまたはベクトルフィールドです。

- `addStructField(AddFieldReq addFieldReq)`<br/>
  指定されたフィールドリクエストを struct サブフィールドに変換し、struct フィールド定義に追加します。

- `typeParams(Map<String, String> typeParams)`<br/>
  struct フィールドのためにサーバーに渡される追加の型パラメータです。

- `typeParam(String key, String value)`<br/>
  struct フィールドに 1 つの型パラメータを追加します。

**例外:**

- **MilvusClientException**

    この例外は、検証に失敗した場合、またはこの操作に対してサーバーがエラーを返した場合に発生します。

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
