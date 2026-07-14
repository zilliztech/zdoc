---
title: "スキーマの説明 | BYOC"
slug: /schema-explained
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマは collection のデータ構造を定義します。collection を作成する前に、そのスキーマの設計を行う必要があります。このページでは、collection スキーマを理解し、自分でスキーマの例を設計できるように説明します。 | BYOC"
type: origin
token: Vs4YwNnvzitoQ8kunlGcWMJInbf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマの説明

スキーマは collection のデータ構造を定義します。collection を作成する前に、そのスキーマの設計を行う必要があります。このページでは、collection スキーマを理解し、自分でスキーマの例を設計できるように説明します。

## Overview\{#overview}

Zilliz Cloud では、collection スキーマはリレーショナルデータベースのテーブルに相当し、Zilliz Cloud が collection 内のデータをどのように整理するかを定義します。 

適切に設計されたスキーマは、データモデルを抽象化し、検索を通じてビジネス目標を達成できるかどうかを左右するため、非常に重要です。さらに、collection に挿入されるすべてのデータ行はスキーマに従う必要があるため、データの一貫性と長期的な品質の維持にも役立ちます。技術的な観点では、明確に定義されたスキーマは、整理された列データの保存とよりクリーンな index 構造につながり、検索パフォーマンスを向上させます。

collection スキーマには、primary key、少なくとも 1 つの vector field、およびいくつかの scalar field が含まれます。以下の図は、記事をスキーマフィールドのリストにマッピングする方法を示しています。

![RoJFbyTsuoY8mHxoBBicgBH9nTc](https://zdoc-images.s3.us-west-2.amazonaws.com/rojfbytsuoy8mhxobbicgbh9ntc.png "RoJFbyTsuoY8mHxoBBicgBH9nTc")

検索システムのデータモデル設計では、ビジネス要件を分析し、情報をスキーマで表現されたデータモデルへ抽象化します。たとえば、テキスト片を検索するには、その文字列を "embedding" によって vector に変換して "indexed" し、vector search を有効にする必要があります。この必須要件に加えて、公開タイムスタンプや著者などの他の属性を保存する必要がある場合もあります。こうしたメタデータにより、フィルタリングによってセマンティック検索をさらに絞り込み、特定の日付以降に公開されたテキストや特定の著者によるテキストのみを返すことができます。また、これらの scalar を本文とともに取得して、アプリケーション内で検索結果をレンダリングすることもできます。これらの各要素には、これらのテキスト片を整理するための一意の識別子を割り当てる必要があり、それは整数または文字列で表現されます。これらの要素は、高度な検索ロジックを実現するために不可欠です。

適切に設計されたスキーマの作成方法については、[Schema Design Hands-On](./schema-design-hands-on) を参照してください。

## Create Schema\{#create-schema}

以下のコードスニペットは、スキーマを作成する方法を示しています。

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

## Add Primary Field\{#add-primary-field}

collection 内の primary field は、entity を一意に識別します。これは **Int64** または **VarChar** 値のみを受け入れます。以下のコードスニペットは、primary field を追加する方法を示しています。

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

フィールドを追加する際は、その `is_primary` プロパティを `True` に設定することで、そのフィールドが primary field であることを明示できます。primary field はデフォルトで **Int64** 値を受け入れます。この場合、primary field の値は `12345` のような整数である必要があります。primary field で **VarChar** 値を使用する場合、値は `my_entity_1234` のような文字列である必要があります。

また、`autoId` プロパティを `True` に設定して、データ挿入時に Zilliz Cloud が primary field の値を自動的に割り当てるようにすることもできます。

<Admonition type="info" icon="📘" title="注意">

primary key を手動で設定することに利点がある場合を除き、すべてのケースで `autoId` に依存することを推奨します。

</Admonition>

詳細については、[Primary Field & AutoId](./primary-field-auto-id) を参照してください。

## Add Vector Fields\{#add-vector-fields}

vector field は、さまざまな sparse および dense vector embedding を受け入れます。Zilliz Cloud では、1 つの collection に 4 つの vector field を追加できます。以下のコードスニペットは、vector field を追加する方法を示しています。

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

上記のコードスニペットにある `dim` パラメータは、vector field に保持される vector embedding の次元数を示します。`FLOAT_VECTOR` 値は、その vector field が 32 ビット浮動小数点数のリストを保持することを示しており、通常は逆対数を表現するために使用されます。これに加えて、Zilliz Cloud は次のタイプの vector embedding もサポートしています。

- `FLOAT16_VECTOR`

    このタイプの vector field は、16 ビット半精度浮動小数点数のリストを保持し、通常はメモリや帯域幅に制約のあるディープラーニング、または GPU ベースの計算シナリオに適用されます。

- `BFLOAT16_VECTOR`

    このタイプの vector field は、精度は低下しているものの Float32 と同じ指数範囲を持つ 16 ビット浮動小数点数のリストを保持します。このデータタイプは、精度に大きな影響を与えずにメモリ使用量を削減できるため、ディープラーニングのシナリオで一般的に使用されます。

- `INT8_VECTOR`

    このタイプの vector field は、8 ビット符号付き整数（int8）で構成される vector を保存し、各成分の範囲は –128 から 127 です。ResNet や EfficientNet などの量子化ディープラーニングアーキテクチャ向けに最適化されており、わずかな精度低下でモデルサイズを大幅に縮小し、推論速度を向上させます。**注**: この vector タイプは HNSW index でのみサポートされます。

- `BINARY_VECTOR`

    このタイプの vector field は、0 と 1 のリストを保持します。これは、画像処理や情報検索のシナリオでデータを表現するためのコンパクトな特徴量として機能します。

- `SPARSE_FLOAT_VECTOR`

    このタイプの vector field は、非ゼロの数値とそのシーケンス番号のリストを保持して、sparse vector embedding を表現します。

## Add Scalar Fields\{#add-scalar-fields}

一般的なケースでは、scalar field を使用して Zilliz Cloud cluster に保存された vector embedding のメタデータを格納し、メタデータフィルタリングとともに ANN 検索を実行することで、検索結果の正確性を向上させることができます。Zilliz Cloud は、**VarChar**、**TEXT**、**Boolean**、**Int**、**Float**、**Double** など、複数の scalar field タイプをサポートしています。

### Add VarChar Fields\{#add-varchar-fields}

Zilliz Cloud cluster では、VarChar field を使用して文字列を保存できます。VarChar field の詳細については、[String Field](./use-string-field) を参照してください。

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

### Add TEXT Fields\{#add-text-fields}

Milvus 3.0 以降では、`TEXT` field を使用して、ドキュメントテキスト、パッセージ、ログ、その他の長文コンテンツを保存できます。`VARCHAR` とは異なり、`TEXT` field には `max_length` は必要ありません。`TEXT` field の詳細については、[TEXT Field](./use-text-field) を参照してください。

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

### Add Number Fields\{#add-number-fields}

Zilliz Cloud がサポートする数値型は、`Int8`、`Int16`、`Int32`、`Int64`、`Float`、`Double` です。数値 field の詳細については、[Number Field](./use-number-field) を参照してください。

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

### Add Boolean Fields\{#add-boolean-fields}

Zilliz Cloud は boolean field をサポートしています。以下のコードスニペットは、boolean field を追加する方法を示しています。

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

## Add Composite Fields\{#add-composite-fields}

Milvus では、composite field とは、JSON field のキーや Array field のインデックスのように、より小さなサブフィールドに分割できる field を指します。

### Add JSON fields\{#add-json-fields}

JSON field は通常、半構造化された JSON データを保存します。JSON field の詳細については、[JSON Field Overview](./json-field-overview) を参照してください。

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

### Add Array Fields\{#add-array-fields}

array field は要素のリストを保存します。array field 内のすべての要素のデータ型は同じである必要があります。array field の詳細については、[Array Field](./use-array-fields) を参照してください。

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
