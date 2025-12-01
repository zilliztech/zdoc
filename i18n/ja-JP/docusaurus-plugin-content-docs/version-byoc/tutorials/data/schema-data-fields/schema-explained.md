---
title: "スキーマの説明 | BYOC"
slug: /schema-explained
sidebar_label: "スキーマの説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマの設計を練る必要があります。このページでは、コレクションスキーマを理解し、独自の例となるスキーマを設計するのに役立ちます。 | BYOC"
type: origin
token: Vs4YwNnvzitoQ8kunlGcWMJInbf
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema explained
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマの説明

スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマの設計を練る必要があります。このページでは、コレクションスキーマを理解し、独自の例となるスキーマを設計するのに役立ちます。

## 概要\{#overview}

Zilliz Cloud上では、コレクションスキーマはリレーショナルデータベースのテーブルに相当し、Zilliz Cloudがコレクション内のデータをどのように構成するかを定義します。

設計の優れたスキーマは、データモデルを抽象化し、検索によってビジネス目標を達成できるかどうかを決定するため、非常に重要です。さらに、コレクションに挿入されるすべてのデータ行はスキーマに従わなければならないため、データの一貫性と長期的な品質を維持するのに役立ちます。技術的な観点から言えば、明確に定義されたスキーマは、整理されたカラムデータストレージとクリーンなインデックス構造を実現し、検索パフォーマンスを向上させます。

コレクションスキーマには、主キー、少なくとも1つのベクトルフィールド、およびいくつかのスカラーフィールドがあります。次の図は、記事をスキーマフィールドのリストにマッピングする方法を示しています。

![RoJFbyTsuoY8mHxoBBicgBH9nTc](/img/RoJFbyTsuoY8mHxoBBicgBH9nTc.png)

検索システムのデータモデル設計には、ビジネスニーズの分析と、情報をスキーマで表現されたデータモデルに抽象化することが含まれます。たとえば、あるテキストを検索するには、リテラル文字列を「埋め込み（embedding）」によってベクトルに変換し、ベクトル検索を有効にするために「インデックス化」する必要があります。この基本的な要件に加えて、公開タイムスタンプや著者などの他のプロパティを保存する必要がある場合があります。このメタデータにより、特定の日付より後に公開されたテキストや特定の著者のテキストのみを返すよう、セマンティック検索を絞り込むことができます。アプリケーションで検索結果をレンダリングするために、これらのスカラー値をメインテキストとともに取得することもできます。これらテキストの断片を整理するために、それぞれに整数または文字列で一意の識別子を割り当てる必要があります。これらの要素は、洗練された検索ロジックを実現するために不可欠です。

設計の良いスキーマの作成方法については、[スキーマ設計ハンズオン](./schema-design-hands-on)を参照してください。

## スキーマの作成\{#create-schema}

以下のコードスニペットは、スキーマの作成方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = client.createSchema();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const schema = []
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/entity"

schema := entity.NewSchema()
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
    "fields": []
}'
```

</TabItem>
</Tabs>

## 主フィールドの追加\{#add-primary-field}

コレクション内の主フィールドは、エンティティを一意に識別します。**Int64** または **VarChar** 値のみを受け入れます。以下のコードスニペットは、主フィールドの追加方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_id",
    datatype=DataType.INT64,
    # highlight-start
    is_primary=True,
    auto_id=False,
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;

schema.addField(AddFieldReq.builder()
        .fieldName("my_id")
        .dataType(DataType.Int64)
        // highlight-start
        .isPrimaryKey(true)
        .autoID(false)
        // highlight-end
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_id",
    data_type: DataType.Int64,
    // highlight-start
    is_primary_key: true,
    autoID: false
    // highlight-end
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_id").
    WithDataType(entity.FieldTypeInt64).
    // highlight-start
    WithIsPrimaryKey(true).
    WithIsAutoID(false),
    // highlight-end
)
```

</TabItem>

<TabItem value='bash'>

```bash
export primaryField='{
    "fieldName": "my_id",
    "dataType": "Int64",
    "isPrimary": true
}'

export schema='{
    \"autoID\": false,
    \"fields\": [
        $primaryField
    ]
}'
```

</TabItem>
</Tabs>

フィールドを追加する際、`is_primary`プロパティを`True`に設定することで、そのフィールドを主フィールドとして明示的に指定できます。主フィールドはデフォルトで**Int64**値を受け入れます。この場合、主フィールドの値は`12345`のような整数である必要があります。主フィールドで**VarChar**値を使用する場合は、値は`my_entity_1234`のような文字列である必要があります。

また、`autoId`プロパティを`True`に設定して、Zilliz Cloudがデータ挿入時に主フィールド値を自動的に割り当てるようにすることもできます。

詳細については、[プライマリフィールド & AutoId](./primary-field-auto-id)を参照してください。

## ベクトルフィールドの追加\{#add-vector-fields}

ベクトルフィールドは、さまざまなスパースおよびデンスベクトル埋め込みを受け入れます。Zilliz Cloudでは、コレクションに4つのベクトルフィールドを追加できます。以下のコードスニペットは、ベクトルフィールドの追加方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_vector",
    datatype=DataType.FLOAT_VECTOR,
    # highlight-next-line
    dim=5
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_vector")
        .dataType(DataType.FloatVector)
        // highlight-next-line
        .dimension(5)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_vector",
    data_type: DataType.FloatVector,
    // highlight-next-line
    dim: 5
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_vector").
    WithDataType(entity.FieldTypeFloatVector).
    // highlight-next-line
    WithDim(5),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export vectorField='{
    "fieldName": "my_vector",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 5
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

上記のコードスニペットの`dim`パラメータは、ベクトルフィールドに保持されるベクトル埋め込みの次元数を示します。`FLOAT_VECTOR`値は、ベクトルフィールドが32ビット浮動小数点数のリストを保持することを示し、通常は逆対数を表すために使用されます。それに加えて、Zilliz Cloudは以下のタイプのベクトル埋め込みもサポートしています：

- `FLOAT16_VECTOR`

    このタイプのベクトルフィールドは、16ビット半精度浮動小数点数のリストを保持し、通常はメモリまたは帯域幅に制限のあるディープラーニングまたはGPUベースのコンピューティングシナリオに適用されます。

- `BFLOAT16_VECTOR`

    このタイプのベクトルフィールドは、Float32と同じ指数範囲を持ちながら精度が低下した16ビット浮動小数点数のリストを保持します。このタイプのデータはディープラーニングシナリオで一般的に使用され、精度に大きく影響を与えずにメモリ使用量を削減できます。

- `BINARY_VECTOR`

    このタイプのベクトルフィールドは、0と1のリストを保持します。画像処理および情報検索シナリオでデータを表すためのコンパクトな特徴として機能します。

- `SPARSE_FLOAT_VECTOR`

    このタイプのベクトルフィールドは、非ゼロの数値とそのシーケンス番号のリストを保持し、スパースベクトル埋め込みを表します。

## スカラーフィールドの追加\{#add-scalar-fields}

一般的なケースでは、スカラーフィールドを使用してZilliz Cloudクラスターに保存されたベクトル埋め込みのメタデータを保存し、メタデータフィルタリングを使用してANN検索を実行して、検索結果の正確性を向上させることができます。Zilliz Cloudは、**VarChar**、**Boolean**、**Int**、**Float**、および**Double**を含む複数のスカラーフィールドタイプをサポートしています。

### 文字列フィールドの追加\{#add-string-fields}

Zilliz Cloudクラスターでは、VarCharフィールドを使用して文字列を保存できます。VarCharフィールドの詳細については、[文字列フィールド](./use-string-field)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_varchar",
    datatype=DataType.VARCHAR,
    # highlight-next-line
    max_length=512
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_varchar")
        .dataType(DataType.VarChar)
        // highlight-next-line
        .maxLength(512)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_varchar",
    data_type: DataType.VarChar,
    // highlight-next-line
    max_length: 512
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_varchar").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(512),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export varCharField='{
    "fieldName": "my_varchar",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 512
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField
    ]
}"
```

</TabItem>
</Tabs>

### 数値フィールドの追加\{#add-number-fields}

Zilliz Cloudがサポートする数値型は、`Int8`、`Int16`、`Int32`、`Int64`、`Float`、および`Double` です。数値フィールドの詳細については、[数値フィールド](./use-number-field)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_int64",
    datatype=DataType.INT64,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_int64")
        .dataType(DataType.Int64)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_int64",
    data_type: DataType.Int64,
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_int64").
    WithDataType(entity.FieldTypeInt64),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export int64Field='{
    "fieldName": "my_int64",
    "dataType": "Int64"
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $int64Field
    ]
}"
```

</TabItem>
</Tabs>

### 真偽値フィールドの追加\{#add-boolean-fields}

Zilliz Cloudは真偽値フィールドをサポートしています。以下のコードスニペットは、真偽値フィールドの追加方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_bool",
    datatype=DataType.BOOL,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_bool")
        .dataType(DataType.Bool)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_bool",
    data_type: DataType.Boolean,
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_bool").
    WithDataType(entity.FieldTypeBool),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export boolField='{
    "fieldName": "my_bool",
    "dataType": "Boolean"
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $int64Field,
        $boolField
    ]
}"
```

</TabItem>
</Tabs>

## 複合フィールドの追加\{#add-composite-fields}

Milvusでは、複合フィールドはJSONフィールドのキーまたはArrayフィールドのインデックスのように、より小さなサブフィールドに分割できるフィールドです。

### JSONフィールドの追加\{#add-json-fields}

JSONフィールドは通常、半構造化されたJSONデータを格納します。JSONフィールドの詳細については、[JSONフィールド](./use-json-fields)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_json",
    datatype=DataType.JSON,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_json")
        .dataType(DataType.JSON)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_json",
    data_type: DataType.JSON,
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_json").
    WithDataType(entity.FieldTypeJSON),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export jsonField='{
    "fieldName": "my_json",
    "dataType": "JSON"
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $int64Field,
        $boolField,
        $jsonField
    ]
}"
```

</TabItem>
</Tabs>

### 配列フィールドの追加\{#add-array-fields}

配列フィールドは要素のリストを格納します。配列フィールド内のすべての要素のデータ型は同じである必要があります。配列フィールドの詳細については、[配列フィールド](./use-array-fields)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_array",
    datatype=DataType.ARRAY,
    element_type=DataType.VARCHAR,
    max_capacity=5,
    max_length=512,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("my_array")
        .dataType(DataType.Array)
        .elementType(DataType.VarChar)
        .maxCapacity(5)
        .maxLength(512)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_array",
    data_type: DataType.Array,
    element_type: DataType.VarChar,
    max_capacity: 5,
    max_length: 512
});
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_array").
    WithDataType(entity.FieldTypeArray).
    WithElementType(entity.FieldTypeInt64).
    WithMaxLength(512).
    WithMaxCapacity(5),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export arrayField='{
    "fieldName": "my_array",
    "dataType": "Array",
    "elementDataType": "VarChar",
    "elementTypeParams": {
        "max_length": 512
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $int64Field,
        $boolField,
        $jsonField,
        $arrayField
    ]
}"
```

</TabItem>
</Tabs>