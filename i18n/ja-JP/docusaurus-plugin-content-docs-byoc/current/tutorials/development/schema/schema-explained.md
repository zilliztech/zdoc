---
title: "スキーマの解説 | BYOC"
slug: /schema-explained
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマはコレクションのデータ構造を定義するものです。コレクションを作成する前に、そのスキーマを設計する必要があります。このページでは、コレクションスキーマの理解を深め、実際にスキーマを設計できるようになるための情報を提供します。 | BYOC"
type: origin
token: Vs4YwNnvzitoQ8kunlGcWMJInbf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマの解説

スキーマはコレクションのデータ構造を定義するものです。コレクションを作成する前に、そのスキーマを設計する必要があります。このページでは、コレクションスキーマの理解を深め、実際にスキーマを設計できるようになるための情報を提供します。

## 概要\{#overview}

Zilliz Cloud におけるコレクションスキーマは、リレーショナルデータベースのテーブルに相当し、Zilliz Cloud がコレクション内のデータをどのように編成するかを定義します。

適切に設計されたスキーマは、データモデルを抽象化し、検索によってビジネス目標を達成できるかを左右するため、極めて重要です。さらに、コレクションに挿入されるすべてのデータ行はスキーマに従う必要があるため、データの一貫性と長期的な品質維持にも役立ちます。技術的な観点からも、明確に定義されたスキーマは列データのストレージを整然とさせ、インデックス構造を最適化することで、検索パフォーマンスを向上させます。

コレクションスキーマには、主キー、少なくとも1つのベクトルフィールド、および複数のスカラーフィールドが含まれます。次の図は、記事をスキーマフィールドのリストにマッピングする方法を示しています。

![RoJFbyTsuoY8mHxoBBicgBH9nTc](https://zdoc-images.s3.us-west-2.amazonaws.com/rojfbytsuoy8mhxobbicgbh9ntc.png "RoJFbyTsuoY8mHxoBBicgBH9nTc")

検索システムのデータモデル設計では、ビジネス要件を分析し、情報をスキーマで表現可能なデータモデルへと抽象化します。たとえば、テキストを検索するには、リテラル文字列を「埋め込み（Embedding）」によってベクトルに変換して「インデックス化」し、ベクトル検索を可能にする必要があります。この基本的な要件に加え、公開タイムスタンプや著者などのプロパティも保存する必要が生じる場合があります。このようなメタデータを用いることで、セマンティック検索をフィルタリングで絞り込み、特定の日付以降や特定の著者が公開したテキストのみを返すことが可能になります。また、これらのスカラー値をメインテキストと一緒に取得し、アプリケーション上で検索結果を表示することもできます。これらのテキストデータを整理するには、それぞれに整数または文字列形式の一意な識別子を割り当てる必要があります。こうした要素は、高度な検索ロジックを実現するために不可欠です。

適切なスキーマの作成方法については、[スキーマ設計ハンズオン](./schema-design-hands-on) を参照してください。

## スキーマの作成\{#create-schema}

次のコードスニペットは、スキーマを作成する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
```

</TabItem>
</Tabs>

## プライマリフィールドの追加\{#add-primary-field}

コレクション内のプライマリフィールドは、エンティティを一意に識別するためのフィールドです。このフィールドには **Int64** または **VarChar** の値のみを指定できます。次のコードスニペットは、プライマリフィールドを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_id", milvus::DataType::INT64, "", true, false));
```

</TabItem>
</Tabs>

フィールドを追加する際、`is_primary` プロパティを `True` に設定することで、そのフィールドをプライマリフィールドとして明示的に指定できます。プライマリフィールドはデフォルトで **Int64** 値を受け付けます。この場合、プライマリフィールドの値は `12345` のような整数である必要があります。プライマリフィールドに **VarChar** 値を使用する場合は、`my_entity_1234` のような文字列を指定する必要があります。

また、`autoId` プロパティを `True` に設定することで、データ挿入時に Zilliz Cloud がプライマリフィールドの値を自動的に割り当てるようにすることもできます。

<Admonition type="info" icon="📘" title="Notes">

手動でプライマリキーを設定することに明確なメリットがある場合を除き、基本的には `autoId` を利用することを推奨します。

</Admonition>

詳細については、[プライマリフィールドとAutoId](./primary-field-auto-id) を参照してください。

## ベクトルフィールドの追加\{#add-vector-fields}

ベクトルフィールドには、さまざまなスパースおよびデンスベクトル埋め込みを格納できます。Zilliz Cloud では、1つのコレクションに最大4つのベクトルフィールドを追加できます。次のコードスニペットは、ベクトルフィールドを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
```

</TabItem>
</Tabs>

上記のコードスニペットにある `dim` パラメータは、ベクトルフィールドに保持されるベクトル埋め込みの次元数を示します。`FLOAT_VECTOR` 値は、ベクトルフィールドが32ビット浮動小数点数のリストを保持することを意味し、一般的に真数を表現するために使用されます。さらに、Zilliz Cloud は以下の種類のベクトル埋め込みもサポートしています。

- `FLOAT16_VECTOR`

    このタイプのベクトルフィールドは16ビット半精度浮動小数点数のリストを保持し、主にメモリや帯域幅に制約のあるディープラーニングやGPUベースのコンピューティング環境で使用されます。

- `BFLOAT16_VECTOR`

    このタイプのベクトルフィールドは、Float32と同じ指数範囲を持ちながら精度を抑えた16ビット浮動小数点数のリストを保持します。精度への影響を最小限に抑えつつメモリ使用量を削減できるため、ディープラーニングのシナリオで広く利用されています。

- `INT8_VECTOR`

    このタイプのベクトルフィールドは、各成分が–128から127の範囲である8ビット符号付き整数（int8）で構成されるベクトルを格納します。ResNetやEfficientNetなどの量子化ディープラーニングアーキテクチャに適しており、精度の損失を最小限に抑えながら、モデルサイズの大幅な縮小と推論速度の向上を実現します。**注意**: このベクトルタイプはHNSWインデックスでのみサポートされます。

- `BINARY_VECTOR`

    このタイプのベクトルフィールドは0と1のリストを保持します。画像処理や情報検索のシナリオにおいて、データを表現するためのコンパクトな特徴量として機能します。

- `SPARSE_FLOAT_VECTOR`

    このタイプのベクトルフィールドは、スパースベクトル埋め込みを表現するために、非ゼロの数値とそのインデックス番号のリストを保持します。

## スカラーフィールドの追加\{#add-scalar-fields}

一般的に、スカラーフィールドは Zilliz Cloud クラスターに格納されたベクトル埋め込みのメタデータを保存するために使用します。メタデータフィルタリングを併用した ANN 検索を行うことで、検索結果の精度を高められます。Zilliz Cloud は、**VarChar**、**TEXT**、**Boolean**、**Int**、**Float**、**Double** など、複数のスカラーフィールド型をサポートしています。

### VarChar フィールドの追加\{#add-varchar-fields}

Zilliz Cloud クラスターでは、VarChar フィールドを使用して文字列を保存できます。VarChar フィールドの詳細については、[String Field](./use-string-field) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_varchar", milvus::DataType::VARCHAR).WithMaxLength(512));
```

</TabItem>
</Tabs>

### TEXT フィールドの追加\{#add-text-fields}

Milvus 3.0 以降では、`TEXT` フィールドを使用して、ドキュメントテキスト、文章、ログ、その他の長いテキストコンテンツを保存できます。`VARCHAR` とは異なり、`TEXT` フィールドでは `max_length` は不要です。`TEXT` フィールドの詳細については、[TEXT Field](./use-text-field) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_text",
    datatype=DataType.TEXT,
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### 数値フィールドの追加\{#add-number-fields}

Zilliz Cloud がサポートする数値型は、`Int8`、`Int16`、`Int32`、`Int64`、`Float`、`Double` です。数値フィールドの詳細については、[Number Field](./use-number-field) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_int64", milvus::DataType::INT64));
```

</TabItem>
</Tabs>

### Boolean フィールドの追加\{#add-boolean-fields}

Zilliz Cloud は Boolean フィールドをサポートしています。以下のコードスニペットは、Boolean フィールドを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_bool", milvus::DataType::BOOL));
```

</TabItem>
</Tabs>

## 複合フィールドの追加\{#add-composite-fields}

Zilliz Cloud における複合フィールドとは、JSON フィールドのキーや Array フィールドのインデックスのように、より小さなサブフィールドに分割できるフィールドのことです。

### JSON フィールドの追加\{#add-json-fields}

JSON フィールドは通常、半構造化 JSON データを保存するために使用します。JSON フィールドの詳細については、[JSON Field Overview](./json-field-overview) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_json", milvus::DataType::JSON));
```

</TabItem>
</Tabs>

### Array フィールドの追加\{#add-array-fields}

Array フィールドは要素のリストを保存します。Array フィールド内のすべての要素のデータ型は同一である必要があります。Array フィールドの詳細については、[Array Field](./use-array-fields) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_array", milvus::DataType::ARRAY)
                                    .WithElementType(milvus::DataType::VARCHAR)
                                    .WithMaxCapacity(5)
                                    .WithMaxLength(512));
```

</TabItem>
</Tabs>
