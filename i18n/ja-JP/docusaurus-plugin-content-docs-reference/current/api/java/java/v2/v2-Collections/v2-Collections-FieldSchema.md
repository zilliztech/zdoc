---
title: "FieldSchema | Java | v2"
slug: /java/java/v2-Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FieldSchema インスタンスは、コレクション内の特定のフィールドのデータ型および関連属性を定義します。 | Java | v2"
type: docx
token: ZwKPdk2rzoQUU7xm4CHcPiZqnjh
sidebar_position: 33
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

---

import Admonition from '@theme/Admonition';


# FieldSchema

FieldSchema インスタンスは、コレクション内の特定のフィールドのデータ型および関連属性を定義します。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.FieldSchema
```

## コンストラクター\{#constructor}

フィールド名、データ型、その他のパラメーターを定義して、フィールドのスキーマを構築します。

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
    .elementType(DataType elementType)
    .maxCapacity(Integer maxCapacity)
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

**ビルダーメソッド：**

- `name(String name)` -

    フィールドの名前です。

- `description(String description)` -

    フィールドの説明です。

- `dataType(DataType dataType)` -

    フィールドのデータ型です。異なるフィールドのデータ型を選択するときは、次のオプションから選択できます。主キーフィールド — **DataType.Int64** または **DataType.VarChar** を使用します。スカラーフィールド — **DataType.Bool**、**DataType.Int8**、**DataType.Int16**、**DataType.Int32**、**DataType.Int64**、**DataType.Float**、**DataType.Double**、**DataType.VarChar**、**DataType.JSON**、または **DataType.Array** から選択します。ベクトルフィールド — **DataType.BinaryVector** または **DataType.FloatVector** を選択します。

- `maxLength(Integer maxLength)` -

    値に含めることができる最大文字数です。このフィールドの [dataType](./v2-Collections-DataType) が **DataType.VarChar** に設定されている場合、このパラメーターは必須です。

- `dimension(Integer dimension)` -

    値が持つべき次元数です。このフィールドの [dataType](./v2-Collections-DataType) が **DataType.FloatVector** に設定されている場合、このパラメーターは必須です。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    現在のフィールドが主フィールドかどうかを示します。これを **True** に設定すると、現在のフィールドが主フィールドになります。

- `isPartitionKey(Boolean isPartitionKey)` -

    現在のフィールドがパーティションキーフィールドかどうかを示します。これを **True** に設定すると、現在のフィールドがパーティションキーになります。

- `isClusteringKey(Boolean isClusteringKey)` -

    現在のフィールドがクラスタリングキーかどうかを示します。クラスタリングキーは、このフィールドでフィルタリングするクエリを高速化するために、ディスク上のセグメントのグループ化を制御します。

- `autoID(Boolean autoID)` -

    主フィールドの自動インクリメントを許可するかどうかを示します。これを **True** に設定すると、主フィールドが自動インクリメントされます。この場合、エラーを避けるため、挿入するデータに主フィールドを含めないでください。このパラメーターは、**isPrimaryKey** が **True** に設定されているフィールドで設定してください。

- `elementType(DataType elementType)` -

    配列フィールド内の要素のデータ型です。このフィールドの **dataType** が **DataType.Array** に設定されている場合、このパラメーターは必須です。

- `maxCapacity(Integer maxCapacity)` -

    配列フィールドに含めることができる要素の最大数です。このフィールドの **dataType** が **DataType.Array** に設定されている場合、このパラメーターは必須です。

- `isNullable(Boolean isNullable)` -

    このフィールドで `null` 値の使用を許可します。デフォルト：`false`。詳細については、Nullable & Default を参照してください。

- `defaultValue(Object defaultValue)` -

    挿入データにそのフィールドが含まれていない場合に使用する、フィールドのデフォルト値を設定します。ランタイム型は `dataType` と一致する必要があります。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    指定した `VARCHAR` フィールドのテキスト解析を有効にするかどうかを示します。`true` に設定すると、Milvus はフィールドのテキストコンテンツをトークン化してフィルタリングするテキストアナライザーを使用します。フルテキスト検索に必須です。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    `DataType.VarChar` フィールドのフィールド単位のアナライザー設定（トークナイザー、フィルター）です。`enableAnalyzer` と組み合わせて使用します。

- `enableMatch(Boolean enableMatch)` -

    指定した `VARCHAR` フィールドのキーワードマッチングを有効にするかどうかを示します。`true` の場合、Milvus はそのフィールドの転置インデックスを作成し、高速で効率的なキーワード検索を可能にします。`enableMatch` は `enableAnalyzer` と連携して動作し、構造化された用語ベースのテキスト検索を提供します。

- `typeParams(Map<String, String> typeParams)` -

    専用のビルダーメソッドとして公開されていない、型ごとの汎用パラメーターです。指定すると、ここでの値は上で設定した対応するパラメーター値を上書きします。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    テキストフィールドに複数のアナライザーを設定し、そのテキストフィールドに多言語ドキュメントを保存できるようにする多言語アナライザーです。

- `externalField(String externalField)` -

    この Milvus フィールドを、スキーマの `externalSource` で識別される外部ソース内のカラムにマッピングします。外部コレクションに使用されます。

**戻り値の型：**

*FieldSchema*

**戻り値：**

**FieldSchema** オブジェクトです。

**パラメーター：**

- **name** (*String*) -

    フィールドの名前です。

- **description** (*String*) -

    フィールドの説明です。

- **dataType** (*DataType*) -

    フィールドのデータ型です。

- **maxLength** (*Integer*) -

    値に含めることができる最大文字数です。**dataType** が **DataType.VarChar** の場合に必須です。

- **dimension** (*Integer*) -

    値が持つべき次元数です。**dataType** が **DataType.FloatVector** の場合に必須です。

- **isPrimaryKey** (*Boolean*) -

    現在のフィールドが主フィールドかどうかを示します。

- **isPartitionKey** (*Boolean*) -

    現在のフィールドがパーティションキーフィールドかどうかを示します。

- **isClusteringKey** (*Boolean*) -

    現在のフィールドがクラスタリングキーかどうかを示します。

- **autoID** (*Boolean*) -

    主フィールドが自動インクリメントされるかどうかを示します。

- **elementType** (*DataType*) -

    配列フィールド内の要素のデータ型です。**dataType** が **DataType.Array** の場合に必須です。

- **maxCapacity** (*Integer*) -

    配列フィールドに含めることができる要素の最大数です。

- **isNullable** (*Boolean*) -

    フィールドで `null` 値を使用できるかどうかを示します。デフォルト：`false`。

- **defaultValue** (*Object*) -

    挿入データにそのフィールドが含まれていない場合に使用するデフォルト値です。ランタイム型は `dataType` と一致する必要があります。

- **enableAnalyzer** (*Boolean*) -

    指定した `VARCHAR` フィールドのテキスト解析を有効にするかどうかを示します。

- **analyzerParams** (*Map&lt;String, Object&gt;*) -

    `DataType.VarChar` フィールドのフィールド単位のアナライザー設定です。

- **enableMatch** (*Boolean*) -

    指定した `VARCHAR` フィールドのキーワードマッチングを有効にするかどうかを示します。

- **typeParams** (*Map&lt;String, String&gt;*) -

    専用のビルダーメソッドとして公開されていない、型ごとの汎用パラメーターです。

- **multiAnalyzerParams** (*Map&lt;String, Object&gt;*) -

    テキストフィールドの多言語アナライザー設定です。

- **externalField** (*String*) -

    この Milvus フィールドにマッピングされる外部ソースフィールドです。

**例外：**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
// define a id field with autoID set to false
CreateCollectionReq.FieldSchema fieldSchema = CreateCollectionReq.FieldSchema.builder()
        .name("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .autoID(Boolean.FALSE)
        .build();
```
