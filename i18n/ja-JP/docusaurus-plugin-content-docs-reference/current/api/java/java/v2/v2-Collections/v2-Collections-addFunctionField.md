---
title: "addFunctionField() | Java | v2"
slug: /java/java/v2-Collections-addFunctionField
sidebar_label: "addFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "既存の Milvus 3.0 collection に、関数ベースの field と、その明示的に設定された紐付け index を追加します。 | Java | v2"
type: docx
token: GTZHdG3fMoBZi0x23BNctsO7nEE
sidebar_position: 38
keywords: 
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - addFunctionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addFunctionField()

既存の Milvus 3.0 collection に、関数ベースの field と、その明示的に設定された紐付け index を追加します。

```java
public void addFunctionField(AddFunctionFieldReq request)
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    対象 collection の名前です。

- `databaseName(String databaseName)`

    データベース名です。省略した場合は現在のデータベースがデフォルトで使用されます。

- `fieldName(String fieldName)`

    追加する関数出力 field の名前です。

- `description(String description)`

    新しい field の人間が読みやすい説明です。

- `dataType(DataType dataType)`

    新しい関数出力 field のデータ型です。

- `maxLength(Integer maxLength)`

    可変長 field の最大長です。

- `dimension(Integer dimension)`

    vector field の次元数です。

- `elementType(DataType elementType)`

    配列 field の要素型です。

- `maxCapacity(Integer maxCapacity)`

    配列 field に含められる要素の最大数です。

- `isNullable(Boolean isNullable)`

    field が null 値を受け入れるかどうかです。

- `defaultValue(Object defaultValue)`

    scalar field のデフォルト値です。

- `enableAnalyzer(Boolean enableAnalyzer)`

    field に対してテキスト解析を有効にするかどうかです。

- `analyzerParams(Map<String, Object> analyzerParams)`

    field のアナライザー設定です。

- `enableMatch(Boolean enableMatch)`

    field に対してテキストマッチを有効にするかどうかです。

- `typeParams(Map<String, String> typeParams)`

    追加の field 型パラメータです。

- `function(CreateCollectionReq.Function function)`

    関数定義です。`fieldName` と一致する出力をちょうど 1 つ持つ必要があります。

- `indexParam(IndexParam indexParam)`

    紐付けられた index の設定です。同じ field を使用し、None または AUTOINDEX 以外の明示的な index type を指定する必要があります。

**RETURNS:**

*void*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバー実行に失敗した場合に発生します。正確な失敗理由は例外メッセージを確認してください。

## Example\{#example}

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
