---
title: "addCollectionField() | Java | v2"
slug: /java/java/v2-Collections/v2-Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.1
deprecate_since: false
notebook: false
description: "この操作は、collection を再作成することなく、既存の collection に新しい scalar または vector フィールドを追加します。既存の行には新しいフィールドの値がないため、追加される vector フィールドは nullable である必要があります。 | Java | v2"
type: docx
token: LaHmdGNGZog0JbxA8amcblpsnDR
sidebar_position: 23
keywords: 
  - milvus open source
  - Milvus はどのように動作するか
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionField()

この操作は、collection を再作成することなく、既存の collection に新しい scalar または vector フィールドを追加します。既存の行には新しいフィールドの値がないため、追加される vector フィールドは nullable である必要があります。

```java
public void addCollectionField(AddCollectionFieldReq request)
```

## Request Syntax\{#request-syntax}

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

- `collectionName(String collectionName)` -

    対象 collection の名前。

- `databaseName(String databaseName)` -

    データベース名。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `fieldName(String fieldName)` -

    追加するフィールドの名前。

- `description(String description)` -

    フィールドの人間が読める説明。

- `dataType(DataType dataType)` -

    フィールドのデータ型。scalar、vector、array、JSON、および struct 関連のフィールド型は、collection 作成時に使用されるものと同じ `DataType` 値に従います。

- `maxLength(Integer maxLength)` -

    `DataType.VarChar` フィールドの最大文字数。`typeParams` を通じて値が指定されていない限り、VarChar フィールドでは必須です。

- `dimension(Integer dimension)` -

    vector の次元数。`DataType.FloatVector` のような固定次元 vector フィールドでは必須です。

- `elementType(DataType elementType)` -

    array フィールドの要素型。

- `maxCapacity(Integer maxCapacity)` -

    array フィールドで許可される要素の最大数。

- `isNullable(Boolean isNullable)` -

    追加されるフィールドが `null` 値を受け入れるかどうか。v3.0.1 以降では、既存の collection に追加される vector フィールドはこれを `true` に設定する必要があります。そうしない場合、SDK は `MilvusClientException` を送出します。

- `defaultValue(Object defaultValue)` -

    追加されるフィールドのデフォルト値。実行時の型は `dataType` と一致している必要があります。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    `DataType.VarChar` フィールドでテキスト解析を有効にするかどうか。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    トークナイザーやフィルター設定など、VarChar フィールドの analyzer 構成。

- `enableMatch(Boolean enableMatch)` -

    VarChar フィールドでキーワードマッチングを有効にするかどうか。

- `typeParams(Map<String, String> typeParams)` -

    追加のフィールド型パラメータ。`dimension` や `maxLength` などの専用 builder メソッドは、このマップ内の対応するエントリを上書きします。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    テキストフィールドの多言語 analyzer 構成。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -

    struct フィールドのネストされたフィールドスキーマ。

- `externalField(String externalField)` -

    collection が外部ソースを基盤としている場合に、この Milvus フィールドにマッピングされる外部ソースフィールド。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。これには、`isNullable(false)` で vector フィールドが追加された場合や、`isNullable(true)` を設定せずに追加された場合が含まれます。

## Example\{#example}

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
