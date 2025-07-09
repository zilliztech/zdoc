---
title: "スキーマの説明 | BYOC"
slug: /schema-explained
sidebar_label: "スキーマの説明"
beta: FALSE
notebook: FALSE
description: "スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、スキーマの設計を行う必要があります。このページでは、コレクションのスキーマを理解し、独自のスキーマの例を設計するのに役立ちます。 | BYOC"
type: origin
token: Vs4YwNnvzitoQ8kunlGcWMJInbf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema explained
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマの説明

スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、スキーマの設計を行う必要があります。このページでは、コレクションのスキーマを理解し、独自のスキーマの例を設計するのに役立ちます。

## 概要について{#overview}

Zilliz Cloudでは、コレクションスキーマがリレーショナルデータベース内のテーブルを組み立て、Zilliz Cloudがコレクション内のデータをどのように整理するかを定義します。 

よく設計されたスキーマは、データモデルを抽象化し、検索を通じてビジネス目標を達成できるかどうかを決定するために不可欠です。さらに、コレクションに挿入されるすべてのデータ行がスキーマに従う必要があるため、データの一貫性と長期的な品質を維持するのに役立ちます。技術的な観点からは、よく定義されたスキーマは、整理された列データストレージとクリーンなインデックス構造につながり、検索パフォーマンスを向上させます。

コレクションスキーマには、主キー、最大4つのベクトルフィールド、およびいくつかのスカラーフィールドがあります。次の図は、記事をスキーマフィールドのリストにマップする方法を示しています。

![RoJFbyTsuoY8mHxoBBicgBH9nTc](/img/RoJFbyTsuoY8mHxoBBicgBH9nTc.png)

検索システムのデータモデル設計には、ビジネスニーズを分析し、情報をスキーマ表現されたデータモデルに抽象化することが含まれます。例えば、テキストの検索は、リテラル文字列を「埋め込む」ことによってベクトルに変換し、ベクトル検索を有効にすることで「インデックス化」する必要があります。この必須要件を超えて、出版タイムスタンプや著者などの他のプロパティを格納する必要がある場合があります。このメタデータにより、特定の日付以降または特定の著者によって公開されたテキストのみを返すフィルタリングを通じて意味検索を洗練することができます。また、これらのスカラーをメインテキストとともに取得して、アプリケーションで検索結果をレンダリングすることもできます。それぞれに、整数または文字列として表されるこれらのテキストピースを整理するための一意の識別子が割り当てられる必要があります。これらの要素は、洗練された検索ロジックを実現するために不可欠です。

よく設計されたスキーマを作成する方法については、[スキーマデザインハンズオン](./schema-design-hands-on)を参照してください。

## スキーマの作成{#create-schema}

次のコードスニペットは、スキーマを作成する方法を示しています。

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

## プライマリフィールドを追加{#add-primary-field}

コレクション内のプライマリフィールドは、エンティティを一意に識別します。**Int 64**または**VarChar**の値のみを受け入れます。次のコードスニペットは、プライマリフィールドを追加する方法を示しています。

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

フィールドを追加する場合、`is_primary`プロパティを`True`に設定することで、フィールドを明示的にプライマリフィールドとして明確にすることができます。プライマリフィールドはデフォルトで**Int 64**値を受け入れます。この場合、プライマリフィールドの値は`12345`に似た整数である必要があります。プライマリフィールドで**VarChar**値を使用する場合、値は`my_entity_1234`に似た文字列である必要があります。

`autoId`プロパティを`True`に設定することで、Zilliz Cloudがデータ挿入時にプライマリフィールドの値を自動的に割り当てることができます。

詳細については、[プライマリフィールドとAutoId](./primary-field-auto-id)を参照してください。

## ベクトルフィールドを追加{#add-vector-fields}

ベクトル場は、疎なベクトル埋め込みと密なベクトル埋め込みを受け入れます。Zilliz Cloudでは、4つのベクトル場をコレクションに追加できます。以下のコードスニペットは、ベクトル場を追加する方法を示しています。

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

上記のコードスニペットの`dim`パラメータは、ベクトルフィールドに保持されるベクトル埋め込みの次元を示します。`FLOAT_VECTOR`値は、ベクトルフィールドが32ビット浮動小数点数のリストを保持していることを示します。これらは通常、表すために使用されますantilogarithms.In、Zilliz Cloudは以下の種類のベクトル埋め込みもサポートしています

- インラインコードプレースホルダー0

    このタイプのベクトル場は、16ビットの半精度浮動小数点数のリストを保持し、通常はメモリまたはbandwidth-restrictedのディープラーニングまたはGPUベースのコンピューティングシナリオに適用されます。

- インラインコードプレースホルダー0

    このタイプのベクトル場は、精度が低下しているがFloat 32と同じ指数範囲を持つ16ビット浮動小数点数のリストを保持します。このタイプのデータは、精度に大きな影響を与えることなくメモリ使用量を減らすため、深層学習シナリオで一般的に使用されます。

- インラインコードプレースホルダー0

    このタイプのベクトル場は、各成分が-128から127までの8ビット符号付き整数(int 8)で構成されるベクトルを格納します。ResNetやEfficientNetなどの量子化されたディープラーニングアーキテクチャに合わせて調整されており、モデル体格を大幅に縮小し、推論速度を向上させますが、最小限の精度損失しか発生しません。**注意**:このベクトルタイプはHNSWインデックスにのみ対応しています。

</include>

- インラインコードプレースホルダー0

    このタイプのベクトル場は、0と1のリストを保持します。これらは、画像処理や情報検索シナリオでデータを表現するためのコンパクトな特徴として機能します。

- インラインコードプレースホルダー0

    この型のベクトル場は、疎なベクトル埋め込みを表す非ゼロの数とそのシーケンス番号のリストを保持します。

## スカラーフィールドを追加{#add-scalar-fields}

一般的な場合、スカラーフィールドを使用して、格納されたベクトル埋め込みのメタデータを格納できますZilliz Cloudクラスタメタデータフィルタリングを使用してANN検索を実行し、検索結果の正確性を向上させます。Zilliz Cloudは、VarChar、Boolean、Int、Float、Double、Array、JSONを含む複数のスカラーフィールドタイプをサポートしています。

### 文字列フィールドを追加{#add-string-fields}

にZilliz CloudクラスタVarCharフィールドを使用して文字列を保存できます。VarCharフィールドの詳細については、[文字列フィールド](./use-string-field)を参照してください。

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

### 数値フィールドを追加{#add-number-fields}

数字の種類Zillizクラウド`Int8`、`Int16`、`Int32`、`Int64`、`Float`、および`Double`がサポートされています。数値フィールドの詳細については、[数字フィールド](./use-number-field)を参照してください。

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

### ブールフィールドを追加{#add-boolean-fields}

Zillizクラウドブールフィールドをサポートしています。次のコードスニペットは、ブールフィールドを追加する方法を示しています。

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

### JSONフィールドを追加してください。{#add-json-fields}

JSONフィールドには通常、半構造化されたJSONデータが格納されます。JSONフィールドの詳細については、[JSONフィールド](./use-json-fields)を参照してください。

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

### 配列フィールドを追加{#add-array-fields}

配列フィールドは要素のリストを格納します。配列フィールド内のすべての要素のデータ型は同じでなければなりません。配列フィールドの詳細については、[配列フィールド](./use-array-fields)を参照してください。

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

