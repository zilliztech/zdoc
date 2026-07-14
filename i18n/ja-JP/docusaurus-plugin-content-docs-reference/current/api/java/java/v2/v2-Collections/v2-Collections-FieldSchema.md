---
title: "FieldSchema | Java | v2"
slug: /java/java/v2-Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FieldSchema インスタンスは、collection 内の特定の field のデータ型および関連属性を定義します。 | Java | v2"
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

**FieldSchema** インスタンスは、collection 内の特定の field のデータ型および関連属性を定義します。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.FieldSchema
```

## Constructor\{#constructor}

field 名、データ型、その他のパラメータを定義して、field の schema を構築します。

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

    field の名前です。

- `description(String description)` -

    field の説明です。

- `dataType(DataType dataType)` -

    field のデータ型です。異なる field のデータ型を選択する際は、次のオプションから選べます: primary key field — **DataType.Int64** または **DataType.VarChar** を使用します。scalar fields — **DataType.Bool**、**DataType.Int8**、**DataType.Int16**、**DataType.Int32**、**DataType.Int64**、**DataType.Float**、**DataType.Double**、**DataType.VarChar**、**DataType.JSON**、または **DataType.Array** から選択します。vector fields — **DataType.BinaryVector** または **DataType.FloatVector** を選択します。

- `maxLength(Integer maxLength)` -

    値に含めることができる最大文字数です。この field の **[dataType](./v2-Collections-DataType)** が **DataType.VarChar** に設定されている場合は必須です。

- `dimension(Integer dimension)` -

    値が持つべき次元数です。この field の **[dataType](./v2-Collections-DataType)** が **DataType.FloatVector** に設定されている場合は必須です。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    現在の field が primary field かどうかを示します。これを **True** に設定すると、現在の field が primary field になります。

- `isPartitionKey(Boolean isPartitionKey)` -

    現在の field が partition-key field かどうかを示します。これを **True** に設定すると、現在の field が partition key になります。

- `isClusteringKey(Boolean isClusteringKey)` -

    現在の field が clustering key かどうかを示します。clustering key は、ディスク上の segment グループ化を制御し、この field でフィルタするクエリを高速化します。

- `autoID(Boolean autoID)` -

    primary field の自動インクリメントを許可するかどうかを示します。これを **True** に設定すると、primary field は自動的にインクリメントされます。この場合、エラーを避けるために挿入するデータに primary field を含めてはいけません。このパラメータは、**isPrimaryKey** が **True** に設定されている field に設定してください。

- `elementType(DataType elementType)` -

    array field 内の要素のデータ型です。この field の **[dataType](./v2-Collections-DataType)** が **DataType.Array** に設定されている場合は必須です。 

- `maxCapacity(Integer maxCapacity)` -

    array field に含めることができる要素の最大数です。この field の **[dataType](./v2-Collections-DataType)** が **DataType.Array** に設定されている場合は必須です。 

- `isNullable(Boolean isNullable)` -

    この field に `null` 値を許可します。デフォルト: `false`。詳細は Nullable & Default を参照してください。

- `defaultValue(Object defaultValue)` -

    挿入時に field が存在しない場合に使用される field のデフォルト値を設定します。実行時の型は `dataType` と一致している必要があります。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    指定した `VARCHAR` field に対してテキスト解析を有効にするかどうかを示します。`true` に設定すると、Milvus は field のテキスト内容をトークン化およびフィルタリングするテキスト analyzer を使用します。フルテキスト検索には必須です。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    `DataType.VarChar` field 用の field ごとの analyzer 設定（tokenizer、filters）です。`enableAnalyzer` と組み合わせて使用します。

- `enableMatch(Boolean enableMatch)` -

    指定した `VARCHAR` field に対してキーワードマッチングを有効にするかどうかを示します。`true` の場合、Milvus はその field に inverted index を作成し、高速で効率的なキーワード検索を可能にします。`enableMatch` は `enableAnalyzer` と連携して、構造化された用語ベースのテキスト検索を提供します。

- `typeParams(Map<String, String> typeParams)` -

    専用の builder method として公開されていない、型ごとの汎用パラメータです。指定すると、ここでの値が上で設定した対応するパラメータ値を上書きします。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    複数の analyzer をテキスト field に設定し、そのテキスト field に多言語ドキュメントを保存できる multi-language analyzer です。

- `externalField(String externalField)` -

    この Milvus field を、schema の `externalSource` で識別される外部ソース内の列にマッピングします。external collections で使用されます。

**RETURN TYPE:**

*FieldSchema*

**RETURNS:**

**FieldSchema** オブジェクト。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

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
