---
title: "Nullableデフォルト | BYOC"
slug: /nullable-and-default
sidebar_label: "Nullableデフォルト"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudを使用すると、プライマリフィールドを除くスカラーフィールドの`nullable`属性とデフォルト値を設定できます。`nullable=True`としてマークされたフィールドの場合、データを挿入するときにフィールドをスキップするか、直接null値に設定すると、システムはエラーを引き起こすことなくnullとして扱います。フィールドにデフォルト値がある場合、挿入中にフィールドにデータが指定されていない場合、システムは自動的にこの値を適用します。 | BYOC"
type: origin
token: MoOdww8nbiV1Tvkpvu3cIV9Kn1R
sidebar_position: 11
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - nullable
  - default value
  - vector database
  - IVF
  - knn
  - Image Search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nullableデフォルト

Zilliz Cloudを使用すると、プライマリフィールドを除くスカラーフィールドの`nullable`属性とデフォルト値を設定できます。`nullable=True`としてマークされたフィールドの場合、データを挿入するときにフィールドをスキップするか、直接null値に設定すると、システムはエラーを引き起こすことなくnullとして扱います。フィールドにデフォルト値がある場合、挿入中にフィールドにデータが指定されていない場合、システムは自動的にこの値を適用します。

デフォルト値とnullable属性は、null値を持つデータセットの処理を可能にし、デフォルト値の設定を保持することで、他のデータベースシステムからZilliz Cloudへのデータ移行を効率化します。コレクションを作成する際に、値が不確定なフィールドに対してnullableを有効にしたり、デフォルト値を設定することもできます。

## 限界{#limits}

- プライマリフィールドを除くスカラーフィールドのみが、デフォルト値とnull許容属性をサポートしています。

- JSONとArrayフィールドはデフォルト値をサポートしていません。

- デフォルト値またはnullable属性は、コレクションの作成時にのみ構成でき、その後は変更できません。

- null属性が有効なスカラーフィールドは、グルーピング検索の`group_by_field`として使用できません。グルーピング検索の詳細については、「[グループ検索](./grouping-search)」を参照してください。

- NULLとマークされたフィールドはパーティションキーとして使用できません。パーティションキーの詳細については、「[パーティションキーを使う](./use-partition-key)」を参照してください。

- null属性を有効にしたスカラーフィールドにインデックスを作成すると、インデックスからnull値が除外されます。

## Nullableな属性{#nullable-attribute}

Nullable属性を使用すると、コレクションにnull値を格納できるため、未知のデータを柔軟に処理できます。

### null許容属性を設定する{#null}

コレクションを作成する場合は、`nullable=True`を使用してnullableフィールドを定義します（デフォルトは`False`）。次の例では、`user_profiles_null`という名前のコレクションを作成し、`age`フィールドをnullableに設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri='YOUR_CLUSTER_ENDPOINT')

# Define collection schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_schema=True,
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)
schema.add_field(field_name="age", datatype=DataType.INT64, nullable=True) # Nullable field

# Set index params
index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_type="IVF_FLAT", metric_type="L2", params={ "nlist": 128 })

# Create collection
client.create_collection(collection_name="user_profiles_null", schema=schema, index_params=index_params)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
        
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        .isNullable(true)
        .build());

List<IndexParam> indexes = new ArrayList<>();
Map<String,Object> extraParams = new HashMap<>();
extraParams.put("nlist", 128);
indexes.add(IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.IVF_FLAT)
        .metricType(IndexParam.MetricType.L2)
        .extraParams(extraParams)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("user_profiles_null")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createCollection({
  collection_name: "user_profiles_null",
  schema: [
    {
      name: "id",
      is_primary_key: true,
      data_type: DataType.int64,
    },
    { name: "vector", data_type: DataType.Int64, dim: 5 },

    { name: "age", data_type: DataType.FloatVector, nullable: true },
  ],

  index_params: [
    {
      index_name: "vector_inde",
      field_name: "vector",
      metric_type: MetricType.L2,
      index_type: IndexType.AUTOINDEX,
    },
  ],
});

```

</TabItem>

<TabItem value='bash'>

```bash
export pkField='{
    "fieldName": "id",
    "dataType": "Int64",
    "isPrimary": true
}'

export vectorField='{
    "fieldName": "vector",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 5
    }
}'

export nullField='{
    "fieldName": "age",
    "dataType": "Int64",
    "nullable": true
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $pkField,
        $vectorField,
        $nullField
    ]
}"

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "L2",
            "indexType": "IVF_FLAT",
            "params":{"nlist": 128}
        }
    ]'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"user_profiles_null\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

### エンティティを挿入{#insert-entities}

`null`許容フィールドにデータを挿入する場合は、`null`を挿入するか、このフィールドを直接省略してください

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30},
    {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6], "age": None},
    {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7]}
]

client.insert(collection_name="user_profiles_null", data=data)
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
rows.add(gson.fromJson("{\"id\": 1, \"vector\": [0.1, 0.2, 0.3, 0.4, 0.5], \"age\": 30}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 2, \"vector\": [0.2, 0.3, 0.4, 0.5, 0.6], \"age\": null}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 3, \"vector\": [0.3, 0.4, 0.5, 0.6, 0.7]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("user_profiles_null")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  { id: 1, vector: [0.1, 0.2, 0.3, 0.4, 0.5], age: 30 },
  { id: 2, vector: [0.2, 0.3, 0.4, 0.5, 0.6], age: null },
  { id: 3, vector: [0.3, 0.4, 0.5, 0.6, 0.7] },
];

client.insert({
  collection_name: "user_profiles_null",
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
        {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30},
        {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6], "age": null}, 
        {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7]} 
    ],
    "collectionName": "user_profiles_null"
}'
```

</TabItem>
</Tabs>

### NULL値を使用した検索とクエリ{#search-and-query-with-null-values}

この`search`メソッドを使用した場合、フィールドに`null`値が含まれている場合、検索結果はそのフィールドをnullとして返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="user_profiles_null",
    data=[[0.1, 0.2, 0.4, 0.3, 0.128]],
    limit=2,
    search_params={"params": {"nprobe": 16}},
    output_fields=["id", "age"]
)

print(res)

# Output
# data: ["[{'id': 1, 'distance': 0.15838398039340973, 'entity': {'age': 30, 'id': 1}}, {'id': 2, 'distance': 0.28278401494026184, 'entity': {'age': None, 'id': 2}}]"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

Map<String,Object> params = new HashMap<>();
params.put("nprobe", 16);
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("user_profiles_null")
        .annsField("vector")
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f})))
        .topK(2)
        .searchParams(params)
        .outputFields(Arrays.asList("id", "age"))
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={id=1, age=30}, score=0.0, id=1), SearchResp.SearchResult(entity={id=2, age=null}, score=0.050000004, id=2)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'user_profiles_null',
    data: [0.3, -0.6, 0.1, 0.3, 0.5],
    limit: 2,
    output_fields: ['age', 'id'],
    filter: '25 <= age <= 35',
    params: {
        nprobe: 16
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
    "collectionName": "user_profiles_null",
    "data": [
        [0.1, -0.2, 0.3, 0.4, 0.5]
    ],
    "annsField": "vector",
    "limit": 5,
    "outputFields": ["id", "age"]
}'

#{"code":0,"cost":0,"data":[{"age":30,"distance":0.16000001,"id":1},{"age":null,"distance":0.28999996,"id":2},{"age":null,"distance":0.52000004,"id":3}]}
```

</TabItem>
</Tabs>

スカラーフィルターに`query`メソッドを使用すると、null値のフィルター結果はすべてfalseになり、選択されないことを示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Reviewing previously inserted data:
# {"id": 1, "vector": [0.1, 0.2, ..., 0.128], "age": 30}
# {"id": 2, "vector": [0.2, 0.3, ..., 0.129], "age": None}
# {"id": 3, "vector": [0.3, 0.4, ..., 0.130], "age": None}  # Omitted age  column is treated as None

results = client.query(
    collection_name="user_profiles_null",
    filter="age >= 0",
    output_fields=["id", "age"]
)

# Example output:
# [
#     {"id": 1, "age": 30}
# ]
# Note: Entities with `age` as `null` (id 2 and 3) will not appear in the result.
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("user_profiles_null")
        .filter("age >= 0")
        .outputFields(Arrays.asList("id", "age"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={id=1, age=30})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await client.query(
    collection_name: "user_profiles_null",
    filter: "age >= 0",
    output_fields: ["id", "age"]
);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "user_profiles_null",
    "filter": "age >= 0",
    "outputFields": ["id", "age"]
}'

# {"code":0,"cost":0,"data":[{"age":30,"id":1}]}
```

</TabItem>
</Tabs>

値が`null`のエンティティをクエリするには、空の式`""`を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
null_results = client.query(
    collection_name="user_profiles_null",
    filter="",
    output_fields=["id", "age"]
)

# Example output:
# [{"id": 2, "age": None}, {"id": 3, "age": None}]
```

</TabItem>

<TabItem value='java'>

```java
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("user_profiles_null")
        .filter("")
        .outputFields(Arrays.asList("id", "age"))
        .limit(10)
        .build());

System.out.println(resp.getQueryResults());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await client.query(
    collection_name: "user_profiles_null",
    filter: "",
    output_fields: ["id", "age"]
);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "user_profiles_null",
    "expr": "",
    "outputFields": ["id", "age"]
}'

# {"code":0,"cost":0,"data":[{"age":30,"id":1},{"age":null,"id":2},{"age":null,"id":3}]}
```

</TabItem>
</Tabs>

## デフォルト値{#default-values}

デフォルト値は、スカラーフィールドに割り当てられたプリセット値です。挿入時にデフォルトのフィールドに値を指定しない場合、システムは自動的にデフォルト値を使用します。

### デフォルト値を設定{#set-default-values}

コレクションを作成する際には、`default_value`パラメータを使用してフィールドのデフォルト値を定義します。以下の例では、`age`のデフォルト値を`18`に設定し、`status`を`"active"`に設定する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_schema=True,
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)
schema.add_field(field_name="age", datatype=DataType.INT64, default_value=18)
schema.add_field(field_name="status", datatype=DataType.VARCHAR, default_value="active", max_length=10)

index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_type="IVF_FLAT", metric_type="L2", params={ "nlist": 128 })

client.create_collection(collection_name="user_profiles_default", schema=schema, index_params=index_params)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

import java.util.*;

CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        .defaultValue(18L)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("status")
        .dataType(DataType.VarChar)
        .maxLength(10)
        .defaultValue("active")
        .build());

List<IndexParam> indexes = new ArrayList<>();
Map<String,Object> extraParams = new HashMap<>();
extraParams.put("nlist", 128);
indexes.add(IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.IVF_FLAT)
        .metricType(IndexParam.MetricType.L2)
        .extraParams(extraParams)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("user_profiles_default")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createCollection({
  collection_name: "user_profiles_default",
  schema: [
    {
      name: "id",
      is_primary_key: true,
      data_type: DataType.int64,
    },
    { name: "vector", data_type: DataType.FloatVector, dim: 5 },
    { name: "age", data_type: DataType.Int64, default_value: 18 },
    { name: 'status', data_type: DataType.VarChar, max_length: 30, default_value: 'active'},
  ],

  index_params: [
    {
      index_name: "vector_inde",
      field_name: "vector",
      metric_type: MetricType.L2,
      index_type: IndexType.IVF_FLAT,
    },
  ],
});

```

</TabItem>

<TabItem value='bash'>

```bash
export pkField='{
    "fieldName": "id",
    "dataType": "Int64",
    "isPrimary": true
}'

export vectorField='{
    "fieldName": "vector",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 5
    }
}'

export defaultValueField1='{
    "fieldName": "age",
    "dataType": "Int64",
    "defaultValue": 18
}'

export defaultValueField2='{
    "fieldName": "status",
    "dataType": "VarChar",
    "defaultValue": "active",
    "elementTypeParams": {
        "max_length": 10
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $pkField,
        $vectorField,
        $defaultValueField1,
        $defaultValueField2
    ]
}"

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "L2",
            "indexType": "IVF_FLAT",
            "params":{"nlist": 128}
        }
    ]'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"user_profiles_default\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

### エンティティを挿入{#insert-entities}

データを挿入するとき、デフォルト値のフィールドを省略するか、値をnullに設定すると、システムはデフォルト値を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"id": 1, "vector": [0.1, 0.2, ..., 0.128], "age": 30, "status": "premium"},
    {"id": 2, "vector": [0.2, 0.3, ..., 0.129]},  # `age` and `status` use default values
    {"id": 3, "vector": [0.3, 0.4, ..., 0.130], "age": 25, "status": None},  # `status` uses default value
    {"id": 4, "vector": [0.4, 0.5, ..., 0.131], "age": None, "status": "inactive"}  # `age` uses default value
]

client.insert(collection_name="user_profiles_default", data=data)
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
rows.add(gson.fromJson("{\"id\": 1, \"vector\": [0.1, 0.2, 0.3, 0.4, 0.5], \"age\": 30, \"status\": \"premium\"}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 2, \"vector\": [0.2, 0.3, 0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 3, \"vector\": [0.3, 0.4, 0.5, 0.6, 0.7], \"age\": 25, \"status\": null}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 4, \"vector\": [0.4, 0.5, 0.6, 0.7, 0.8], \"age\": null, \"status\": \"inactive\"}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("user_profiles_default")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30, "status": "premium"},
    {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6]}, 
    {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7], "age": 25, "status": null}, 
    {"id": 4, "vector": [0.4, 0.5, 0.6, 0.7, 0.8], "age": null, "status": "inactive"}  
];

client.insert({
  collection_name: "user_profiles_default",
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
        {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30, "status": "premium"},
        {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6]},
        {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7], "age": 25, "status": null}, 
        {"id": 4, "vector": [0.4, 0.5, 0.6, 0.7, 0.8], "age": null, "status": "inactive"}      
    ],
    "collectionName": "user_profiles_default"
}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<p>nullableとデフォルト値の設定がどのように有効になるかについては、適用されるルールを参照<a href="./nullable-and-default#applicable-rules">してください</a>。</p>

</Admonition>

### デフォルト値を使用した検索とクエリ{#search-and-query-with-default-values}

デフォルト値を含むエンティティは、ベクトル検索やスカラーフィルターで他のエンティティと同じように扱われます。`検索`や`クエリ`操作の一部としてデフォルト値を含めることができます。

例えば、`検索`操作では、`年齢`がデフォルト値の`18`に設定されたエンティティが結果に含まれます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="user_profiles_default",
    data=[[0.1, 0.2, 0.4, 0.3, 0.128]],
    search_params={"params": {"nprobe": 16}},
    filter="age == 18",  # 18 is the default value of the `age` field
    limit=10,
    output_fields=["id", "age", "status"]
)

print(res)

# Output
# data: ["[{'id': 2, 'distance': 0.28278401494026184, 'entity': {'id': 2, 'age': 18, 'status': 'active'}}, {'id': 4, 'distance': 0.8315839767456055, 'entity': {'id': 4, 'age': 18, 'status': 'inactive'}}]"] 

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

Map<String,Object> params = new HashMap<>();
params.put("nprobe", 16);
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("user_profiles_default")
        .annsField("vector")
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f})))
        .searchParams(params)
        .filter("age == 18")
        .topK(10)
        .outputFields(Arrays.asList("id", "age", "status"))
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={id=2, age=18, status=active}, score=0.050000004, id=2), SearchResp.SearchResult(entity={id=4, age=18, status=inactive}, score=0.45000002, id=4)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'user_profiles_default',
    data: [0.3, -0.6, 0.1, 0.3, 0.5],
    limit: 2,
    output_fields: ['age', 'id', 'status'],
    filter: 'age == 18',
    params: {
        nprobe: 16
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
    "collectionName": "user_profiles_default",
    "data": [
        [0.1, 0.2, 0.3, 0.4, 0.5]
    ],
    "annsField": "vector",
    "limit": 5,
    "filter": "age == 18",
    "outputFields": ["id", "age", "status"]
}'

# {"code":0,"cost":0,"data":[{"age":18,"distance":0.050000004,"id":2,"status":"active"},{"age":18,"distance":0.45000002,"id":4,"status":"inactive"}]}
```

</TabItem>
</Tabs>

クエリ操作で`は`、デフォルト値を直接一致またはフィルタリングできます

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query all entities where `age` equals the default value (18)
default_age_results = client.query(
    collection_name="user_profiles_default",
    filter="age == 18",
    output_fields=["id", "age", "status"]
)

# Query all entities where `status` equals the default value ("active")
default_status_results = client.query(
    collection_name="user_profiles_default",
    filter='status == "active"',
    output_fields=["id", "age", "status"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

QueryResp ageResp = client.query(QueryReq.builder()
        .collectionName("user_profiles_default")
        .filter("age == 18")
        .outputFields(Arrays.asList("id", "age", "status"))
        .build());

System.out.println(ageResp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={id=2, age=18, status=active}), QueryResp.QueryResult(entity={id=4, age=18, status=inactive})]

QueryResp statusResp = client.query(QueryReq.builder()
        .collectionName("user_profiles_default")
        .filter("status == \"active\"")
        .outputFields(Arrays.asList("id", "age", "status"))
        .build());

System.out.println(statusResp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={id=2, age=18, status=active}), QueryResp.QueryResult(entity={id=3, age=25, status=active})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Query all entities where `age` equals the default value (18)
const default_age_results = await client.query(
    collection_name: "user_profiles_default",
    filter: "age == 18",
    output_fields: ["id", "age", "status"]
);
// Query all entities where `status` equals the default value ("active")
const default_status_results = await client.query(
    collection_name: "user_profiles_default",
    filter: 'status == "active"',
    output_fields: ["id", "age", "status"]
)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "user_profiles_default",
    "filter": "age == 18",
    "outputFields": ["id", "age", "status"]
}'

# {"code":0,"cost":0,"data":[{"age":18,"id":2,"status":"active"},{"age":18,"id":4,"status":"inactive"}]}

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "user_profiles_default",
    "filter": "status == \"active\"",
    "outputFields": ["id", "age", "status"]
}'

# {"code":0,"cost":0,"data":[{"age":18,"id":2,"status":"active"},{"age":25,"id":3,"status":"active"}]}
```

</TabItem>
</Tabs>

## 適用ルール{#applicable-rules}

以下の表は、異なる構成の組み合わせにおけるnull許容列とデフォルト値の動作をまとめたものです。これらのルールは、Zilliz Cloudがnull値を挿入しようとした場合やフィールド値が提供されなかった場合にデータを処理する方法を決定します。

<table>
   <tr>
     <th><p>Nullableは無効です。</p></th>
     <th><p>デフォルト値</p></th>
     <th><p>デフォルト値の型</p></th>
     <th><p>ユーザー入力</p></th>
     <th><p>結果を表示</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>非null</p></td>
     <td><p>なし/null</p></td>
     <td><p>デフォルト値を使用する</p></td>
     <td><p>フィールド:<code>age</code> デフォルト値:<code>18</code></p><p>ユーザー入力: null</p><p>結果:として保存<code>18</code></p></td>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>-</p></td>
     <td><p>なし/null</p></td>
     <td><p>nullとして保存</p></td>
     <td><p>フィールド:<code>middle_name</code> デフォルト値:-</p><p>ユーザー入力: null</p><p>結果: nullとして保存</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>非null</p></td>
     <td><p>なし/null</p></td>
     <td><p>デフォルト値を使用する</p></td>
     <td><p>フィールド:<code>status</code> デフォルト値:<code>"active"</code></p><p>ユーザー入力: null</p><p>結果:"active"として保存されました。</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>-</p></td>
     <td><p>なし/null</p></td>
     <td><p>エラーをスローする</p></td>
     <td><p>フィールド:<code>email</code> デフォルト値:-</p><p>ユーザー入力: null</p><p>結果:操作が拒否され、システムがエラーをスローします</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>null</p></td>
     <td><p>なし/null</p></td>
     <td><p>エラーをスローする</p></td>
     <td><p>フィールド:<code>username</code> デフォルト値: null</p><p>ユーザー入力: null</p><p>結果:操作が拒否され、システムがエラーをスローします</p></td>
   </tr>
</table>

