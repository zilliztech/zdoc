---
title: "Boolean & Number | BYOC"
slug: /use-number-field
sidebar_label: "Boolean & Number"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Booleanまたはnumberフィールドは、Boolean値または数値を格納するスカラーフィールドです。これらの値は、2つの可能な値のいずれか、または整数（**integers**）と小数（**floating-point numbers**）のいずれかです。これらは通常、数量、測定値、または論理的または数学的に処理する必要があるデータを表すために使用されます。 | BYOC"
type: origin
token: EwArwXCOPip15hkSvvpciAMJnSe
sidebar_position: 7
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - number field
  - int
  - integer
  - float
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Boolean & Number

Booleanまたはnumberフィールドは、Boolean値または数値を格納するスカラーフィールドです。これらの値は、2つの可能な値のいずれか、または整数（**integers**）と小数（**floating-point numbers**）のいずれかです。これらは通常、数量、測定値、または論理的または数学的に処理する必要があるデータを表すために使用されます。

以下の表は、Zilliz Cloudクラスターで利用可能なnumberフィールドのデータ型を説明しています。

<table>
   <tr>
     <th><p>フィールド型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>BOOL</code></p></td>
     <td><p><code>true</code>または<code>false</code>を格納するためのBoolean型で、2値状態を記述するのに適しています。</p></td>
   </tr>
   <tr>
     <td><p><code>INT8</code></p></td>
     <td><p>8ビット整数で、小範囲の整数データを格納するのに適しています。</p></td>
   </tr>
   <tr>
     <td><p><code>INT16</code></p></td>
     <td><p>16ビット整数で、中程度の範囲の整数データ用です。</p></td>
   </tr>
   <tr>
     <td><p><code>INT32</code></p></td>
     <td><p>32ビット整数で、商品数量やユーザーIDなどの一般的な整数データ保存に最適です。</p></td>
   </tr>
   <tr>
     <td><p><code>INT64</code></p></td>
     <td><p>64ビット整数で、タイムスタンプや識別子など、大範囲データの保存に適しています。</p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT</code></p></td>
     <td><p>32ビット浮動小数点数で、評価や温度などの一般精度が必要なデータ用です。</p></td>
   </tr>
   <tr>
     <td><p><code>DOUBLE</code></p></td>
     <td><p>64ビット倍精度浮動小数点数で、財務情報や科学計算など、高精度データ用です。</p></td>
   </tr>
</table>

Booleanフィールドを宣言するには、単に`datatype`を`BOOL`に設定します。Numberフィールドを宣言するには、利用可能な数値データ型のいずれかに設定します。たとえば、整数フィールドには`DataType.INT64`、浮動小数点フィールドには`DataType.FLOAT`を設定します。

<Admonition type="info" icon="📘" title="注釈">

<p>Zilliz Cloudはbooleanおよびnumberフィールドのnull値とデフォルト値をサポートしています。これらの機能を有効にするには、<code>nullable</code>を<code>True</code>に、<code>default_value</code>を数値に設定します。詳細については、<a href="./nullable-and-default">Nullable & Default</a>を参照してください。</p>

</Admonition>

## BooleanおよびNumberフィールドの追加\{#add-boolean-and-number-fields}

Booleanまたは数値データを保存するには、コレクションスキーマで対応する型のフィールドを定義します。以下は、2つのnumberフィールドを持つコレクションスキーマの例です：

- `age`：整数データを格納し、null値を許可し、デフォルト値が`18`です。

- `broken`：Booleanデータを格納し、null値を許可しますが、デフォルト値は設定されていません。

- `price`：浮動小数点データを格納し、null値を許可しますが、デフォルト値は設定されていません。

<Admonition type="info" icon="📘" title="注釈">

<p>スキーマ定義時に<code>enable_dynamic_fields=True</code>を設定すると、Zilliz Cloudは事前に定義されていないスカラーフィールドの挿入を許可します。ただし、これによりクエリや管理の複雑さが増し、パフォーマンスに影響を与える可能性があります。詳細については、<a href="./enable-dynamic-field">Dynamic Field</a>を参照してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 必要なライブラリをインポート
from pymilvus import MilvusClient, DataType

# サーバーアドレスを定義
SERVER_ADDR = "YOUR_CLUSTER_ENDPOINT"

# MilvusClientインスタンスを作成
client = MilvusClient(uri=SERVER_ADDR)

# コレクションスキーマを定義
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

# null値をサポートし、デフォルト値が18のINT64フィールド`age`を追加
schema.add_field(field_name="age", datatype=DataType.INT64, nullable=True, default_value=18)
schema.add_field(field_name="broken", datatype=DataType.BOOL, nullable=True)
# null値をサポートするFLOATフィールド`price`を追加（デフォルト値なし）
schema.add_field(field_name="price", datatype=DataType.FLOAT, nullable=True)
schema.add_field(field_name="pk", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=3)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        .isNullable(true)
        .defaultValue(18)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("broken")
        .dataType(DataType.BOOL)
        .isNullable(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Float)
        .isNullable(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("pk")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(3)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
const schema = [
  {
    name: "age",
    data_type: DataType.Int64,
  },
  {
    name: "broken",
    data_type: DataType.Bool,
  },
  {
    name: "price",
    data_type: DataType.Float,
  },
  {
    name: "pk",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "embedding",
    data_type: DataType.FloatVector,
    dim: 3,
  },
];

```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("pk").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(3),
).WithField(entity.NewField().
    WithName("price").
    WithDataType(entity.FieldTypeFloat).
    WithNullable(true),
).WithField(entity.NewField().
    WithName("age").
    WithDataType(entity.FieldTypeInt64).
    WithNullable(true).
    WithDefaultValueLong(18),
).WithField(entity.NewField().
    WithName("broken").
    WithDataType(entity.FieldTypeBool).
    WithNullable(true),
```

</TabItem>

<TabItem value='bash'>

```bash
export int64Field='{
    "fieldName": "age",
    "dataType": "Int64"
}'

export boolField='{
    "fieldName": "broken",
    "dataType": "Bool"
}'

export floatField='{
    "fieldName": "price",
    "dataType": "Float"
}'

export pkField='{
    "fieldName": "pk",
    "dataType": "Int64",
    "isPrimary": true
}'

export vectorField='{
    "fieldName": "embedding",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 3
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $int64Field,
        $boolField,
        $floatField,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

## インデックスパラメータの設定\{#set-index-params}

インデックス作成は、検索およびクエリのパフォーマンス向上に役立ちます。Zilliz Cloudクラスターでは、ベクトルフィールドのインデックス作成は必須ですが、スカラーフィールドでは任意です。

以下の例では、ベクトルフィールド`embedding`とスカラーフィールド`age`の両方に`AUTOINDEX`インデックスタイプを使用してインデックスを作成します。このタイプでは、Milvusがデータ型に基づいて最も適切なインデックスを自動的に選択します。詳細については、[AUTOINDEXの説明](./autoindex-explained)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# インデックスパラメータを設定

index_params = client.prepare_index_params()

# AUTOINDEXで`age`をインデックス化
index_params.add_index(
    field_name="age",
    index_type="AUTOINDEX",
    index_name="age_index"
)

# AUTOINDEXで`embedding`をインデックス化し、類似性メトリックタイプを指定
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",  # 自動インデックスを使用して複雑なインデックス設定を簡略化
    metric_type="COSINE"  # 類似性メトリックタイプを指定。オプションにはL2、COSINE、またはIPが含まれます
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("age")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());

indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { IndexType } from "@zilliz/milvus2-sdk-node";
const indexParams = [
  {
    field_name: "age",
    index_name: "inverted_index",
    index_type: IndexType.AUTOINDEX,
  },
  {
    field_name: "embedding",
    metric_type: "COSINE",
    index_type: IndexType.AUTOINDEX,
  },
];
```

</TabItem>

<TabItem value='go'>

```go
indexOption1 := milvusclient.NewCreateIndexOption("my_collection", "embedding",
    index.NewAutoIndex(index.MetricType(entity.IP)))
indexOption2 := milvusclient.NewCreateIndexOption("my_collection", "age",
    index.NewInvertedIndex())
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "age",
            "indexName": "inverted_index",
            "indexType": "AUTOINDEX"
        },
        {
            "fieldName": "embedding",
            "metricType": "COSINE",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

## コレクションの作成\{#create-collection}

スキーマとインデックスが定義されたら、numberフィールドを含むコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# コレクションを作成
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    index_params: indexParams
})
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption1, indexOption2))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## データ挿入\{#insert-data}

コレクションを作成した後、スキーマに一致するエンティティを挿入します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# サンプルデータ
data = [
    {"age": 25, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"age": 30, "pk": 2, "embedding": [0.4, 0.5, 0.6]}, # `price`フィールドが欠落しており、nullになる必要があります
    {"age": None, "price": None, "pk": 3, "embedding": [0.2, 0.3, 0.1]},  # `age`はデフォルトで18、`price`はnull
    {"age": 45, "price": None, "pk": 4, "embedding": [0.9, 0.1, 0.4]},  # `price`はnull
    {"age": None, "price": 59.99, "pk": 5, "embedding": [0.8, 0.5, 0.3]},  # `age`はデフォルトで18
    {"age": 60, "price": None, "pk": 6, "embedding": [0.1, 0.6, 0.9]}  # `price`はnull
]

client.insert(
    collection_name="my_collection",
    data=data
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
rows.add(gson.fromJson("{\"age\": 25, \"price\": 99.99, \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 30, \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": null, \"price\": null, \"pk\": 3, \"embedding\": [0.2, 0.3, 0.1]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 45, \"price\": null, \"pk\": 4, \"embedding\": [0.9, 0.1, 0.4]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": null, \"price\": 59.99, \"pk\": 5, \"embedding\": [0.8, 0.5, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 60, \"price\": null, \"pk\": 6, \"embedding\": [0.1, 0.6, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  { age: 25, price: 99.99, pk: 1, embedding: [0.1, 0.2, 0.3] },
  { age: 30, price: 149.5, pk: 2, embedding: [0.4, 0.5, 0.6] },
  { age: 35, price: 199.99, pk: 3, embedding: [0.7, 0.8, 0.9] },
];

client.insert({
  collection_name: "my_collection",
  data: data,
});

```

</TabItem>

<TabItem value='go'>

```go
column1, _ := column.NewNullableColumnFloat("price",
    []float32{99.99, 59.99},
    []bool{true, false, false, false, true, false})
column2, _ := column.NewNullableColumnInt64("age",
    []int64{25, 30, 45, 60},
    []bool{true, true, false, true, false, true})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("pk", []int64{1, 2, 3, 4, 5, 6}).
    WithFloatVectorColumn("embedding", 3, [][]float32{
        {0.1, 0.2, 0.3},
        {0.4, 0.5, 0.6},
        {0.2, 0.3, 0.1},
        {0.9, 0.1, 0.4},
        {0.8, 0.5, 0.3},
        {0.1, 0.6, 0.9},
    }).
    WithColumns(column1, column2),
)
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"age": 25, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
        {"age": 30, "price": 149.50, "pk": 2, "embedding": [0.4, 0.5, 0.6]},
        {"age": 35, "price": 199.99, "pk": 3, "embedding": [0.7, 0.8, 0.9]}
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## フィルター式を使用したクエリ\{#query-with-filter-expressions}

エンティティを挿入した後、`query`メソッドを使用して指定されたフィルター式に一致するエンティティを取得します。

`age`が30より大きいエンティティを取得するには：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'age > 30'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# 例の出力:
# data: [
#     "{'age': 45, 'price': None, 'pk': 4}",
#     "{'age': 60, 'price': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "age > 30";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// 出力
//
// [
//    QueryResp.QueryResult(entity={price=null, pk=4, age=45}),
//    QueryResp.QueryResult(entity={price=null, pk=6, age=60})
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_collection',
    filter: 'age > 30',
    output_fields: ['age', 'price', 'pk']
});
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > 30"
queryResult, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
fmt.Println("pk", queryResult.GetColumn("pk").FieldData().GetScalars())
fmt.Println("age", queryResult.GetColumn("age").FieldData().GetScalars())
fmt.Println("price", queryResult.GetColumn("price").FieldData().GetScalars())
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": "age > 30",
    "outputFields": ["age","price", "pk"]
}'

## {"code":0,"cost":0,"data":[{"age":30,"pk":2,"price":149.5},{"age":35,"pk":3,"price":199.99}]}
```

</TabItem>
</Tabs>

`price`がnullであるエンティティを取得するには：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'price is null'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# 例の出力:
# data: [
#     "{'age': 30, 'price': None, 'pk': 2}",
#     "{'age': 18, 'price': None, 'pk': 3}",
#     "{'age': 45, 'price': None, 'pk': 4}",
#     "{'age': 60, 'price': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "price is null";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// 出力
// [
//    QueryResp.QueryResult(entity={price=null, pk=2, age=30}),
//    QueryResp.QueryResult(entity={price=null, pk=3, age=18}),
//    QueryResp.QueryResult(entity={price=null, pk=4, age=45}),
//    QueryResp.QueryResult(entity={price=null, pk=6, age=60})
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
const filter = 'price is null';

const res = await client.query({
    collection_name:"my_collection",
    filter:filter,
    output_fields=["age", "price", "pk"]
});

console.log(res);

// 例の出力:
// data: [
//     "{'age': 18, 'price': None, 'pk': 3}",
//     "{'age': 18, 'price': 59.99, 'pk': 5}"
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter = "price is null"
queryResult, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
  "collectionName": "my_collection",
  "filter": "price is null",
  "outputFields": ["age", "price", "pk"]
}'
```

</TabItem>
</Tabs>

`age`が値`18`を持っているエンティティを取得するには、以下の式を使用します。`age`のデフォルト値は`18`なので、予想される結果には`age`が明示的に`18`に設定されたエンティティまたは`age`がnullに設定されたエンティティが含まれる必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'age == 18'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# 例の出力:
# data: [
#     "{'age': 18, 'price': None, 'pk': 3}",
#     "{'age': 18, 'price': 59.99, 'pk': 5}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "age == 18";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// 出力
// [
//    QueryResp.QueryResult(entity={price=null, pk=3, age=18}),
//    QueryResp.QueryResult(entity={price=59.99, pk=5, age=18})
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
const filter = 'age == 18';

const res = await client.query({
    collection_name:"my_collection",
    filter:filter,
    output_fields=["age", "price", "pk"]
});

console.log(res);

// 例の出力:
// data: [
//     "{'age': 18, 'price': None, 'pk': 3}",
//     "{'age': 18, 'price': 59.99, 'pk': 5}"
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter = "age == 18"
queryResult, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
  "collectionName": "my_collection",
  "filter": "age == 18",
  "outputFields": ["age", "price", "pk"]
}'
```

</TabItem>
</Tabs>

## フィルター式を用いたベクトル検索\{#vector-search-with-filter-expressions}

基本的なnumberフィールドのフィルタリングに加えて、ベクトル類似性検索をnumberフィールドフィルターと組み合わせることができます。たとえば、以下のコードはベクトル検索にnumberフィールドフィルターを追加する方法を示しています：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "25 <= age <= 35"

res = client.search(
    collection_name="my_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["age","price"],
    filter=filter
)

print(res)

# 例の出力:
# data: [
#     "[{'id': 2, 'distance': -0.2016308456659317, 'entity': {'age': 30, 'price': None}}, {'id': 1, 'distance': -0.23643313348293304, 'entity': {'age': 25, 'price': 99.98999786376953}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "25 <= age <= 35";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("age", "price"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// 出力
//
// [
//   [
//     SearchResp.SearchResult(entity={price=null, age=30}, score=-0.20163085, id=2),
//     SearchResp.SearchResult(entity={price=99.99, age=25}, score=-0.23643313, id=1)
//   ]
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['age', 'price'],
    filter: '25 <= age <= 35'
});
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3, -0.6, 0.1}
filter = "25 <= age <= 35"

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 10)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithFilter(filter).
    WithAnnParam(annParam).
    WithOutputFields("age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("age: ", resultSet.GetColumn("age"))
    fmt.Println("price: ", resultSet.GetColumn("price"))
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.3, -0.6, 0.1]
    ],
    "annsField": "embedding",
    "limit": 5,
    "outputFields": ["age", "price"]
}'

## {"code":0,"cost":0,"data":[{"age":35,"distance":-0.19054288,"id":3,"price":199.99},{"age":30,"distance":-0.20163085,"id":2,"price":149.5},{"age":25,"distance":-0.2364331,"id":1,"price":99.99}]}
```

</TabItem>
</Tabs>

この例では、まずクエリベクトルを定義し、検索中にフィルター条件`25 <= age <= 35`を追加します。これにより、検索結果はクエリベクトルと類似しているだけでなく、指定された年齢範囲を満たします。詳細については、[フィルタリング](./filtering)を参照してください.

