---
title: "Nullable & Default | Cloud"
slug: /nullable-and-default
sidebar_label: "Nullable & Default"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、主フィールドを除くスカラーフィールドに対して`nullable`属性とデフォルト値を設定できます。`nullable=True`とマークされたフィールドに対しては、データ挿入時にフィールドをスキップするか、直接null値を設定することができ、システムはそれをエラーなくnullとして扱います。フィールドにデフォルト値がある場合、挿入時にフィールドのデータが指定されていないと、システムは自動的にこの値を適用します。 | Cloud"
type: origin
token: DjROwgK6ziCf7Rkoji6ccyEUnsg
sidebar_position: 14
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - nullable
  - default value
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nullable & Default

Zilliz Cloudでは、主フィールドを除くスカラーフィールドに対して`nullable`属性とデフォルト値を設定できます。`nullable=True`とマークされたフィールドに対しては、データ挿入時にフィールドをスキップするか、直接null値を設定することができ、システムはそれをエラーなくnullとして扱います。フィールドにデフォルト値がある場合、挿入時にフィールドのデータが指定されていないと、システムは自動的にこの値を適用します。

デフォルト値とnullable属性により、null値を持つデータセットの処理およびデフォルト値の設定を保持することを可能にし、他のデータベースシステムからZilliz Cloudへのデータ移行が簡素化されます。コレクションを作成する際に、値が不明確なフィールドに対してnullableを有効にするか、デフォルト値を設定することもできます。

## 制限事項\{#limits}

- 主フィールドを除くスカラーフィールドのみが、デフォルト値とnullable属性をサポートします。

- JSONフィールドとArrayフィールドはデフォルト値をサポートしません。

- デフォルト値またはnullable属性は、コレクション作成時にのみ設定可能で、以降は変更できません。

- nullable属性が有効なスカラーフィールドは、Grouping Searchの`group_by_field`として使用できません。Grouping Searchの詳細については、[Grouping Search](./grouping-search)を参照してください。

- nullableとしてマークされたフィールドは、パーティションキーとして使用できません。パーティションキーの詳細については、[Use Partition Key](./use-partition-key)を参照してください。

- nullable属性が有効なスカラーフィールドにインデックスを作成する場合、null値はインデックスから除外されます。

- **JSONフィールドおよびARRAYフィールド**: JSONまたはARRAYフィールドのフィルタリングに`IS NULL`または`IS NOT NULL`演算子を使用する場合、これらの演算子はカラムレベルで動作し、JSONオブジェクトまたは配列全体がnullかどうかのみを評価します。たとえば、JSONオブジェクト内のキーがnullの場合でも、`IS NULL`フィルターでは認識されません。詳細については、[Basic Operators](./basic-filtering-operators)を参照してください。

## Nullable属性\{#nullable-attribute}

`nullable`属性により、null値をコレクションに保存でき、不明なデータを処理する際の柔軟性を提供します。

### Nullable属性の設定\{#set-the-nullable-attribute}

コレクションを作成する際、`nullable=True`を使用してnullableフィールドを定義します（デフォルトは`False`）。次の例では、`my_collection`という名前のコレクションを作成し、`age`フィールドをnullableとして設定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri='YOUR_CLUSTER_ENDPOINT')

# コレクションスキーマを定義
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_schema=True,
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)
schema.add_field(field_name="age", datatype=DataType.INT64, nullable=True) # Nullableフィールド

# インデックスパラメータを設定
index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_type="AUTOINDEX", metric_type="L2")

# コレクションを作成
client.create_collection(collection_name="my_collection", schema=schema, index_params=index_params)
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

indexes.add(IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());

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
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createCollection({
  collection_name: "my_collection",
  schema: [
    {
      name: "id",
      is_primary_key: true,
      data_type: DataType.int64,
    },
    { name: "vector", data_type: DataType.FloatVector, dim: 5 },

    { name: "age", data_type: DataType.Int64, nullable: true },
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
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
).WithField(entity.NewField().
    WithName("age").
    WithDataType(entity.FieldTypeInt64).
    WithNullable(true),
)

indexOption := milvusclient.NewCreateIndexOption("my_collection", "vector",
    index.NewAutoIndex(index.MetricType(entity.L2)))

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
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
            "indexType": "AUTOINDEX"
        }
    ]'

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

### エンティティの挿入\{#insert-entities}

nullableフィールドにデータを挿入する際は、nullを挿入するか、このフィールドを直接省略してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30},
    {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6], "age": None},
    {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7]}
]

client.insert(collection_name="my_collection", data=data)
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
        .collectionName("my_collection")
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
  collection_name: "my_collection",
  data: data,
});

```

</TabItem>

<TabItem value='go'>

```go
column, _ := column.NewNullableColumnInt64("age",
    []int64{30},
    []bool{true, false, false})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("id", []int64{1, 2, 3}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
        {0.2, 0.3, 0.4, 0.5, 0.6},
        {0.3, 0.4, 0.5, 0.6, 0.7},
    }).
    WithColumns(column),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
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
        {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 30},
        {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6], "age": null},
        {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7]}
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

### null値を使用した検索とクエリ\{#search-and-query-with-null-values}

`search`メソッドを使用する際、フィールドに`null`値が含まれている場合、検索結果はフィールドをnullとして返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.4, 0.3, 0.128]],
    limit=2,
    search_params={"params": {"nprobe": 16}},
    output_fields=["id", "age"]
)

print(res)

# 出力
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
        .collectionName("my_collection")
        .annsField("vector")
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f})))
        .topK(2)
        .searchParams(params)
        .outputFields(Arrays.asList("id", "age"))
        .build());

System.out.println(resp.getSearchResults());

# 出力
#
# [[SearchResp.SearchResult(entity={id=1, age=30}, score=0.0, id=1), SearchResp.SearchResult(entity={id=2, age=null}, score=0.050000004, id=2)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_collection',
    data: [0.3, -0.6, 0.1, 0.3, 0.5],
    limit: 2,
    output_fields: ['age', 'id'],
    params: {
        nprobe: 16
    }
});
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.1, 0.2, 0.4, 0.3, 0.128}

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 16)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    2,                    // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector").
    WithAnnParam(annParam).
    WithOutputFields("id", "age"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("age: ", resultSet.GetColumn("age").FieldData().GetScalars())
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
        [0.1, -0.2, 0.3, 0.4, 0.5]
    ],
    "annsField": "vector",
    "limit": 2,
    "outputFields": ["id", "age"]
}'

#{"code":0,"cost":0,"data":[{"age":30,"distance":0.16000001,"id":1},{"age":null,"distance":0.28999996,"id":2}]}
```

</TabItem>
</Tabs>

`query`メソッドを使用してスカラーでフィルタリングする場合、null値のフィルタリング結果はすべてfalseとなり、選択されません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 以前に挿入したデータを確認：
# {"id": 1, "vector": [0.1, 0.2, ..., 0.128], "age": 30}
# {"id": 2, "vector": [0.2, 0.3, ..., 0.129], "age": None}
# {"id": 3, "vector": [0.3, 0.4, ..., 0.130], "age": None}  # age列の省略はNoneとして扱われる

results = client.query(
    collection_name="my_collection",
    filter="age >= 0",
    output_fields=["id", "age"]
)

# 例の出力：
# [
#     {"id": 1, "age": 30}
# ]
# 注：`age`が`null`（id 2 および 3）のエンティティは結果に表示されません。
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("age >= 0")
        .outputFields(Arrays.asList("id", "age"))
        .build());

System.out.println(resp.getQueryResults());

// 出力
//
// [QueryResp.QueryResult(entity={id=1, age=30})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await client.query({
    collection_name: "my_collection",
    filter: "age >= 0",
    output_fields: ["id", "age"]
});
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("age >= 0").
    WithOutputFields("id", "age"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("id: ", resultSet.GetColumn("id").FieldData().GetScalars())
fmt.Println("age: ", resultSet.GetColumn("age").FieldData().GetScalars())
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
    "filter": "age >= 0",
    "outputFields": ["id", "age"]
}'

# {"code":0,"cost":0,"data":[{"age":30,"id":1}]}
```

</TabItem>
</Tabs>

`null`値を持つエンティティを返すには、以下のようにスカラーによるフィルタリング条件なしでクエリを実行します。

<Admonition type="info" icon="📘" title="ノート">

<p>フィルタリング条件なしで<code>query</code>メソッドを使用すると、null値を持つエンティティを含むコレクション内のすべてのエンティティを取得します。返されるエンティティの数を制限するには、<code>limit</code>パラメータを指定する必要があります。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
null_results = client.query(
    collection_name="my_collection",
    filter="",     # フィルタリング条件なしでクエリを実行
    output_fields=["id", "age"],
    limit=10
)

# 例の出力：
# [{"id": 2, "age": None}, {"id": 3, "age": None}]
```

</TabItem>

<TabItem value='java'>

```java
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("")
        .outputFields(Arrays.asList("id", "age"))
        .limit(10)
        .build());

System.out.println(resp.getQueryResults());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await client.query({
    collection_name: "my_collection",
    filter: "",
    output_fields: ["id", "age"],
    limit: 10
});
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("").
    WithLimit(10).
    WithOutputFields("id", "age"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("id: ", resultSet.GetColumn("id"))
fmt.Println("age: ", resultSet.GetColumn("age"))
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
    "expr": "",
    "outputFields": ["id", "age"],
    "limit": 10
}'

# {"code":0,"cost":0,"data":[{"age":30,"id":1},{"age":null,"id":2},{"age":null,"id":3}]}
```

</TabItem>
</Tabs>

## デフォルト値\{#default-values}

デフォルト値は、スカラーフィールドに割り当てられた事前設定された値です。挿入時にデフォルト値を持つフィールドの値を指定しない場合、システムは自動的にデフォルト値を使用します。

### デフォルト値の設定\{#set-default-values}

コレクションを作成する際、`default_value`パラメータを使用してフィールドのデフォルト値を定義します。次の例では、`age`のデフォルト値を`18`、`status`のデフォルト値を`"active"`に設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
index_params.add_index(field_name="vector", index_type="AUTOINDEX", metric_type="L2")

client.create_collection(collection_name="my_collection", schema=schema, index_params=index_params)
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

indexes.add(IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());

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
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createCollection({
  collection_name: "my_collection",
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
      index_type: IndexType.AUTOINDEX,
    },
  ],
});

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
    // handle error
}

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
).WithField(entity.NewField().
    WithName("age").
    WithDataType(entity.FieldTypeInt64).
    WithDefaultValueLong(18),
).WithField(entity.NewField().
    WithName("status").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(10).
    WithDefaultValueString("active"),
)

indexOption := milvusclient.NewCreateIndexOption("my_collection", "vector",
    index.NewAutoIndex(index.MetricType(entity.L2)))

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
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
            "indexType": "AUTOINDEX"
        }
    ]'

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

### デフォルト値を持つデータの挿入\{#insert-data-with-default-values}

フィールドにデフォルト値が設定されている場合、そのフィールドをデータに含めないことで、システムが自動的にデフォルト値を適用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 25}, # ageは25になる（デフォルト値18は上書き）
    {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6]},           # ageは18になる（デフォルト値）
    {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7], "status": "inactive"} # statusは"inactive"になる
]

client.insert(collection_name="my_collection", data=data)
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
rows.add(gson.fromJson("{\"id\": 1, \"vector\": [0.1, 0.2, 0.3, 0.4, 0.5], \"age\": 25}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 2, \"vector\": [0.2, 0.3, 0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"id\": 3, \"vector\": [0.3, 0.4, 0.5, 0.6, 0.7], \"status\": \"inactive\"}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    { id: 1, vector: [0.1, 0.2, 0.3, 0.4, 0.5], age: 25 },
    { id: 2, vector: [0.2, 0.3, 0.4, 0.5, 0.6] },
    { id: 3, vector: [0.3, 0.4, 0.5, 0.6, 0.7], status: "inactive" },
];

client.insert({
    collection_name: "my_collection",
    data: data,
});
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("id", []int64{1, 2, 3}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
        {0.2, 0.3, 0.4, 0.5, 0.6},
        {0.3, 0.4, 0.5, 0.6, 0.7},
    }).
    WithInt64Column("age", []int64{25, 18}). // 18はデフォルト値
    WithVarcharColumn("status", []string{"active", "active", "inactive"}), // "active"はデフォルト値
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
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
        {"id": 1, "vector": [0.1, 0.2, 0.3, 0.4, 0.5], "age": 25},
        {"id": 2, "vector": [0.2, 0.3, 0.4, 0.5, 0.6]},
        {"id": 3, "vector": [0.3, 0.4, 0.5, 0.6, 0.7], "status": "inactive"}
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

### デフォルト値のクエリ\{#query-default-values}

デフォルト値が設定されているフィールドをクエリすると、対応するデフォルト値が返されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
results = client.query(
    collection_name="my_collection",
    filter="id in [1, 2, 3]",
    output_fields=["id", "age", "status"]
)

print(results)

# 出力例：
# [
#     {"id": 1, "age": 25, "status": "active"},  # ageは25（明示的に指定）、statusはデフォルト値
#     {"id": 2, "age": 18, "status": "active"},  # ageはデフォルト値、statusはデフォルト値
#     {"id": 3, "age": 18, "status": "inactive"} # ageはデフォルト値、statusは明示的に指定
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("id in [1, 2, 3]")
        .outputFields(Arrays.asList("id", "age", "status"))
        .build());

System.out.println(resp.getQueryResults());

// 出力
//
// [QueryResp.QueryResult(entity={id=1, age=25, status=active}), QueryResp.QueryResult(entity={id=2, age=18, status=active}), QueryResp.QueryResult(entity={id=3, age=18, status=inactive})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await client.query({
    collection_name: "my_collection",
    filter: "id in [1, 2, 3]",
    output_fields: ["id", "age", "status"]
});

console.log(results);
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("id in [1, 2, 3]").
    WithOutputFields("id", "age", "status"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("Results: ", resultSet)
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
    "filter": "id in [1, 2, 3]",
    "outputFields": ["id", "age", "status"]
}'

# {"code":0,"cost":0,"data":[{"age":25,"id":1,"status":"active"},{"age":18,"id":2,"status":"active"},{"age":18,"id":3,"status":"inactive"}]}
```

</TabItem>
</Tabs>

## Nullableとデフォルト値の組み合わせ\{#combining-nullable-and-default-values}

`nullable=True`を設定したフィールドにデフォルト値を設定することはできません。これらの属性は互いに排他的です。フィールドにはnull値を許可するか、デフォルト値を設定するかのどちらか一方のみを指定できます。

## 注意事項\{#important-notes}

1. **null値とデフォルト値の優先順位**：
   - null値を明示的に指定した場合、デフォルト値は無視されます。
   - フィールドがnullableでない場合、null値を挿入しようとするとエラーが発生します。

2. **スカラーインデックスとnull値**：
   - nullableフィールドにインデックスを作成すると、null値はインデックスから除外されます。
   - これはフィルタリングおよびクエリ結果に影響を与える可能性があります。

3. **データクエリにおけるnull値の扱い**：
   - null値を持つフィールドは、フィルタリング式で`>=`や`==`などの比較演算子で一致しません。
   - `IS NULL`または`IS NOT NULL`演算子を使用してnull値を明示的に照会する必要があります。

4. **データ型の互換性**：
   - デフォルト値は、フィールドのデータ型と互換性がある必要があります。
   - 例えば、整数型のフィールドに文字列型のデフォルト値を設定すると、エラーになります。

これらのコンセプトを理解し、正しく適用することで、Zilliz Cloudコレクションのデータスキーマを効果的に設計および管理できます。