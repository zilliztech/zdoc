---
title: "スキーマの説明 | BYOC"
slug: /schema-explained
sidebar_label: "スキーマの説明"
beta: FALSE
notebook: FALSE
description: "スキーマはコレクションのデータ構造を定義します。コレクションを作成する前に、スキーマの設計を行う必要があります。このページでは、コレクションのスキーマを理解し、独自のスキーマの例を設計するのに役立ちます。 | BYOC"
type: origin
token: SVrnwFgVEihptQks0BHcthjJnjd
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema explained
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database

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

![K9uAbRdLmoiAHqxR0abcZQTcnGc](/img/K9uAbRdLmoiAHqxR0abcZQTcnGc.png)

検索システムのデータモデル設計には、ビジネスニーズを分析し、情報をスキーマ表現されたデータモデルに抽象化することが含まれます。例えば、テキストの検索は、リテラル文字列を「埋め込む」ことによってベクトルに変換し、ベクトル検索を有効にすることで「インデックス化」する必要があります。この必須要件を超えて、出版タイムスタンプや著者などの他のプロパティを格納する必要がある場合があります。このメタデータにより、特定の日付以降または特定の著者によって公開されたテキストのみを返すフィルタリングを通じて意味検索を洗練することができます。また、これらのスカラーをメインテキストとともに取得して、アプリケーションで検索結果をレンダリングすることもできます。それぞれに、整数または文字列として表されるこれらのテキストピースを整理するための一意の識別子が割り当てられる必要があります。これらの要素は、洗練された検索ロジックを実現するために不可欠です。

よく設計されたスキーマを作成する方法については、「[スキーマデザインハンズオン](./schema-design-hands-on)」を参照してください。

## スキーマの作成{#create-schema}

次のコードスニペットは、スキーマを作成する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='bash'>

```bash
export schema='{
    "fields": []
}'
```

</TabItem>
</Tabs>

## プライマリフィールドを追加{#add_primary_field}

コレクション内のプライマリフィールドは、エンティティを一意に識別します。**Int 64**または**VarChar**の値のみを受け入れます。次のコードスニペットは、プライマリフィールドを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

フィールドを追加する場合、`is_mary`プロパティを`True`に設定することで、フィールドを明示的にプライマリフィールドとして明確にすることができます。プライマリフィールドはデフォルトで**Int 64**値を受け入れます。この場合、プライマリフィールドの値は`12345`に似た整数である必要があります。プライマリフィールドで**VarChar**値を使用する場合、値は`my_entity_1234`に似た文字列である必要があります。

また、`autoId`プロパティを`True`に設定すると、Zilliz Cloudがデータ挿入時にプライマリフィールドの値を自動的に割り当てるようになります。

詳細は、「[プライマリフィールドとAutoID](./primary-field-auto-id)」を参照してください。

## ベクトルフィールドを追加{#add-vector-fields}

ベクトル場は、疎なベクトル埋め込みと密なベクトル埋め込みを受け入れます。Zilliz Cloudでは、4つのベクトル場をコレクションに追加できます。以下のコードスニペットは、ベクトル場を追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

上記のコードスニペットの`dim`パラメータは、ベクトルフィールドに保持されるベクトル埋め込みの次元を示します。`FLOAT_VECTOR`値は、ベクトルフィールドが32ビット浮動小数点数のリストを保持していることを示します。これらは通常、表すために使用されますantilogarithms.Inさらに、Zilliz Cloudは以下の種類のベクトル埋め込みもサポートしています

- `ベクターデータ`

    このタイプのベクトル場は、16ビットの半精度浮動小数点数のリストを保持し、通常はメモリまたはbandwidth-restrictedのディープラーニングまたはGPUベースのコンピューティングシナリオに適用されます。

- `その他のベクトル:`

    このタイプのベクトル場は、精度が低下しているがFloat 32と同じ指数範囲を持つ16ビット浮動小数点数のリストを保持します。このタイプのデータは、精度に大きな影響を与えることなくメモリ使用量を減らすため、深層学習シナリオで一般的に使用されます。

- `バイナリベクトル`

    このタイプのベクトル場は、0と1のリストを保持します。これらは、画像処理や情報検索シナリオでデータを表現するためのコンパクトな特徴として機能します。

- `浮動小数点ベクトル`

    このタイプのベクトル場は、疎なベクトル埋め込みを表す非ゼロの数とそのシーケンス番号のリストを保持します。

## スカラーフィールドを追加{#add-scalar-fields}

一般的な場合、スカラーフィールドを使用して、Zilliz Cloudクラスターに格納されたベクトル埋め込みのメタデータを格納し、メタデータフィルタリングを使用してANN検索を実行して検索結果の正確性を向上させることができます。Zilliz Cloudは、**VarChar**、**Boolean**、**Int**、**Float**、**Double**、**Array**、**JSON**など、複数のスカラーフィールドタイプをサポートしています。

### 文字列フィールドを追加{#add-string-fields}

Zilliz Cloudクラスタでは、VarCharフィールドを使用して文字列を保存できます。VarCharフィールドの詳細については、「[文字列フィールド](./use-string-field)」を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='bash'>

```bash
export varCharField='{
    "fieldName": "my_varchar",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 256
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

Zilliz Cloudがサポートする数値の種類は、`Int 8`、`Int 16`、`Int 32`、`Int 64`、`Float`、`Double`です。数値フィールドの詳細については、「[数字フィールド](./use-number-field)」を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

Zilliz Cloudはブール値フィールドをサポートしています。以下のコードスニペットはブール値フィールドを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

### JSONフィールドを追加{#add-json-fields}

JSONフィールドは通常、半構造化されたJSONデータを格納します。JSONフィールドの詳細については、「[JSONフィールド](./use-json-fields)」を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

配列フィールドは要素のリストを格納します。配列フィールド内のすべての要素のデータ型は同じでなければなりません。配列フィールドの詳細については、「[配列フィールド](./use-array-fields)」を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

