---
title: "addCollectionField() | Java | v2"
slug: /java/java/v2-Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.1
deprecate_since: false
notebook: false
description: "この操作では、コレクションを再作成せずに、既存のコレクションに新しいスカラーフィールドまたはベクトルフィールドを追加します。既存の行には新しいフィールドの値がないため、追加するベクトルフィールドは NULL 許容にする必要があります。 | Java | v2"
type: docx
token: LaHmdGNGZog0JbxA8amcblpsnDR
sidebar_position: 27
keywords: 
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - addCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionField()

この操作では、コレクションを再作成せずに、既存のコレクションに新しいスカラーフィールドまたはベクトルフィールドを追加します。既存の行には新しいフィールドの値がないため、追加するベクトルフィールドは NULL 許容にする必要があります。

```java
public void addCollectionField(AddCollectionFieldReq request)
```

## リクエスト構文\{#request-syntax}

```java
client.addCollectionField(AddCollectionFieldReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .fieldName(String fieldName)
    .description(String description)
    .dataType(DataType dataType)
    .maxLength(Integer maxLength)
    .dimension(Integer dimension)
    .elementType(DataType elementType)
    .maxCapacity(Integer maxCapacity)
    .isNullable(Boolean isNullable)
    .defaultValue(Object defaultValue)
    .enableAnalyzer(Boolean enableAnalyzer)
    .analyzerParams(Map<String, Object> analyzerParams)
    .enableMatch(Boolean enableMatch)
    .typeParams(Map<String, String> typeParams)
    .multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)
    .structFields(List<CreateCollectionReq.FieldSchema> structFields)
    .externalField(String externalField)
    .build()
);
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -<br/>
  対象コレクションの名前です。

- `databaseName(String databaseName)` -<br/>
  データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `fieldName(String fieldName)` -<br/>
  追加するフィールドの名前です。

- `description(String description)` -<br/>
  フィールドの人が読める説明です。

- `dataType(DataType dataType)` -<br/>
  フィールドのデータ型です。スカラーフィールド、ベクトルフィールド、配列、JSON、および構造体関連のフィールド型は、コレクションを作成するときに使用するものと同じ `DataType` 値に従います。

- `maxLength(Integer maxLength)` -<br/>
  `DataType.VarChar` フィールドの最大文字数です。値が `typeParams` を使用して指定されている場合を除き、VarChar フィールドにはこのパラメーターが必要です。

- `dimension(Integer dimension)` -<br/>
  ベクトルの次元です。これは、`DataType.FloatVector` などの固定次元のベクトルフィールドに必要です。

- `elementType(DataType elementType)` -<br/>
  配列フィールドの要素型です。

- `maxCapacity(Integer maxCapacity)` -<br/>
  配列フィールドに格納できる要素の最大数です。

- `isNullable(Boolean isNullable)` -<br/>
  追加するフィールドが `null` 値を受け入れるかどうかです。v3.0.1 以降では、既存のコレクションに追加するベクトルフィールドで、これを `true` に設定する必要があります。設定しない場合、SDK は `MilvusClientException` をスローします。

- `defaultValue(Object defaultValue)` -<br/>
  追加するフィールドのデフォルト値です。実行時の型は `dataType` と一致する必要があります。

- `enableAnalyzer(Boolean enableAnalyzer)` -<br/>
  `DataType.VarChar` フィールドのテキスト分析を有効にするかどうかです。

- `analyzerParams(Map<String, Object> analyzerParams)` -<br/>
  VarChar フィールドのアナライザー設定です。トークナイザーやフィルターの設定などが含まれます。

- `enableMatch(Boolean enableMatch)` -<br/>
  VarChar フィールドのキーワードマッチングを有効にするかどうかです。

- `typeParams(Map<String, String> typeParams)` -<br/>
  追加のフィールド型パラメーターです。`dimension` や `maxLength` などの専用ビルダーメソッド（Dedicated）は、このマップの対応するエントリをオーバーライドします。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -<br/>
  テキストフィールドの多言語アナライザー設定です。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -<br/>
  構造体フィールドのネストされたフィールドスキーマです。

- `externalField(String externalField)` -<br/>
  コレクションの基盤が外部ソースである場合、この Milvus フィールドにマッピングされる外部ソースフィールドです。

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。これには、`isNullable(false)` を指定してベクトルフィールドを追加した場合や、`isNullable(true)` を設定せずにベクトルフィールドを追加した場合が含まれます。

## 例\{#example}

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

// Add a nullable scalar field to an existing collection.
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(100)
        .isNullable(true)
        .build());

// Add a nullable vector field to an existing collection.
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("embedding_v2")
        .dataType(DataType.FloatVector)
        .dimension(128)
        .isNullable(true)
        .build());
```
