---
title: "addField() | Java | v2"
slug: /java/java/v2-CollectionSchema-addField
sidebar_label: "addField()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、コレクションのスキーマにフィールドを追加します。 | Java | v2"
type: docx
token: XB9idvIRPo2fEix50dvcAsQHnCg
sidebar_position: 1
keywords: 
  - 画像検索
  - LLM
  - 機械学習
  - RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - addField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addField()

この操作では、コレクションのスキーマにフィールドを追加します。

```java
public void addField(AddFieldReq addFieldReq)
```

## リクエスト構文\{#request-syntax}

```java
CollectionSchema.addField(AddFieldReq.builder()
    .fieldName(String fieldName)
    .description(String description)
    .dataType(DataType dataType)
    .maxLength(Integer maxLength)
    .isPrimaryKey(Boolean isPrimaryKey)
    .isPartitionKey(Boolean isPartitionKey)
    .autoID(Boolean autoID)
    .dimension(int dimension)
    .elementType(DataType elementType)
    .maxCapacity(Integer maxCapacity)
    .isNullable(Boolean isNullable)
    .defaultValue(DataType dataType)
    .enableAnalyzer(Boolean enableAnalyzer)
    .enableMatch(Boolean enableMatch)
    .analyzerParams(Map<String, Object> analyzerParams)
    .typeParams(Map<String, String> typeParams)
    .multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)
    .structFields(List<CreateCollectionReq.FieldSchema> structFields)
    .externalField(String externalField)
    .build()
)
```

**ビルダーメソッド：**

- `fieldName(String fieldName)` -

    フィールドの名前です。

- `description(String description)` -

    フィールドの説明です。

- `dataType(DataType dataType)` -

    フィールドのデータ型です。

    異なるフィールドのデータ型を選択するときは、次のオプションから選択できます。

- `maxLength(Integer maxLength)` -

    値に含めることができる最大文字数です。

    このフィールドの **dataType** が **DataType.VarChar** に設定されている場合、必須です。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    現在のフィールドがプライマリフィールドであるかどうかです。

    これを **True** に設定すると、現在のフィールドがプライマリフィールドになります。

- `isPartitionKey(Boolean isPartitionKey)` -

    現在のフィールドが partitionKey フィールドであるかどうかです。

    これを **True** に設定すると、現在のフィールドがパーティションキーになります。

- `autoID(Boolean autoID)` -

    プライマリフィールドの自動インクリメントを許可するかどうかです。

    これを **True** に設定すると、プライマリフィールドが自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータにプライマリフィールドを含めないでください。

    このパラメーターは、**isPrimaryKey** が **True** に設定されたフィールドで設定します。

- `dimension(int dimension)` -

    ベクトルフィールドの次元数です。値は 1 より大きい必要があり、通常は使用中の埋め込みモデルによって決まります。

    このフィールドの **dataType** が **DataType.FloatVector** に設定されている場合、必須です。

- `elementType(DataType elementType)` -

    配列フィールド内の要素のデータ型です。

    このフィールドの **dataType** が **DataType.Array** に設定されている場合、必須です。

- `maxCapacity(Integer maxCapacity)` -

    配列フィールドに含めることができる要素の最大数です。

    このフィールドの **dataType** が **DataType.Array** に設定されている場合、必須です。

- `isNullable(Boolean isNullable)` -

    フィールドが null 値を受け入れられるかどうかを指定する Boolean パラメーターです。

    詳細については、Nullable & Default を参照してください。

- `defaultValue(DataType dataType)` -

    作成時に、コレクションスキーマ内の特定のフィールドにデフォルト値を設定します。これは、データ挿入時に値を明示的に指定しなくても、特定のフィールドに初期値を持たせたい場合に特に便利です。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    指定された `VARCHAR` フィールドのテキスト分析を有効にするかどうかです。`true` に設定すると、Milvus にテキストアナライザーを使用するよう指示し、フィールドのテキストコンテンツをトークン化してフィルタリングします。

- `enableMatch(Boolean enableMatch)` -

    指定された `VARCHAR` フィールドのキーワードマッチングを有効にするかどうかです。`true` に設定すると、Milvus はフィールドの転置インデックスを作成し、高速で効率的なキーワード検索を可能にします。`enableMatch` は `enableAnalyzer` と連携して、用語ベースの構造化テキスト検索を提供します。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    テキスト処理用のアナライザーを構成します。特に `DataType.VarChar` フィールドを対象とします。このパラメーターは、トークナイザーとフィルターの設定を構成します。特に、キーワードマッチングまたは全文検索で使用されるテキストフィールドが対象です。

- `typeParams(Map<String, String> typeParams)` -

    追加する現在のフィールドのデータ型に固有のパラメーターです。たとえば、`VarChar` フィールドに `maxLength` を設定できます。指定すると、上で指定した対応するパラメーター値が上書きされます。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    テキストフィールドに複数のアナライザーを構成し、多言語ドキュメントをこのテキストフィールドに保存できるようにする多言語アナライザーです。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -

    Array of Structs フィールド内のフィールドのリストです。

    このフィールドの **dataType** が **DataType.Array** で、**elementType** が **DataType.Struct** に設定されている場合、必須です。

- `externalField(String externalField)` -

    この Milvus フィールドのマップ先となる外部フィールドの名前です。外部データソースを基盤とするコレクションを宣言するために、`CollectionSchema` の `externalSource` および `externalSpec` と組み合わせて使用します。リフレッシュ時に、外部フィールドの値がこの Milvus フィールドに取り込まれます。

**例外：**

- **MilvusClientException**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
// add two fields, id and vector
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(128).build());
```
