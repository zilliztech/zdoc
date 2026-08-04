---
title: "FieldSchema | Java | v2"
slug: /java/java/v2-Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FieldSchema インスタンスは、collection 内の特定のフィールドのデータ型および関連属性を定義します。 | Java | v2"
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

**FieldSchema** インスタンスは、collection 内の特定のフィールドのデータ型および関連属性を定義します。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.FieldSchema
```

## Constructor\{#constructor}

フィールド名、データ型、その他のパラメータを定義して、フィールドのスキーマを構築します。

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

    フィールドの名前です。

- `description(String description)` -

    フィールドの説明です。

- `dataType(DataType dataType)` -

    フィールドのデータ型です。各フィールドのデータ型を選択する際には、次のオプションから選べます。主キー フィールド — **DataType.Int64** または **DataType.VarChar** を使用します。scalar フィールド — **DataType.Bool**、**DataType.Int8**、**DataType.Int16**、**DataType.Int32**、**DataType.Int64**、**DataType.Float**、**DataType.Double**、**DataType.VarChar**、**DataType.JSON**、または **DataType.Array** から選択します。vector フィールド — **DataType.BinaryVector** または **DataType.FloatVector** を選択します。

- `maxLength(Integer maxLength)` -

    値に含めることができる最大文字数です。このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.VarChar** に設定されている場合に必須です。

- `dimension(Integer dimension)` -

    値が持つべき次元数です。このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.FloatVector** に設定されている場合に必須です。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    現在のフィールドが主フィールドかどうかを示します。これを **True** に設定すると、現在のフィールドが主フィールドになります。

- `isPartitionKey(Boolean isPartitionKey)` -

    現在のフィールドが partition-key フィールドかどうかを示します。これを **True** に設定すると、現在のフィールドが partition key になります。

- `isClusteringKey(Boolean isClusteringKey)` -

    現在のフィールドが clustering key かどうかを示します。clustering key は、ディスク上のセグメントのグループ化を制御し、このフィールドでフィルタするクエリを高速化します。

- `autoID(Boolean autoID)` -

    主フィールドの自動インクリメントを許可するかどうかを示します。これを **True** に設定すると、主フィールドは自動インクリメントになります。この場合、エラーを避けるため、挿入するデータに主フィールドを含めてはいけません。このパラメータは、**isPrimaryKey** が **True** に設定されているフィールドで設定してください。

- `elementType(DataType elementType)` -

    array フィールド内の要素のデータ型です。このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.Array** に設定されている場合に必須です。 

- `maxCapacity(Integer maxCapacity)` -

    array フィールドに含めることができる要素の最大数です。このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.Array** に設定されている場合に必須です。 

- `isNullable(Boolean isNullable)` -

    このフィールドで `null` 値を許可します。デフォルト: `false`。詳細については、Nullable & Default を参照してください。

- `defaultValue(Object defaultValue)` -

    挿入時にフィールドが存在しない場合に使用されるデフォルト値を設定します。ランタイム型は `dataType` と一致している必要があります。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    指定した `VARCHAR` フィールドに対してテキスト解析を有効にするかどうかを示します。`true` に設定すると、Milvus はフィールドのテキスト内容をトークン化してフィルタリングするテキスト analyzer を使用します。フルテキスト検索に必須です。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    `DataType.VarChar` フィールドに対するフィールド単位の analyzer 設定（tokenizer、filters）です。`enableAnalyzer` と組み合わせて使用します。

- `enableMatch(Boolean enableMatch)` -

    指定した `VARCHAR` フィールドに対してキーワードマッチングを有効にするかどうかを示します。`true` の場合、Milvus はそのフィールドに対して inverted index を作成し、高速かつ効率的なキーワード検索を可能にします。`enableMatch` は `enableAnalyzer` と連携して動作し、構造化された用語ベースのテキスト検索を提供します。

- `typeParams(Map<String, String> typeParams)` -

    専用の builder メソッドとして公開されていない汎用的な型ごとのパラメータです。指定すると、ここでの値が上で設定した対応するパラメータ値を上書きします。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    複数の analyzer をテキスト フィールドに設定し、そのテキスト フィールドに多言語ドキュメントを保存できるようにする多言語 analyzer です。

- `externalField(String externalField)` -

    この Milvus フィールドを、スキーマの `externalSource` で識別される外部ソース内のカラムにマッピングします。外部 collection に使用されます。

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
