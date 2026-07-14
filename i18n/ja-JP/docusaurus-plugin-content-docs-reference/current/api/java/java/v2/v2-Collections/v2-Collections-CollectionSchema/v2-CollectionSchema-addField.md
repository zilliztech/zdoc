---
title: "addField() | Java | v2"
slug: /java/java/v2-CollectionSchema-addField
sidebar_label: "addField()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスキーマにフィールドを追加します。 | Java | v2"
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

この操作は、コレクションのスキーマにフィールドを追加します。

```java
public void addField(AddFieldReq addFieldReq)
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `fieldName(String fieldName)` -

    フィールドの名前です。

- `description(String description)` -

    フィールドの説明です。

- `dataType(DataType dataType)` -

    フィールドのデータ型です。

    異なるフィールドのデータ型を選択する際には、次のオプションから選択できます。

- `maxLength(Integer maxLength)` -

    値に含めることができる最大文字数です。

    このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.VarChar** に設定されている場合は必須です。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    現在のフィールドがプライマリフィールドであるかどうかを指定します。

    これを **True** に設定すると、現在のフィールドがプライマリフィールドになります。

- `isPartitionKey(Boolean isPartitionKey)` -

    現在のフィールドがパーティションキーフィールドであるかどうかを指定します。

    これを **True** に設定すると、現在のフィールドがパーティションキーになります。

- `autoID(Boolean autoID)` -

    プライマリフィールドの自動インクリメントを許可するかどうかを指定します。

    これを **True** に設定すると、プライマリフィールドは自動インクリメントされます。この場合、エラーを避けるため、挿入するデータにプライマリフィールドを含めるべきではありません。

    このパラメータは、**isPrimaryKey** が **True** に設定されたフィールドで設定してください。

- `dimension(int dimension)` -

    ベクトルフィールドの次元数です。値は 1 より大きくする必要があり、通常は使用中の埋め込みモデルによって決まります。

    このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.FloatVector** に設定されている場合は必須です。

- `elementType(DataType elementType)` -

    配列フィールド内の要素のデータ型です。

    このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.Array** に設定されている場合は必須です。

- `maxCapacity(Integer maxCapacity)` -

    配列フィールドに含めることができる要素の最大数です。

    このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.Array** に設定されている場合は必須です。

- `isNullable(Boolean isNullable)` -

    フィールドが null 値を受け入れられるかどうかを指定する Boolean パラメータです。

    詳細については、Nullable & Default を参照してください。

- `defaultValue(DataType dataType)` -

    コレクションスキーマの作成時に、特定のフィールドにデフォルト値を設定します。これは、データ挿入時に値が明示的に指定されない場合でも、特定のフィールドに初期値を持たせたいときに特に便利です。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    指定した `VARCHAR` フィールドに対してテキスト解析を有効にするかどうかを指定します。`true` に設定すると、Milvus はテキストアナライザーを使用し、フィールドのテキスト内容をトークン化してフィルタリングします。

- `enableMatch(Boolean enableMatch)` -

    指定した `VARCHAR` フィールドに対してキーワードマッチングを有効にするかどうかを指定します。`true` に設定すると、Milvus はそのフィールドに反転インデックスを作成し、高速かつ効率的なキーワード検索を可能にします。`enableMatch` は `enableAnalyzer` と組み合わせて動作し、構造化された用語ベースのテキスト検索を提供します。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    テキスト処理用のアナライザーを設定します。特に `DataType.VarChar` フィールド向けです。このパラメータは、トークナイザーおよびフィルター設定を構成し、特にキーワードマッチングや全文検索に使用されるテキストフィールド向けです。

- `typeParams(Map<String, String> typeParams)` -

    追加する現在のフィールドのデータ型に固有のパラメータです。たとえば、`VarChar` フィールドに `maxLength` を設定できます。指定すると、上記で指定した対応するパラメータ値を上書きします。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    複数言語アナライザーであり、テキストフィールドに対して複数のアナライザーを設定し、このテキストフィールドに多言語ドキュメントを保存できます。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -

    Array of Structs フィールド内のフィールドのリストです。

    このフィールドの **[dataType](./v2-Collections-DataType)** が **DataType.Array** に設定され、かつこのフィールドの **elementType** が **DataType.Struct** に設定されている場合は必須です。

- `externalField(String externalField)` -

    この Milvus フィールドがマッピングする外部フィールドの名前です。`CollectionSchema` 上の `externalSource` および `externalSpec` と一緒に使用して、外部データソースをバックエンドに持つコレクションを宣言します。更新時に、その外部フィールドの値がこの Milvus フィールドに取り込まれます。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
// add two fields, id and vector
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(128).build());
```
