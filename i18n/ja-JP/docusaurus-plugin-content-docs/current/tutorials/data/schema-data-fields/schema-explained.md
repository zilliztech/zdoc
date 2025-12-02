---
title: "スキーマの説明 | Cloud"
slug: /schema-explained
sidebar_label: "スキーマの説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマの設計を行う必要があります。このページでは、コレクションスキーマを理解し、独自の例となるスキーマを設計する方法を説明します。 | Cloud"
type: origin
token: Vs4YwNnvzitoQ8kunlGcWMJInbf
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema explained
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマの説明

スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマの設計を行う必要があります。このページでは、コレクションスキーマを理解し、独自の例となるスキーマを設計する方法を説明します。

## 概要\{#overview}

Zilliz Cloudでは、コレクションスキーマはリレーショナルデータベースのテーブルに相当し、Zilliz Cloudがコレクション内のデータをどのように整理するかを定義します。

設計の優れたスキーマは、データモデルを抽象化し、検索を通じてビジネス目標を達成できるかどうかを決定するため、非常に重要です。さらに、コレクションに挿入されるすべてのデータ行がスキーマに従わなければならないため、データの一貫性と長期的な品質を維持するのに役立ちます。技術的な観点から見ると、定義が明確なスキーマは、整理されたカラムデータストレージとクリーンなインデックス構造に繋がり、検索パフォーマンスを向上させます。

コレクションスキーマには、主キー、少なくとも1つのベクトルフィールド、およびいくつかのスカラーフィールドが含まれます。以下の図は、記事をスキーマフィールドのリストにマッピングする方法を示しています。

![RoJFbyTsuoY8mHxoBBicgBH9nTc](/img/rojfbytsuoy8mhxobbicgbh9ntc.png)

検索システムのデータモデル設計には、ビジネスニーズの分析と情報をスキーマで表現されたデータモデルに抽象化することが含まれます。たとえば、テキストの一部を検索するには、リテラル文字列を「埋め込み」によってベクトルに変換し、ベクトル検索を有効にすることによって「インデックス」されなければなりません。この基本的な要件に加えて、公開タイムスタンプや著者などの他のプロパティを保存することが必要な場合があります。このようなメタデータにより、セマンティック検索をフィルタリングによって洗練させ、特定の日付以降に公開されたテキストや特定の著者によるテキストのみを返すことができます。また、アプリケーションで検索結果を表示する際に、メインタイトルとともにこれらのスカラー値を取得することもできます。さらに、これらのテキスト断片を整理するために、各断片に整数または文字列で表される一意の識別子を割り当てる必要があります。これらの要素は、高度な検索ロジックを実現するために不可欠です。

設計の優れたスキーマの作成方法については、[スキーマ設計の実践](./schema-design-hands-on)を参照してください。

## スキーマの作成\{#create-schema}

以下のコードスニペットは、スキーマを作成する方法を示しています。

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

コレクション内の主フィールドは、エンティティを一意に識別します。これは **Int64** または **VarChar** 値のみを受け入れます。以下のコードスニペットは、主フィールドを追加する方法を示しています。

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

フィールドを追加する際に、`is_primary` プロパティを `True` に設定することで、明示的に主フィールドであることを明確にすることができます。主フィールドはデフォルトで **Int64** 値を受け入れます。この場合、主フィールド値は `12345` のような整数である必要があります。主フィールドで **VarChar** 値を使用する場合、値は `my_entity_1234` のような文字列である必要があります。

`autoId` プロパティを `True` に設定して、Zilliz Cloud がデータ挿入時に主フィールド値を自動的に割り当てるようにすることもできます。

詳細については、[主フィールド & AutoId](./primary-field-auto-id) を参照してください。

## ベクトルフィールドの追加\{#add-vector-fields}

ベクトルフィールドは、さまざまなスパース・デンスベクトル埋め込みを受け入れます。Zilliz Cloudでは、コレクションに4つのベクトルフィールドを追加できます。以下のコードスニペットは、ベクトルフィールドを追加する方法を示しています。

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

上記のコードスニペットの `dim` パラメータは、ベクトルフィールドで保持されるベクトル埋め込みの次元を示します。`FLOAT_VECTOR` 値は、ベクトルフィールドが32ビット浮動小数点数のリストを保持することを示し、通常は対数の逆数を表すために使用されます。これに加えて、Zilliz Cloudは以下のベクトル埋め込み型もサポートしています：

- `FLOAT16_VECTOR`

    このタイプのベクトルフィールドは、16ビット半精度浮動小数点数のリストを保持し、メモリや帯域幅に制限のあるディープラーニングやGPUベースのコンピューティングのシナリオに一般的に適用されます。

- `BFLOAT16_VECTOR`

    このタイプのベクトルフィールドは、Float32と同じ指数範囲を持つが精度が低下した16ビット浮動小数点数のリストを保持します。この型のデータはディープラーニングのシナリオで一般的に使用され、精度に大きな影響を与えることなくメモリ使用量を削減します。

- `BINARY_VECTOR`

    このタイプのベクトルフィールドは、0と1のリストを保持します。画像処理および情報検索のシナリオでデータを表すためのコンパクトな特徴として機能します。

- `SPARSE_FLOAT_VECTOR`

    このタイプのベクトルフィールドは、非ゼロの数値とそのシーケンス番号のリストを保持し、スパースベクトル埋め込みを表します。

## スカラーフィールドの追加\{#add-scalar-fields}

一般的なケースでは、スカラーフィールドを使用して、Zilliz Cloudクラスターに保存されたベクトル埋め込みのメタデータを保存し、メタデータフィルタリングでANN検索を実行することで、検索結果の正確性を向上させることができます。Zilliz Cloudは、**VarChar**、**Boolean**、**Int**、**Float**、および **Double** など、複数のスカラーフィールド型をサポートしています。

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

Zilliz Cloudがサポートする数値型は、`Int8`、`Int16`、`Int32`、`Int64`、`Float`、および `Double` です。数値フィールドの詳細については、[数値フィールド](./use-number-field)を参照してください。

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

Zilliz Cloudは真偽値フィールドをサポートしています。以下のコードスニペットは、真偽値フィールドを追加する方法を示しています。

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

Milvusでは、複合フィールドはJSONフィールドのキーまたはArrayフィールドのインデックスなど、より小さなサブフィールドに分割できるフィールドです。

### JSONフィールドの追加\{#add-json-fields}

JSONフィールドは通常、半構造化されたJSONデータを保存します。JSONフィールドの詳細については、[JSONフィールド](./use-json-fields)を参照してください。

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

配列フィールドは、要素のリストを保存します。配列フィールド内のすべての要素のデータ型は同じである必要があります。配列フィールドの詳細については、[配列フィールド](./use-array-fields)を参照してください。

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