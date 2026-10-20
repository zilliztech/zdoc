---
title: "addFunctionField() | Java | v2"
slug: /java/java/v2-Collections-addFunctionField
sidebar_label: "addFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、既存の Milvus 3.0 コレクションに、関数ベースのフィールドと、明示的に設定されたバインド済みインデックスを追加します。 | Java | v2"
type: docx
token: GTZHdG3fMoBZi0x23BNctsO7nEE
sidebar_position: 38
keywords: 
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - addFunctionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addFunctionField()

この操作では、既存の Milvus 3.0 コレクションに、関数ベースのフィールドと、明示的に設定されたバインド済みインデックスを追加します。

```java
public void addFunctionField(AddFunctionFieldReq request)
```

## リクエスト構文\{#request-syntax}

```java
AddFunctionFieldReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .fieldName(fieldName)
    .description(description)
    .dataType(dataType)
    .maxLength(maxLength)
    .dimension(dimension)
    .elementType(elementType)
    .maxCapacity(maxCapacity)
    .isNullable(isNullable)
    .defaultValue(defaultValue)
    .enableAnalyzer(enableAnalyzer)
    .analyzerParams(analyzerParams)
    .enableMatch(enableMatch)
    .typeParams(typeParams)
    .function(function)
    .indexParam(indexParam)
    .build();
```

**ビルダーメソッド：**

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は、現在のデータベースがデフォルトになります。

- `fieldName(String fieldName)`

    追加する関数出力フィールドの名前です。

- `description(String description)`

    新しいフィールドの人間が読める形式の説明です。

- `dataType(DataType dataType)`

    新しい関数出力フィールドのデータ型です。

- `maxLength(Integer maxLength)`

    可変長フィールドの最大長です。

- `dimension(Integer dimension)`

    ベクトルフィールドの次元です。

- `elementType(DataType elementType)`

    配列フィールドの要素型です。

- `maxCapacity(Integer maxCapacity)`

    配列フィールド内の要素の最大数です。

- `isNullable(Boolean isNullable)`

    フィールドが null 値を受け入れるかどうかです。

- `defaultValue(Object defaultValue)`

    スカラーフィールドのデフォルト値です。

- `enableAnalyzer(Boolean enableAnalyzer)`

    フィールドでテキスト分析を有効にするかどうかです。

- `analyzerParams(Map<String, Object> analyzerParams)`

    フィールドのアナライザー構成です。

- `enableMatch(Boolean enableMatch)`

    フィールドでテキストマッチを有効にするかどうかです。

- `typeParams(Map<String, String> typeParams)`

    追加のフィールド型パラメーターです。

- `function(CreateCollectionReq.Function function)`

    関数定義です。fieldName に一致する出力を 1 つだけ持つ必要があります。

- `indexParam(IndexParam indexParam)`

    バインドされたインデックス構成です。同じフィールドを使用し、None または AUTOINDEX 以外の明示的なインデックスタイプを使用する必要があります。

**例外：**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバーでの実行に失敗した場合にスローされます。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
CreateCollectionReq.Function bm25Function = CreateCollectionReq.Function.builder()
    .name("bm25")
    .functionType(FunctionType.BM25)
    .inputFieldNames(Collections.singletonList("text"))
    .outputFieldNames(Collections.singletonList("sparse"))
    .build();

IndexParam sparseIndex = IndexParam.builder()
    .fieldName("sparse")
    .indexName("sparse_idx")
    .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
    .metricType(IndexParam.MetricType.BM25)
    .build();

client.addFunctionField(AddFunctionFieldReq.builder()
    .collectionName("books")
    .fieldName("sparse")
    .dataType(DataType.SparseFloatVector)
    .function(bm25Function)
    .indexParam(sparseIndex)
    .build());
```
