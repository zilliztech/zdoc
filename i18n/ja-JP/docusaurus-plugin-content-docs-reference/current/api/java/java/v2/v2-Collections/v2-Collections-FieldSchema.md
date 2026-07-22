---
title: "FieldSchema | Java | v2"
slug: /java/java/v2-Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FieldSchema インスタンスは、コレクション内の特定のフィールドのデータ型と関連属性を定義します。 | Java | v2"
type: docx
token: ZwKPdk2rzoQUU7xm4CHcPiZqnjh
sidebar_position: 16
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - FieldSchema
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FieldSchema

**FieldSchema** インスタンスは、コレクション内の特定のフィールドのデータ型と関連属性を定義します。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.FieldSchema
```

## Constructor\{#constructor}

フィールド名、データ型、およびその他のパラメータを定義して、フィールドのスキーマを構築します。

```java
CreateCollectionReq.FieldSchema.builder()
    .name(String name)
    .description(String description)
    .dataType(DataType dataType)
    .maxLength(Integer maxLength)
    .dimension(Integer dimension)
    .isPrimaryKey(Boolean isPrimaryKey)
    .isPartitionKey(Boolean isPartitionKey)
    .isClusteringKey(Boolean isClusteringKey)
    .autoID(Boolean autoID)
    .isNullable(Boolean isNullable)
    .defaultValue(Object defaultValue)
    .enableAnalyzer(Boolean enableAnalyzer)
    .analyzerParams(Map<String, Object> analyzerParams)
    .enableMatch(Boolean enableMatch)
    .typeParams(Map<String, String> typeParams)
    .multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)
    .externalField(String externalField)
    .build();
```

**BUILDER METHODS:**

- `name(String name)` -

    フィールドの名前。

- `description(String description)` -

    フィールドの説明。

- `dataType(DataType dataType)` -

    フィールドのデータ型。各フィールドに対してデータ型を選択する際は、以下のオプションから選択できます: プライマリキーフィールド — **DataType.Int64** または **DataType.VarChar** を使用; スカラーフィールド — **DataType.Bool**、**DataType.Int8**、**DataType.Int16**、**DataType.Int32**、**DataType.Int64**、**DataType.Float**、**DataType.Double**、**DataType.VarChar**、**DataType.JSON**、または **DataType.Array** から選択; ベクトルフィールド — **DataType.BinaryVector** または **DataType.FloatVector** を選択。

- `maxLength(Integer maxLength)` -

    値に含めることができる最大文字数。これは、このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.VarChar** に設定されている場合に必須です。

- `dimension(Integer dimension)` -

    値が持つべき次元数。これは、このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.FloatVector** に設定されている場合に必須です。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    現在のフィールドがプライマリフィールドであるかどうか。これを **True** に設定すると、現在のフィールドがプライマリフィールドになります。

- `isPartitionKey(Boolean isPartitionKey)` -

    現在のフィールドがパーティションキーフィールドであるかどうか。これを **True** に設定すると、現在のフィールドがパーティションキーになります。

- `isClusteringKey(Boolean isClusteringKey)` -

    現在のフィールドがクラスタリングキーであるかどうか。クラスタリングキーは、ディスク上のセグメントのグループ化を制御し、このフィールドでフィルタするクエリを高速化します。

- `autoID(Boolean autoID)` -

    プライマリフィールドの自動インクリメントを許可するかどうか。これを **True** に設定すると、プライマリフィールドは自動インクリメントされます。この場合、エラーを避けるために、挿入するデータにはプライマリフィールドを含めないでください。このパラメータは、**isPrimaryKey** が **True** に設定されているフィールドで設定してください。

- `elementType(DataType elementType)` -

    配列フィールド内の要素のデータ型。これは、このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.Array** に設定されている場合に必須です。 

- `maxCapacity(Integer maxCapacity)` -

    配列フィールドに含めることができる要素の最大数。これは、このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.Array** に設定されている場合に必須です。 

- `isNullable(Boolean isNullable)` -

    このフィールドで `null` 値を許可します。デフォルト: `false`。詳細については、Nullable & Default を参照してください。

- `defaultValue(Object defaultValue)` -

    insert にフィールドが含まれていない場合に使用されるフィールドのデフォルト値を設定します。ランタイム型は `dataType` と一致する必要があります。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    指定した `VARCHAR` フィールドに対してテキスト解析を有効にするかどうか。`true` に設定すると、Milvus はこのフィールドのテキスト内容をトークン化およびフィルタリングするテキストアナライザーを使用します。全文検索に必須です。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    `DataType.VarChar` フィールド用のフィールドごとのアナライザー設定（tokenizer、filters）。`enableAnalyzer` と組み合わせて使用します。

- `enableMatch(Boolean enableMatch)` -

    指定した `VARCHAR` フィールドに対してキーワードマッチを有効にするかどうか。`true` の場合、Milvus はこのフィールド用の転置インデックスを作成し、高速かつ効率的なキーワード検索を可能にします。`enableMatch` は `enableAnalyzer` と連携して、構造化された用語ベースのテキスト検索を提供します。

- `typeParams(Map<String, String> typeParams)` -

    専用の builder method として公開されていない、型ごとの汎用パラメータ。一度指定すると、ここでの値が上で設定した対応するパラメータ値を上書きします。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    複数のアナライザーをテキストフィールドに設定し、このテキストフィールドに多言語ドキュメントを保存できるようにする多言語アナライザー。

- `externalField(String externalField)` -

    この Milvus フィールドを、スキーマの `externalSource` で識別される外部ソース内の列にマッピングします。外部コレクションで使用されます。

**RETURN TYPE:**

*FieldSchema*

**RETURNS:**

**FieldSchema** オブジェクト。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## Example\{#example}

```java
// define a id field with autoID set to false
CreateCollectionReq.FieldSchema fieldSchema = CreateCollectionReq.FieldSchema.builder()
        .name("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .autoID(Boolean.FALSE)
        .build();
```
