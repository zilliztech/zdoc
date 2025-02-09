---
title: "文字列フィールド | BYOC"
slug: /use-string-field
sidebar_label: "文字列フィールド"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudクラスターでは、`VARCHAR`は可変長文字列を格納するために使用されるデータ型です。シングルバイト文字とマルチバイト文字の両方の文字列を格納でき、最大長は60,535文字です。`VARCHAR`フィールドを定義する場合、最大長パラメータ`maxlength`も指定する必要があります。`VARCHAR`文字列型は、テキストデータを効率的かつ柔軟に格納および管理する方法を提供するため、さまざまな長さの文字列を処理するアプリケーションに最適です。 | BYOC"
type: origin
token: KIOaw0B1ziqB43kJgafcYQRWnyh
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - string field
  - varchar field
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 文字列フィールド

Zilliz Cloudクラスターでは、`VARCHAR`は可変長文字列を格納するために使用されるデータ型です。シングルバイト文字とマルチバイト文字の両方の文字列を格納でき、最大長は60,535文字です。`VARCHAR`フィールドを定義する場合、最大長パラメータ`max_length`も指定する必要があります。`VARCHAR`文字列型は、テキストデータを効率的かつ柔軟に格納および管理する方法を提供するため、さまざまな長さの文字列を処理するアプリケーションに最適です。

## VARCHARフィールドを追加{#add-varchar-field}{#varcharadd-varchar-field}

コレクションを作成する際に、Zilliz Cloudクラスターで文字列データを使用するには、`VARCHAR`フィールドを定義してください。このプロセスには以下が含まれます:

1. `datatype`をサポートされている文字列データ型、つまり`VARCHAR`に設定します。

1. 使用して文字列型の最大長を指定、`max_length`パラメーター、60,535文字を超えることはできません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# define schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="varchar_field1", datatype=DataType.VARCHAR, max_length=100)
schema.add_field(field_name="varchar_field2", datatype=DataType.VARCHAR, max_length=200)
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
        .fieldName("varchar_field1")
        .dataType(DataType.VarChar)
        .maxLength(100)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("varchar_field2")
        .dataType(DataType.VarChar)
        .maxLength(200)
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
    name: "metadata",
    data_type: DataType.JSON,
  },
  {
    name: "pk",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "varchar_field2",
    data_type: DataType.VarChar,
    max_length: 200,
  },
  {
    name: "varchar_field1",
    data_type: DataType.VarChar,
    max_length: 100,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export varcharField1='{
    "fieldName": "varchar_field1",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 100
    }
}'

export varcharField2='{
    "fieldName": "varchar_field2",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 200
    }
}'

export primaryField='{
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
        $varcharField1,
        $varcharField2,
        $primaryField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

この例では、2つの`VARCHAR`フィールド、`varchar_field 1`と`varchar_field 2`を追加します。最大長はそれぞれ100文字と200文字に設定されています。データの特性に基づいて`max_length`を設定することをお勧めします。これにより、過剰なスペース割り当てを回避しながら最長のデータを収容できます。さらに、プライマリフィールド`pk`とベクトルフィールド`埋め込み`を追加しました。

<Admonition type="info" icon="📘" title="ノート">

<p>コレクションを作成する際には、プライマリフィールドとベクトルフィールドは必須です。プライマリフィールドは各エンティティを一意に識別し、ベクトルフィールドは類似検索に重要です。詳細については、「<a href="./primary-field-auto-id">プライマリフィールドとAutoID</a>」、「<a href="./use-dense-vector">密集ベクトル</a>」、「<a href="./use-binary-vector">バイナリベクトル</a>」、または「<a href="./use-sparse-vector">疎ベクトル</a>」を参照してください。</p>

</Admonition>

## インデックスパラメータの設定{#set-index-params}{#set-index-params}

VARCHARフィールドのインデックスパラメータの設定はオプションですが、取得効率を大幅に向上させることができます。

次の例では、`AUTOINDEX`を`varchar_field1`に対して作成します。つまり、Zilliz Cloudは、データ型に基づいて適切なインデックスを自動的に作成します。詳細については、「[AUTOINDEXの説明](./autoindex-explained)」を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="varchar_field1",
    index_type="AUTOINDEX",
    index_name="varchar_index"
)
```

</TabItem>

<TabItem value='java'>

```java

import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("varchar_field1")
        .indexName("varchar_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    index_name: 'varchar_index',
    field_name: 'varchar_field1',
    index_type: IndexType.AUTOINDEX,
)];
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "varchar_field1",
            "indexName": "varchar_index",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

\<ターゲットを含める="zilliz">

この例では、VarCharフィールドのインデックスを作成するために`AUTOINDEX`を使用しています。

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
indexParams.push({
    index_name: 'embedding_index',
    field_name: 'embedding',
    metric_type: MetricType.COSINE,
    index_type: IndexType.AUTOINDEX,
});
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "varchar_field1",
            "indexName": "varchar_index",
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

## コレクションを作成{#create-collection}{#create-collection}

スキーマとインデックスが定義されたら、文字列フィールドを含むコレクションを作成できます。

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
        .collectionName("my_varchar_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "my_varchar_collection",
    schema: schema,
    index_params: index_params
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
    \"collectionName\": \"my_varchar_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
## {"code":0,"data":{}}
```

</TabItem>
</Tabs>

## データの挿入{#insert-data}{#insert-data}

コレクションを作成した後、文字列フィールドを含むデータを挿入できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"varchar_field1": "Product A", "varchar_field2": "High quality product", "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"varchar_field1": "Product B", "varchar_field2": "Affordable price", "pk": 2, "embedding": [0.4, 0.5, 0.6]},
    {"varchar_field1": "Product C", "varchar_field2": "Best seller", "pk": 3, "embedding": [0.7, 0.8, 0.9]},
]

client.insert(
    collection_name="my_varchar_collection",
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
rows.add(gson.fromJson("{\"varchar_field1\": \"Product A\", \"varchar_field2\": \"High quality product\", \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"Product B\", \"varchar_field2\": \"Affordable price\", \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"varchar_field1\": \"Product C\", \"varchar_field2\": \"Best seller\", \"pk\": 3, \"embedding\": [0.7, 0.8, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_varchar_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  {
    varchar_field1: "Product A",
    varchar_field2: "High quality product",
    pk: 1,
    embedding: [0.1, 0.2, 0.3],
  },
  {
    varchar_field1: "Product B",
    varchar_field2: "Affordable price",
    pk: 2,
    embedding: [0.4, 0.5, 0.6],
  },
  {
    varchar_field1: "Product C",
    varchar_field2: "Best seller",
    pk: 3,
    embedding: [0.7, 0.8, 0.9],
  },
];
client.insert({
  collection_name: "my_sparse_collection",
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
        {"varchar_field1": "Product A", "varchar_field2": "High quality product", "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"varchar_field1": "Product B", "varchar_field2": "Affordable price", "pk": 2, "embedding": [0.4, 0.5, 0.6]},
    {"varchar_field1": "Product C", "varchar_field2": "Best seller", "pk": 3, "embedding": [0.7, 0.8, 0.9]}       
    ],
    "collectionName": "my_varchar_collection"
}'

## {"code":0,"cost":0,"data":{"insertCount":3,"insertIds":[1,2,3]}}
```

</TabItem>
</Tabs>

この例では、`VARCHAR`フィールド(`varchar_field1`および`varchar_field2`)、プライマリフィールド(`pk`)、およびベクトル表現(`embedding`)を含むデータを挿入します。挿入されるデータがスキーマで定義されたフィールドと一致することを確認するには、挿入エラーを回避するために事前にデータ型を確認することをお勧めします。

スキーマを定義する際に`enable_dynamic_fields=True`を設定した場合、Zilliz Cloudでは、事前に定義されていない文字列フィールドを挿入することができます。ただし、これによりクエリや管理が複雑になり、パフォーマンスに影響を与える可能性があることに注意してください。詳細については、「[ダイナミックフィールド](./enable-dynamic-field)」を参照してください。

## 検索とクエリ{#search-and-query}{#search-and-query}

文字列フィールドを追加した後、検索やクエリ操作でフィルタリングに使用して、より正確な検索結果を得ることができます。

### クエリのフィルター{#filter-queries}{#filter-queries}

文字列フィールドを追加した後、クエリでこれらのフィールドを使用して結果をフィルタリングできます。たとえば、`varchar_field 1`が`"Product A"`に等しいすべてのエンティティをクエリできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'varchar_field1 == "Product A"'

res = client.query(
    collection_name="my_varchar_collection",
    filter=filter,
    output_fields=["varchar_field1", "varchar_field2"]
)

print(res)

# Output
# data: ["{'varchar_field1': 'Product A', 'varchar_field2': 'High quality product', 'pk': 1}"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "varchar_field1 == \"Product A\"";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_varchar_collection")
        .filter(filter)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={varchar_field1=Product A, varchar_field2=High quality product, pk=1})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_varchar_collection',
    filter: 'varchar_field1 == "Product A"',
    output_fields: ['varchar_field1', 'varchar_field2']
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
    "collectionName": "my_varchar_collection",
    "filter": "varchar_field1 == \"Product A\"",
    "outputFields": ["varchar_field1", "varchar_field2"]
}'
## {"code":0,"cost":0,"data":[{"pk":1,"varchar_field1":"Product A","varchar_field2":"High quality product"}]}
```

</TabItem>
</Tabs>

このクエリ式は、一致するすべてのエンティティを返し、その`varchar_field 1`および`varchar_field 2`フィールドを出力します。フィルタークエリの詳細については、「Filtering」を参照してください。

### 文字列フィルタリングによるベクトル検索{#vector-search-with-string-filtering}{#vector-search-with-string-filtering}

基本的なスカラー場フィルタリングに加えて、ベクトル類似検索をスカラー場フィルターと組み合わせることができます。例えば、次のコードはベクトル検索にスカラー場フィルターを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'varchar_field1 == "Product A"'

res = client.search(
    collection_name="my_varchar_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["varchar_field1", "varchar_field2"],
    filter=filter
)

print(res)

# Output
# data: ["[{'id': 1, 'distance': -0.06000000238418579, 'entity': {'varchar_field1': 'Product A', 'varchar_field2': 'High quality product'}}]"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "varchar_field1 == \"Product A\"";
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_varchar_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("varchar_field1", "varchar_field2"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={varchar_field1=Product A, varchar_field2=High quality product}, score=-0.2364331, id=1)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_varchar_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['varchar_field1', 'varchar_field2'],
    filter: 'varchar_field1 == "Product A"'
    params: {
       nprobe:10
    }
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
    "collectionName": "my_varchar_collection",
    "data": [
        [0.3, -0.6, 0.1]
    ],
    "limit": 5,
    "searchParams":{
        "params":{"nprobe":10}
    },
    "outputFields": ["varchar_field1", "varchar_field2"],
    "filter": "varchar_field1 == \"Product A\""
}'

## {"code":0,"cost":0,"data":[{"distance":-0.2364331,"id":1,"varchar_field1":"Product A","varchar_field2":"High quality product"}]}
```

</TabItem>
</Tabs>

この例では、まずクエリベクトルを定義し、検索中に`varchar_field 1=="Product A"`というフィルター条件を追加します。これにより、検索結果がクエリベクトルに似ているだけでなく、指定された文字列フィルター条件にも一致することが保証されます。詳細については、「[フィルタリング](./filtering)」を参照してください。