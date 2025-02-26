---
title: "数字フィールド | BYOC"
slug: /use-number-field
sidebar_label: "数字フィールド"
beta: FALSE
notebook: FALSE
description: "数値フィールドは、ベクトル以外の数値データをZilliz Cloudクラスターに格納するために使用されます。これらのフィールドは通常、年齢、価格などのベクトルデータに関連する追加情報を記述するために使用されます。このデータを使用することで、ベクトルをより正確に記述し、データフィルタリングや条件付きクエリの効率を向上させることができます。 | BYOC"
type: origin
token: EJdCwl6J1iOTdIkC3G9cIMRjnjb
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
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 数字フィールド

数値フィールドは、ベクトル以外の数値データをZilliz Cloudクラスターに格納するために使用されます。これらのフィールドは通常、年齢、価格などのベクトルデータに関連する追加情報を記述するために使用されます。このデータを使用することで、ベクトルをより正確に記述し、データフィルタリングや条件付きクエリの効率を向上させることができます。

数字フィールドは、多くのシナリオで特に役立ちます。たとえば、電子商取引の推奨事項では、価格フィールドをフィルタリングに使用できます。ユーザープロファイル分析では、年齢層が結果を絞り込むのに役立ちます。ベクトルデータと組み合わせることで、数字フィールドは、システムが類似性検索を提供しながら、より正確にパーソナライズされたユーザーニーズを満たすのに役立ちます。

## サポートされている数値フィールドタイプ{#supported-number-field-types}

Zilliz Cloudは、さまざまなデータストレージとクエリニーズに対応するために、さまざまな数値フィールドタイプをサポートしています。

<table>
   <tr>
     <th><p>フィールドタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>BOOL</code></p></td>
     <td><p>バイナリ状態を記述するために適した、<code>true</code>または<code>false</code>を格納するためのブール型。</p></td>
   </tr>
   <tr>
     <td><p><code>INT 8</code></p></td>
     <td><p>小さな範囲の整数データを格納するのに適した8ビット整数。</p></td>
   </tr>
   <tr>
     <td><p><code>INT 16</code></p></td>
     <td><p>中程度の整数データ用の16ビット整数。</p></td>
   </tr>
   <tr>
     <td><p><code>INT 32</code></p></td>
     <td><p>32ビット整数は、製品数量やユーザーIDなどの一般的な整数データストレージに最適です。</p></td>
   </tr>
   <tr>
     <td><p><code>INT 64</code></p></td>
     <td><p>タイムスタンプや識別子のような大きな範囲のデータを格納するのに適した64ビット整数。</p></td>
   </tr>
   <tr>
     <td><p><code>フロート</code></p></td>
     <td><p>定格や温度などの一般的な精度が必要なデータ用の32ビット浮動小数点数。</p></td>
   </tr>
   <tr>
     <td><p><code>ダブル</code></p></td>
     <td><p>財務情報や科学計算などの高精度データ用の64ビット倍精度浮動小数点数。</p></td>
   </tr>
</table>

## 数値フィールドを追加{#add-number-field}

Zilliz Cloudクラスターで数値フィールドを使用するには、コレクションスキーマで関連するフィールドを定義し、`datatype`を`BOOL`や`INT8`などのサポートされているタイプに設定します。サポートされている数値フィールドタイプの完全なリストについては、「[サポートされている数値フィールドタイプ](./use-number-field#supported-number-field-types)」を参照してください。

次の例は、数値フィールド`age`と`price`を含むスキーマを定義する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="age", datatype=DataType.INT64)
schema.add_field(field_name="price", datatype=DataType.FLOAT)
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
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Float)
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

<TabItem value='bash'>

```bash
export int64Field='{
    "fieldName": "age",
    "dataType": "Int64"
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
        $floatField,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<p>コレクションを作成する際には、プライマリフィールドとベクトルフィールドは必須です。プライマリフィールドは各エンティティを一意に識別し、ベクトルフィールドは類似検索に重要です。詳細については、「<a href="./primary-field-auto-id">プライマリフィールドとAutoID</a>」、「<a href="./use-dense-vector">密集ベクトル</a>」、「<a href="./use-binary-vector">バイナリベクトル</a>」、または「<a href="./use-sparse-vector">疎ベクトル</a>」を参照してください。</p>

</Admonition>

## インデックスパラメータの設定{#}

数値フィールドのインデックスパラメータの設定はオプションですが、検索効率を大幅に向上させることができます。

以下の例では、`AUTOINDEX`を`age`フィールドに対して作成し、Zilliz Cloudを使用して、データ型に基づいて適切なインデックスを自動的に作成します。詳細については、「[AUTOINDEXの説明](./autoindex-explained)」を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="age",
    index_type="AUTOINDEX",
    index_name="inverted_index"
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

```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = {
    index_name: 'inverted_index',
    field_name: 'age',
    index_type: IndexType.AUTOINDEX,
);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "age",
            "indexName": "inverted_index",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

\<ターゲットを含める="zilliz">

この例では、`AUTOINDEX`を使用して数値フィールドのインデックスを作成します。

\</include>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add vector index
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",  # Use automatic indexing to simplify complex index settings
    metric_type="COSINE"  # Specify similarity metric type, options include L2, COSINE, or IP
)
```

</TabItem>

<TabItem value='java'>

```java
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

## コレクションを作成{#create-collection}

スキーマとインデックスが定義されたら、数値フィールドを含むコレクションを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create Collection
client.create_collection(
    collection_name="your_collection_name",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_scalar_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "my_scalar_collection",
    schema: schema,
    index_params: indexParams
})
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_scalar_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## データの挿入{#insert-data}

コレクションを作成した後、数値フィールドを含むデータを挿入できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"age": 25, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"age": 30, "price": 149.50, "pk": 2, "embedding": [0.4, 0.5, 0.6]},
    {"age": 35, "price": 199.99, "pk": 3, "embedding": [0.7, 0.8, 0.9]},
]

client.insert(
    collection_name="my_scalar_collection",
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
rows.add(gson.fromJson("{\"age\": 30, \"price\": 149.50, \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 35, \"price\": 199.99, \"pk\": 3, \"embedding\": [0.7, 0.8, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_scalar_collection")
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
  collection_name: "my_scalar_collection",
  data: data,
});

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
    "collectionName": "my_scalar_collection"
}'
```

</TabItem>
</Tabs>

この例では、`年齢`、`価格`、`pk`(プライマリフィールド)、およびベクトル表現(`埋め込み`)を含むデータを挿入します。挿入されたデータがスキーマで定義されたフィールドと一致することを確認するために、エラーを避けるために事前にデータ型を確認することをお勧めします。

スキーマを定義する際に`enable_dynamic_fields=True`を設定した場合、Zilliz Cloudでは、事前に定義されていない数値フィールドを挿入することができます。ただし、これによりクエリや管理が複雑になり、パフォーマンスに影響を与える可能性があることに注意してください。詳細については、「[ダイナミックフィールド](./enable-dynamic-field)」を参照してください。

## 検索とクエリ{#search-and-query}

数値フィールドを追加した後、それらを使用して検索およびクエリ操作でフィルタリングし、より正確な検索結果を得ることができます。

### クエリのフィルター{#filter-queries}

数値フィールドを追加した後、クエリのフィルタリングに使用できます。例えば、`age`が30歳から40歳の間のすべてのエンティティをクエリできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "30 <= age <= 40"

res = client.query(
    collection_name="my_scalar_collection",
    filter=filter,
    output_fields=["age","price"]
)

print(res)

# Output
# data: ["{'age': 30, 'price': np.float32(149.5), 'pk': 2}", "{'age': 35, 'price': np.float32(199.99), 'pk': 3}"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "30 <= age <= 40";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_scalar_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price"))
        .build());
System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={price=149.5, pk=2, age=30}), QueryResp.QueryResult(entity={price=199.99, pk=3, age=35})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_scalar_collection',
    filter: '30 <= age <= 40',
    output_fields: ['age', 'price']
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_scalar_collection",
    "filter": "30 <= age <= 40",
    "outputFields": ["age","price"]
}'

## {"code":0,"cost":0,"data":[{"age":30,"pk":2,"price":149.5},{"age":35,"pk":3,"price":199.99}]}
```

</TabItem>
</Tabs>

このクエリ式は、一致するすべてのエンティティを返し、その`年齢`と`価格`フィールドを出力します。フィルタークエリの詳細については、「[フィルタリング](./filtering)」を参照してください。

### 数値フィルタリングによるベクトル検索{#vector-search-with-number-filtering}

基本的な数値フィールドフィルタリングに加えて、ベクトル類似検索と数値フィールドフィルタを組み合わせることができます。例えば、次のコードはベクトル検索に数値フィールドフィルタを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "25 <= age <= 35"

res = client.search(
    collection_name="my_scalar_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["age","price"],
    filter=filter
)

print(res)

# Output
# data: ["[{'id': 1, 'distance': -0.06000000238418579, 'entity': {'age': 25, 'price': 99.98999786376953}}, {'id': 2, 'distance': -0.12000000476837158, 'entity': {'age': 30, 'price': 149.5}}, {'id': 3, 'distance': -0.18000000715255737, 'entity': {'age': 35, 'price': 199.99000549316406}}]"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "25 <= age <= 35";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_scalar_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("age", "price"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={price=199.99, age=35}, score=-0.19054288, id=3), SearchResp.SearchResult(entity={price=149.5, age=30}, score=-0.20163085, id=2), SearchResp.SearchResult(entity={price=99.99, age=25}, score=-0.2364331, id=1)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_scalar_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['age', 'price'],
    filter: '25 <= age <= 35'
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_scalar_collection",
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

この例では、まずクエリベクトルを定義し、検索中に`25<=age<=35`というフィルタ条件を追加します。これにより、検索結果がクエリベクトルに似ているだけでなく、指定された年齢範囲を満たすことが保証されます。詳細については、「[フィルタリング](./filtering)」を参照してください。