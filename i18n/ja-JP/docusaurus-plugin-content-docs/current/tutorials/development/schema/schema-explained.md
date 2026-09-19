---
title: "スキーマの解説 | Cloud"
slug: /schema-explained
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマ設計を固める必要があります。このページでは、コレクションスキーマを理解し、サンプルスキーマを自分で設計できるようにします。 | Cloud"
type: origin
token: Vs4YwNnvzitoQ8kunlGcWMJInbf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマの解説

スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマ設計を固める必要があります。このページでは、コレクションスキーマを理解し、サンプルスキーマを自分で設計できるようにします。

## 概要\{#overview}

Zilliz Cloud では、コレクションスキーマはリレーショナルデータベースのテーブルに相当し、Zilliz Cloud がコレクション内のデータをどのように整理するかを定義します。

適切に設計されたスキーマは、データモデルを抽象化し、検索を通じてビジネス目標を達成できるかどうかを左右するため、不可欠です。さらに、コレクションに挿入されるすべてのデータ行はスキーマに従う必要があるため、データの一貫性と長期的な品質の維持にも役立ちます。技術的な観点では、明確に定義されたスキーマは、整理された列データストレージとよりクリーンなインデックス構造につながり、検索パフォーマンスを向上させます。

コレクションスキーマには、プライマリキー、少なくとも 1 つのベクトルフィールド、および複数のスカラーフィールドがあります。次の図は、記事をスキーマフィールドの一覧にマッピングする方法を示しています。

![RoJFbyTsuoY8mHxoBBicgBH9nTc](https://zdoc-images.s3.us-west-2.amazonaws.com/rojfbytsuoy8mhxobbicgbh9ntc.png "RoJFbyTsuoY8mHxoBBicgBH9nTc")

検索システムのデータモデル設計では、ビジネス要件を分析し、情報をスキーマで表現されるデータモデルへ抽象化します。たとえば、あるテキストを検索するには、リテラル文字列を「embedding」によってベクトルに変換し、ベクトル検索を有効にすることで「インデックス化」する必要があります。この必須要件に加えて、公開タイムスタンプや著者などの他のプロパティを保存する必要がある場合もあります。このメタデータにより、フィルタリングを通じてセマンティック検索を絞り込み、特定の日付以降に公開されたテキストや、特定の著者によるテキストのみを返すことができます。また、検索結果をアプリケーションで表示するために、メインテキストとともにこれらのスカラーを取得することもできます。これらのテキスト片を整理するには、それぞれに一意の識別子を割り当てる必要があり、これは整数または文字列で表現されます。これらの要素は、高度な検索ロジックを実現するうえで不可欠です。

適切に設計されたスキーマの作成方法については、[スキーマ設計のハンズオン](./schema-design-hands-on) を参照してください。

## スキーマの作成\{#create-schema}

次のコードスニペットは、スキーマの作成方法を示しています。

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

コレクション内のプライマリフィールドは、エンティティを一意に識別します。受け付ける値は **Int64** または **VarChar** のみです。次のコードスニペットは、プライマリフィールドの追加方法を示しています。

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

フィールドを追加する際に、その `is_primary` プロパティを `True` に設定することで、そのフィールドをプライマリフィールドとして明示的に指定できます。プライマリフィールドは、デフォルトで **Int64** 値を受け付けます。この場合、プライマリフィールドの値は `12345` のような整数である必要があります。プライマリフィールドで **VarChar** 値を使用する場合、値は `my_entity_1234` のような文字列である必要があります。

また、`autoId` プロパティを `True` に設定すると、データ挿入時に Zilliz Cloud がプライマリフィールドの値を自動的に割り当てるようにできます。

<Admonition type="info" title="Notes">

プライマリキーを手動で設定することが有利な場合を除き、すべてのケースで `autoId` に依存することをお勧めします。

</Admonition>

詳細については、[プライマリフィールドと AutoID](./primary-field-auto-id) を参照してください。

## ベクトルフィールドの追加\{#add-vector-fields}

ベクトルフィールドは、さまざまなスパースおよび高密度のベクトル埋め込みを受け付けます。Zilliz Cloud では、1 つのコレクションに 4 つのベクトルフィールドを追加できます。次のコードスニペットは、ベクトルフィールドの追加方法を示しています。

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

上記のコードスニペットの `dim` パラメーターは、ベクトルフィールドに格納されるベクトル埋め込みの次元数を示します。`FLOAT_VECTOR` 値は、そのベクトルフィールドが 32 ビットの浮動小数点数のリストを保持することを示しており、これらは通常、アンチログの表現に使用されます。これに加えて、Zilliz Cloud は次の種類のベクトル埋め込みもサポートしています。

- `FLOAT16_VECTOR`

    この型のベクトルフィールドは、16 ビットの半精度浮動小数点数のリストを保持し、通常はメモリや帯域幅が制限されたディープラーニングまたは GPU ベースの計算シナリオに適用されます。

- `BFLOAT16_VECTOR`

    この型のベクトルフィールドは、精度は低下していますが Float32 と同じ指数範囲を持つ 16 ビット浮動小数点数のリストを保持します。このタイプのデータは、精度に大きな影響を与えずにメモリ使用量を削減できるため、ディープラーニングのシナリオで一般に使用されます。

- `INT8_VECTOR`

    この型のベクトルフィールドは、8 ビットの符号付き整数（int8）で構成されるベクトルを格納し、各要素の範囲は –128 から 127 です。ResNet や EfficientNet などの量子化ディープラーニングアーキテクチャ向けに設計されており、精度の低下を最小限に抑えながら、モデルサイズを大幅に縮小し、推論速度を向上させます。**Note**: このベクトル型は HNSW インデックスでのみサポートされます。

- `BINARY_VECTOR`

    この型のベクトルフィールドは、0 と 1 のリストを保持します。これらは、画像処理や情報検索のシナリオでデータを表現するためのコンパクトな特徴量として機能します。

- `SPARSE_FLOAT_VECTOR`

    この型のベクトルフィールドは、非ゼロの数値とそのシーケンス番号のリストを保持し、スパースなベクトル埋め込みを表現します。

## スカラーフィールドの追加\{#add-scalar-fields}

一般的なケースでは、スカラーフィールドを使用して Zilliz Cloud クラスターに格納されたベクトル埋め込みのメタデータを保存し、メタデータフィルタリングを伴う ANN 検索を実行して検索結果の正確性を向上させることができます。Zilliz Cloud は、**VarChar**、**TEXT**、**Boolean**、**Int**、**Float**、**Double** など、複数のスカラーフィールド型をサポートしています。

### VarChar フィールドの追加\{#add-varchar-fields}

Zilliz Cloud クラスターでは、VarChar フィールドを使用して文字列を格納できます。VarChar フィールドの詳細については、[文字列フィールド](./use-string-field) を参照してください。

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

Milvus 3.0 以降では、`TEXT` フィールドを使用して、ドキュメントテキスト、パッセージ、ログ、その他の長文コンテンツを格納できます。`VARCHAR` とは異なり、`TEXT` フィールドには `max_length` は不要です。`TEXT` フィールドの詳細については、[TEXT フィールド](./use-text-field) を参照してください。

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

Zilliz Cloud がサポートする数値型は、`Int8`、`Int16`、`Int32`、`Int64`、`Float`、`Double` です。数値フィールドの詳細については、[数値フィールド](./use-number-field) を参照してください。

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

### ブール値フィールドの追加\{#add-boolean-fields}

Zilliz Cloud はブール値フィールドをサポートしています。次のコードスニペットは、ブール値フィールドの追加方法を示しています。

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

Zilliz Cloud では、複合フィールドとは、JSON フィールドのキーや Array フィールドのインデックスなど、より小さなサブフィールドに分割できるフィールドです。

### JSON フィールドの追加\{#add-json-fields}

JSON フィールドは通常、半構造化された JSON データを格納します。JSON フィールドの詳細については、[JSON フィールドの概要](./json-field-overview) を参照してください。

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

Array フィールドは要素のリストを格納します。Array フィールド内のすべての要素は同じデータ型である必要があります。Array フィールドの詳細については、[Array フィールド](./use-array-fields) を参照してください。

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
