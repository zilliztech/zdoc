---
title: "スキーマの説明 | Cloud"
slug: /schema-explained
sidebar_key: schema-explained
sidebar_label: "概要"
beta: FALSE
notebook: FALSE
description: "スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマの設計を行う必要があります。このページでは、コレクションスキーマの理解と、独自にサンプルスキーマを設計する方法について解説します。| Cloud"
type: origin
token: Vs4YwNnvzitoQ8kunlGcWMJInbf
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - スキーマの説明

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スキーマの説明

スキーemaはコレクションのデータ構造を定義します。コレクションを作成する前に、そのスキーマ設計を検討する必要があります。このページでは、コレクションのスキーマについて理解し、独自に例となるスキーマを設計できるように支援します。

## 概要\{#overview}

Zilliz Cloud では、コレクションのスキーマはリレーショナルデータベースにおけるテーブルに相当し、Zilliz Cloud がコレクション内でデータをどのように構成するかを定義します。

適切に設計されたスキーマは非常に重要です。なぜなら、スキーマはデータモデルを抽象化し、検索を通じてビジネス目標を達成できるかどうかを決定するからです。さらに、コレクションに挿入されるすべてのデータ行はスキーマに従う必要があるため、データの一貫性と長期的な品質を維持するのに役立ちます。技術的な観点からは、明確に定義されたスキーマにより、列指向のデータストレージが整理され、インデックス構造もシンプルになるため、検索パフォーマンスが向上します。

コレクションのスキーマには、主キー（primary key）、少なくとも1つのベクトルフィールド、および複数のスカラーフィールドが含まれます。以下の図は、記事をスキーマフィールドのリストにどのようにマッピングするかを示しています。

![RoJFbyTsuoY8mHxoBBicgBH9nTc](https://zdoc-images.s3.us-west-2.amazonaws.com/rojfbytsuoy8mhxobbicgbh9ntc.png "RoJFbyTsuoY8mHxoBBicgBH9nTc")

検索システムのデータモデル設計では、ビジネス要件を分析し、情報をスキーマで表現可能なデータモデルに抽象化します。例えば、テキストを検索可能にするには、「埋め込み（embedding）」によって文字列をベクトルに変換し、「インデックス化」してベクトル検索を有効にする必要があります。この基本要件に加えて、公開日時や著者などの他のプロパティを保存することも必要になる場合があります。このようなメタデータにより、セマンティック検索をフィルタリングによって絞り込むことができ、特定の日付以降に公開されたものや特定の著者によるテキストのみを返すことができます。また、これらのスカラーフィールドをメインテキストとともに取得し、アプリケーション上で検索結果を表示することも可能です。これらのテキスト片を整理するために、それぞれに一意の識別子（整数または文字列）を割り当てる必要があります。これらすべての要素が、高度な検索ロジックを実現するために不可欠です。

適切なスキーマの作成方法については、[Schema Design Hands-On](./schema-design-hands-on) を参照してください。

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

<TabItem value='java'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const schema = []
```

</TabItem>

<TabItem value='java'>

```go
import "github.com/milvus-io/milvus/client/v2/entity"

schema := entity.NewSchema()
```

</TabItem>

<TabItem value='java'>

```bash
export schema='{
    "fields": []
}'
```

</TabItem>
</Tabs>

## 主キーの追加\{#add-primary-field}

コレクション内の主キーは、エンティティを一意に識別します。このフィールドには **Int64** または **VarChar** 値のみを受け付けます。以下のコードスニペットは、主キーを追加する方法を示しています。

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

<TabItem value='java'>

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

<TabItem value='java'>

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

<TabItem value='java'>

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

フィールドを追加する際、そのフィールドの `is_primary` プロパティを `True` に設定することで、明示的にそのフィールドをプライマリフィールドとして指定できます。プライマリフィールドはデフォルトで **Int64** 値を受け入れます。この場合、プライマリフィールドの値は `12345` のような整数である必要があります。プライマリフィールドで **VarChar** 値を使用する場合は、`my_entity_1234` のような文字列を指定する必要があります。

また、`autoId` プロパティを `True` に設定すると、データ挿入時に Zilliz Cloud が自動的にプライマリフィールドの値を割り当てます。

<Admonition type="info" icon="📘" title="Notes">

<p>手動で主キーを設定することが有益でない限り、すべてのケースで <code>autoId</code> を使用することをお勧めします。</p>

</Admonition>

詳細については、[Primary Field & AutoId](./primary-field-auto-id) を参照してください。

## ベクトルフィールドの追加\{#add-vector-fields}

ベクトルフィールドは、さまざまなスパースベクトルおよび密ベクトル埋め込み（embedding）を受け入れます。Zilliz Cloud では、コレクションに最大4つのベクトルフィールドを追加できます。以下のコードスニペットは、ベクトルフィールドを追加する方法を示しています。

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

<TabItem value='java'>

```javascript
schema.push({
    name: "my_vector",
    data_type: DataType.FloatVector,
    // highlight-next-line
    dim: 5
});
```

</TabItem>

<TabItem value='java'>

```go
schema.WithField(entity.NewField().WithName("my_vector").
    WithDataType(entity.FieldTypeFloatVector).
    // highlight-next-line
    WithDim(5),
)
```

</TabItem>

<TabItem value='java'>

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

上記のコードスニペットにおける `dim` パラメータは、ベクターフィールドに格納されるベクトル埋め込みの次元数を示します。`FLOAT_VECTOR` の値は、ベクターフィールドが通常対数の逆関数（antilogarithms）を表現するために使用される32ビット浮動小数点数のリストを保持することを示しています。これに加えて、Zilliz Cloud は以下のベクトル埋め込みタイプもサポートしています：

- `FLOAT16_VECTOR`

    このタイプのベクターフィールドは、16ビットの半精度浮動小数点数のリストを保持し、主にメモリまたは帯域幅が制限されたディープラーニングや GPU ベースのコンピューティングのシナリオに適用されます。

- `BFLOAT16_VECTOR`

    このタイプのベクターフィールドは、精度は低下しているものの Float32 と同じ指数範囲を持つ16ビット浮動小数点数のリストを保持します。このデータタイプはディープラーニングのシナリオで一般的に使用され、精度への影響を最小限に抑えつつメモリ使用量を削減します。

- `INT8_VECTOR`

    このタイプのベクターフィールドは、–128 から 127 の範囲の8ビット符号付き整数（int8）で構成されるベクトルを格納します。ResNet や EfficientNet などの量子化されたディープラーニングアーキテクチャ向けに最適化されており、精度の損失を最小限に抑えながらモデルサイズを大幅に縮小し、推論速度を向上させます。**注記**: このベクタータイプは HNSW インデックスでのみサポートされています。

- `BINARY_VECTOR`

    このタイプのベクターフィールドは、0 と 1 のリストを保持します。画像処理や情報検索のシナリオにおいて、データを表現するためのコンパクトな特徴量として利用されます。

- `SPARSE_FLOAT_VECTOR`

    このタイプのベクターフィールドは、非ゼロの数値とそのシーケンス番号のリストを保持し、スパースベクトル埋め込みを表現します。

## スカラーフィールドの追加\{#add-scalar-fields}

一般的なケースでは、Zilliz Cloud クラスターに格納されたベクトル埋め込みのメタデータを保存するためにスカラーフィールドを使用できます。また、メタデータによるフィルタリングを伴う ANN 検索を実行することで、検索結果の正確性を向上させることができます。Zilliz Cloud は、**VarChar**、**Boolean**、**Int**、**Float**、**Double** を含む複数のスカラーフィールドタイプをサポートしています。

### 文字列フィールドの追加\{#add-string-fields}

Zilliz Cloud クラスターでは、文字列を格納するために VarChar フィールドを使用できます。VarChar フィールドの詳細については、[String Field](./use-string-field) を参照してください。

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

<TabItem value='java'>

```javascript
schema.push({
    name: "my_varchar",
    data_type: DataType.VarChar,
    // highlight-next-line
    max_length: 512
});
```

</TabItem>

<TabItem value='java'>

```go
schema.WithField(entity.NewField().WithName("my_varchar").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(512),
)
```

</TabItem>

<TabItem value='java'>

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

Zilliz Cloud がサポートする数値型は、`Int8`、`Int16`、`Int32`、`Int64`、`Float`、および `Double` です。数値フィールドの詳細については、[Number Field](./use-number-field) を参照してください。

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

<TabItem value='java'>

```javascript
schema.push({
    name: "my_int64",
    data_type: DataType.Int64,
});
```

</TabItem>

<TabItem value='java'>

```go
schema.WithField(entity.NewField().WithName("my_int64").
    WithDataType(entity.FieldTypeInt64),
)
```

</TabItem>

<TabItem value='java'>

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

### Booleanフィールドの追加\{#add-boolean-fields}

Zilliz Cloudはbooleanフィールドをサポートしています。以下のコードスニペットは、booleanフィールドを追加する方法を示しています。

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

<TabItem value='java'>

```javascript
schema.push({
    name: "my_bool",
    data_type: DataType.Boolean,
});
```

</TabItem>

<TabItem value='java'>

```go
schema.WithField(entity.NewField().WithName("my_bool").
    WithDataType(entity.FieldTypeBool),
)
```

</TabItem>

<TabItem value='java'>

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

Milvus では、複合フィールド（composite field）とは、JSON フィールド内のキーまたは 配列 フィールド内のインデックスなど、より小さなサブフィールドに分割可能なフィールドを指します。

### JSON フィールドの追加\{#add-json-fields}

JSON フィールドは通常、半構造化された JSON データを格納します。JSON フィールドの詳細については、[JSON フィールド](./use-json-fields)を参照してください。

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

<TabItem value='java'>

```javascript
schema.push({
    name: "my_json",
    data_type: DataType.JSON,
});
```

</TabItem>

<TabItem value='java'>

```go
schema.WithField(entity.NewField().WithName("my_json").
    WithDataType(entity.FieldTypeJSON),
)
```

</TabItem>

<TabItem value='java'>

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

配列フィールドは、要素のリストを格納します。配列フィールド内のすべての要素のデータ型は同一である必要があります。配列フィールドの詳細については、[配列 Field](./use-array-fields) を参照してください。

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

<TabItem value='java'>

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

<TabItem value='java'>

```go
schema.WithField(entity.NewField().WithName("my_array").
    WithDataType(entity.FieldTypeArray).
    WithElementType(entity.FieldTypeInt64).
    WithMaxLength(512).
    WithMaxCapacity(5),
)
```

</TabItem>

<TabItem value='java'>

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

