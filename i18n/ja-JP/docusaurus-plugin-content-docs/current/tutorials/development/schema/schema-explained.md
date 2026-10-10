---
title: "スキーマの説明 | Cloud"
slug: /schema-explained
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマの設計を検討する必要があります。このページでは、コレクションスキーマを理解し、独自のサンプルスキーマを設計できるよう支援します。 | Cloud"
type: origin
token: Vs4YwNnvzitoQ8kunlGcWMJInbf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマの説明

スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマの設計を検討する必要があります。このページでは、コレクションスキーマを理解し、独自のサンプルスキーマを設計できるよう支援します。

## 概要\{#overview}

Zilliz Cloud では、コレクションスキーマはリレーショナルデータベースのテーブルに相当し、Zilliz Cloud がコレクション内のデータをどのように整理するかを定義します。

適切に設計されたスキーマは、データモデルを抽象化し、検索を通じてビジネス目標を達成できるかどうかを決定するため、不可欠です。さらに、コレクションに挿入されるすべてのデータ行はスキーマに従う必要があるため、データの一貫性と長期的な品質の維持に役立ちます。技術的な観点では、適切に定義されたスキーマは、整理された列データストレージとよりクリーンなインデックス構造をもたらし、検索パフォーマンスを向上させます。

コレクションスキーマには、主キー、少なくとも 1 つのベクトルフィールド、およびいくつかのスカラーフィールドがあります。次の図は、記事をスキーマフィールドのリストにマッピングする方法を示しています。

![RoJFbyTsuoY8mHxoBBicgBH9nTc](https://zdoc-images.s3.us-west-2.amazonaws.com/rojfbytsuoy8mhxobbicgbh9ntc.png "RoJFbyTsuoY8mHxoBBicgBH9nTc")

検索システムのデータモデル設計では、ビジネスニーズを分析し、情報をスキーマで表現されたデータモデルに抽象化します。たとえば、一連のテキストを検索するには、リテラル文字列を「埋め込み」によってベクトルに変換し、ベクトル検索を有効にして「インデックス化」する必要があります。この必須要件に加えて、公開タイムスタンプや著者などの他のプロパティを保存する必要がある場合があります。このメタデータにより、フィルタリングを通じてセマンティック検索を絞り込み、特定の日付以降に公開されたテキストや特定の著者によるテキストのみを返すことができます。また、これらのスカラーを本文とともに取得して、アプリケーションで検索結果をレンダリングすることもできます。これらのテキストを整理するには、各テキストに一意の識別子を割り当て、整数または文字列として表現する必要があります。これらの要素は、高度な検索ロジックを実現するために不可欠です。

適切に設計されたスキーマを作成する方法については、[スキーマ設計ハンズオン](./schema-design-hands-on) を参照してください。

## スキーマを作成する\{#create-schema}

次のコードスニペットは、スキーマを作成する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = MilvusClientV2.CreateSchema();
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

schema := entity.NewSchema()
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let mut schema = CollectionSchema::new();
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const schema = []
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

## 主フィールドを追加する\{#add-primary-field}

コレクションの主フィールドは、エンティティを一意に識別します。**Int64** または **VarChar** の値のみを受け付けます。次のコードスニペットは、主フィールドを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
schema = schema.add_field(
    FieldSchema::new()
        .name("my_id")
        .data_type(DataType::Int64)
        .primary_key(true)
        .auto_id(false),
);
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_id", milvus::DataType::INT64, "", true, false));
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

<TabItem value='bash'>

```bash
export primaryField='{
    "fieldName": "my_id",
    "dataType": "Int64",
    "isPrimary": true
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField
    ]
}"
```

</TabItem>
</Tabs>

フィールドを追加する際、その `is_primary` プロパティを `True` に設定することで、フィールドを明示的に主フィールドとして指定できます。主フィールドはデフォルトで **Int64** 値を受け付けます。この場合、主フィールドの値は `12345` のような整数である必要があります。主フィールドで **VarChar** 値を使用する場合、値は `my_entity_1234` のような文字列である必要があります。

また、`autoId` プロパティを `True` に設定すると、データ挿入時に Zilliz Cloud が主フィールドの値を自動的に割り当てるようにできます。

<Admonition type="info" title="Notes">

手動で主キーを設定することが有益な場合を除き、常に `autoId` に依存することをお勧めします。

</Admonition>

詳細については、[主キーと AutoId](./primary-field-auto-id) を参照してください。

## ベクトルフィールドを追加する\{#add-vector-fields}

ベクトルフィールドは、さまざまなスパースおよびデンスのベクトル埋め込みを受け付けます。Zilliz Cloud では、コレクションに 4 つのベクトルフィールドを追加できます。次のコードスニペットは、ベクトルフィールドを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_vector").
    WithDataType(entity.FieldTypeFloatVector).
    // highlight-next-line
    WithDim(5),
)
```

</TabItem>

<TabItem value='rust'>

```rust
schema = schema.add_field(
    FieldSchema::new()
        .name("my_vector")
        .data_type(DataType::FloatVector)
        .dimension(5),
);
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
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

上記のコードスニペットの `dim` パラメーターは、ベクトルフィールドに保持されるベクトル埋め込みの次元数を示します。`FLOAT_VECTOR` 値は、ベクトルフィールドが 32 ビットの浮動小数点数のリストを保持することを示します。これらは通常、反対数を表すために使用されます。さらに、Zilliz Cloud は次の種類のベクトル埋め込みもサポートしています：

- `FLOAT16_VECTOR`

    このタイプのベクトルフィールドは、16 ビットの半精度浮動小数点数のリストを保持し、通常、メモリまたは帯域幅が制限されたディープラーニングや GPU ベースのコンピューティングのシナリオに適用されます。

- `BFLOAT16_VECTOR`

    このタイプのベクトルフィールドは、精度が低減されていますが Float32 と同じ指数範囲を持つ 16 ビット浮動小数点数のリストを保持します。このタイプのデータは、精度に大きな影響を与えずにメモリ使用量を削減できるため、ディープラーニングのシナリオで一般的に使用されます。

- `INT8_VECTOR`

    このタイプのベクトルフィールドは、8 ビットの符号付き整数（int8）で構成されるベクトルを格納し、各コンポーネントの範囲は –128 から 127 です。ResNet や EfficientNet などの量子化されたディープラーニングアーキテクチャ向けに調整されており、精度の低下を最小限に抑えながら、モデルサイズを大幅に削減し、推論速度を向上させます。**注意**：このベクトルタイプは HNSW インデックスでのみサポートされています。

- `BINARY_VECTOR`

    このタイプのベクトルフィールドは、0 と 1 のリストを保持します。これらは、画像処理や情報検索のシナリオでデータを表現するためのコンパクトな特徴量として機能します。

- `SPARSE_FLOAT_VECTOR`

    このタイプのベクトルフィールドは、スパースなベクトル埋め込みを表すために、非ゼロの数値とそのシーケンス番号のリストを保持します。

## スカラーフィールドを追加する\{#add-scalar-fields}

一般的には、スカラーフィールドを使用して Zilliz Cloud クラスターに格納されたベクトル埋め込みのメタデータを保存し、メタデータフィルタリングを使用して ANN 検索を実行することで、検索結果の正確性を向上させることができます。Zilliz Cloud は、**VarChar**、**TEXT**、**Boolean**、**Int**、**Float**、**Double** など、複数のスカラーフィールドタイプをサポートしています。

### VarChar フィールドを追加する\{#add-varchar-fields}

Zilliz Cloud クラスターでは、VarChar フィールドを使用して文字列を保存できます。VarChar フィールドの詳細については、[文字列フィールド](./use-string-field) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_varchar").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(512),
)
```

</TabItem>

<TabItem value='rust'>

```rust
schema = schema.add_field(
    FieldSchema::new()
        .name("my_varchar")
        .data_type(DataType::VarChar)
        .max_length(512),
);
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_varchar", milvus::DataType::VARCHAR).WithMaxLength(512));
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

### TEXT フィールドを追加する\{#add-text-fields}

Milvus 3.0 以降では、`TEXT` フィールドを使用して、ドキュメントのテキスト、パッセージ、ログ、その他の長いテキストコンテンツを保存できます。`VARCHAR` とは異なり、`TEXT` フィールドには `max_length` は不要です。`TEXT` フィールドの詳細については、[TEXT フィールド](./use-text-field) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
schema.addField(AddFieldReq.builder()
        .fieldName("my_text")
        .dataType(DataType.Text)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_text").
    WithDataType(entity.FieldTypeText),
)
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: Not yet supported in milvus-sdk-rust as of v3.0.2.
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_text", milvus::DataType::TEXT));
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_text",
    data_type: DataType.Text
});
```

</TabItem>

<TabItem value='bash'>

```bash
export textField='{
    "fieldName": "my_text",
    "dataType": "Text"
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $textField
    ]
}"
```

</TabItem>
</Tabs>

### 数値フィールドを追加する\{#add-number-fields}

Zilliz Cloud がサポートする数値のタイプは、`Int8`、`Int16`、`Int32`、`Int64`、`Float`、`Double` です。数値フィールドの詳細については、[数値フィールド](./use-number-field) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_int64").
    WithDataType(entity.FieldTypeInt64),
)
```

</TabItem>

<TabItem value='rust'>

```rust
schema = schema.add_field(
    FieldSchema::new()
        .name("my_int64")
        .data_type(DataType::Int64),
);
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_int64", milvus::DataType::INT64));
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
        $textField,
        $int64Field
    ]
}"
```

</TabItem>
</Tabs>

### ブールフィールドを追加する\{#add-boolean-fields}

Zilliz Cloud はブールフィールドをサポートしています。次のコードスニペットは、ブールフィールドを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_bool").
    WithDataType(entity.FieldTypeBool),
)
```

</TabItem>

<TabItem value='rust'>

```rust
schema = schema.add_field(
    FieldSchema::new()
        .name("my_bool")
        .data_type(DataType::Bool),
);
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_bool", milvus::DataType::BOOL));
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_bool",
    data_type: DataType.Bool
});
```

</TabItem>

<TabItem value='bash'>

```bash
export boolField='{
    "fieldName": "my_bool",
    "dataType": "Bool"
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $textField,
        $int64Field,
        $boolField
    ]
}"
```

</TabItem>
</Tabs>

## 複合フィールドを追加する\{#add-composite-fields}

Zilliz Cloud では、複合フィールドとは、JSON フィールドのキーや配列フィールドのインデックスなど、より小さなサブフィールドに分割できるフィールドです。

### JSON フィールドを追加する\{#add-json-fields}

JSON フィールドは通常、半構造化 JSON データを保存します。JSON フィールドの詳細については、[JSON フィールドの概要](./json-field-overview) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_json").
    WithDataType(entity.FieldTypeJSON),
)
```

</TabItem>

<TabItem value='rust'>

```rust
schema = schema.add_field(
    FieldSchema::new()
        .name("my_json")
        .data_type(DataType::Json),
);
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField(milvus::FieldSchema("my_json", milvus::DataType::JSON));
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
        $textField,
        $int64Field,
        $boolField,
        $jsonField
    ]
}"
```

</TabItem>
</Tabs>

### 配列フィールドを追加する\{#add-array-fields}

配列フィールドは要素のリストを保存します。配列フィールド内のすべての要素のデータ型は同じである必要があります。配列フィールドの詳細については、[配列フィールド](./use-array-fields) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
schema.WithField(entity.NewField().WithName("my_array").
    WithDataType(entity.FieldTypeArray).
    WithElementType(entity.FieldTypeVarChar).
    WithMaxLength(512).
    WithMaxCapacity(5),
)
```

</TabItem>

<TabItem value='rust'>

```rust
schema = schema.add_field(
    FieldSchema::new()
        .name("my_array")
        .data_type(DataType::Array)
        .element_type(DataType::VarChar)
        .max_length(512)
        .max_capacity(5),
);
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

<TabItem value='bash'>

```bash
export arrayField='{
    "fieldName": "my_array",
    "dataType": "Array",
    "elementDataType": "VarChar",
    "elementTypeParams": {
        "max_capacity": 5,
        "max_length": 512
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $primaryField,
        $vectorField,
        $varCharField,
        $textField,
        $int64Field,
        $boolField,
        $jsonField,
        $arrayField
    ]
}"
```

</TabItem>
</Tabs>
