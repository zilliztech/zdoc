---
title: "配列フィールド | Cloud"
slug: /use-array-fields
sidebar_label: "配列フィールド"
beta: FALSE
notebook: FALSE
description: "Array型は、同じデータ型の複数の値を含むフィールドを格納するために使用されます。複数の要素を持つ属性を格納する柔軟な方法を提供し、関連するデータのセットを保存する必要があるシナリオで特に役立ちます。Zilliz Cloudクラスターでは、Arrayフィールドをベクトルデータと一緒に格納でき、より複雑なクエリやフィルタリング要件を可能にします。 | Cloud"
type: origin
token: H0cIwNvgTiIIYykQqRycBbNSnEU
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - array field
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 配列フィールド

Array型は、同じデータ型の複数の値を含むフィールドを格納するために使用されます。複数の要素を持つ属性を格納する柔軟な方法を提供し、関連するデータのセットを保存する必要があるシナリオで特に役立ちます。Zilliz Cloudクラスターでは、Arrayフィールドをベクトルデータと一緒に格納でき、より複雑なクエリやフィルタリング要件を可能にします。

例えば、音楽推薦システムでは、Arrayフィールドは曲のタグのリストを保存できます。ユーザー行動分析では、曲のユーザー評価を保存できます。以下は典型的なArrayフィールドの例です

```json
{
  "tags": ["pop", "rock", "classic"],
  "ratings": [5, 4, 3]
}
```

この例では、`tags`と`ratings`は両方ともArrayフィールドです。`tags`フィールドは、ポップ、ロック、クラシックなどの曲のジャンルを表す文字列配列であり、評価フィールドは、1から5までのユーザーの`ratings`を表す整数配列です。これらのArrayフィールドは、マルチバリューデータを柔軟に格納する方法を提供し、クエリやフィルタリング中に詳細な分析を行いやすくします。

## 配列フィールドを追加{#add-array-field}

Array fieldsを使用するにはZilliz Cloudクラスター、コレクションスキーマを作成する際に関連するフィールドタイプを定義します。この過程には以下が含まれます:

1. サポートされるArrayデータ型である`ARRAY`にデータ型を設定します。

1. 配列内の要素のデータ型を指定するには、`element_type`パラメータを使用します。これは、Zilliz Cloudクラスターでサポートされている任意のスカラーデータ型である必要があります。例えば、`VARCHAR`や`INT64`などです。同じ配列内のすべての要素は同じデータ型でなければなりません。

1. 配列の最大容量、つまり含むことができる要素の最大数を定義するために、`max_capacity`パラメータを使用します。

配列フィールドを含むコレクションスキーマを定義する方法は次のとおりです:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

# Add an Array field with elements of type VARCHAR
schema.add_field(field_name="tags", datatype=DataType.ARRAY, element_type=DataType.VARCHAR, max_capacity=10)
# Add an Array field with elements of type INT64
schema.add_field(field_name="ratings", datatype=DataType.ARRAY, element_type=DataType.INT64, max_capacity=5)

# Add primary field
schema.add_field(field_name="pk", datatype=DataType.INT64, is_primary=True)

# Add vector field
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
        .fieldName("tags")
        .dataType(DataType.Array)
        .elementType(DataType.VarChar)
        .maxCapacity(10)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("ratings")
        .dataType(DataType.Array)
        .elementType(DataType.Int64)
        .maxCapacity(5)
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
    name: "tags",
    data_type: DataType.Array,
    element_type: DataType.VarChar,
    max_capacity: 10,
    max_length: 65535
  },
  {
    name: "rating",
    data_type: DataType.Array,
    element_type: DataType.Int64,
    max_capacity: 5,
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
export arrayField1='{
    "fieldName": "tags",
    "dataType": "Array",
    "elementDataType": "VarChar",
    "elementTypeParams": {
        "max_capacity": 10,
        "max_length": 100
    }
}'

export arrayField2='{
    "fieldName": "ratings",
    "dataType": "Array",
    "elementDataType": "Int64",
    "elementTypeParams": {
        "max_capacity": 5
    }
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
        $arrayField1,
        $arrayField2,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

この例では:

- `tags`は`element_type`が`VARCHAR`に設定された文字列配列であり、配列内の要素は文字列でなければならないことを示しています。`max_Capacity`は10に設定されており、配列には最大10個の要素を含めることができます。

- `rating`は`element_type`が`INT64`に設定された整数配列であり、要素は整数でなければならないことを示しています。`max_Capacity`は5に設定されており、最大5つの評価が可能です。

- また、主キーフィールド`pk`とベクトルフィールドの`埋め込み`を追加します。

<Admonition type="info" icon="📘" title="ノート">

<p>コレクションを作成する際には、プライマリフィールドとベクトルフィールドは必須です。プライマリフィールドは各エンティティを一意に識別し、ベクトルフィールドは類似検索に重要です。詳細については、「<a href="./primary-field-auto-id">プライマリフィールドとAutoID</a>」、「<a href="./use-dense-vector">密集ベクトル</a>」、「<a href="./use-binary-vector">バイナリベクトル</a>」、または「<a href="./use-sparse-vector">疎ベクトル</a>」を参照してください。</p>

</Admonition>

## インデックスパラメータの設定{#set-index-params}

配列フィールドのインデックスパラメータの設定はオプションですが、検索効率を大幅に向上させることができます。

次の例では、`AUTOINDEX`を`タグ`フィールドに作成します。つまり、Zilliz Cloudクラスターは、データ型に基づいて適切なスカラーインデックスを自動的に作成します。詳細については、「[AUTOINDEXの説明](./autoindex-explained)」を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Prepare index parameters
index_params = client.prepare_index_params()  # Prepare IndexParams object

index_params.add_index(
    field_name="tags",  # Name of the Array field to index
    index_type="AUTOINDEX",  # Index type
    index_name="inverted_index"  # Index name
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("tags")
        .indexName("inverted_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    index_name: 'inverted_index',
    field_name: 'tags',
    index_type: IndexType.AUTOINDEX,
)];
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "tags",
            "indexName": "inverted_index",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

さらに、コレクションを作成する前にベクトルフィールドのインデックスを作成する必要があります。この例では、ベクトルインデックスの設定を簡素化するために`AUTOINDEX`を使用しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add vector index
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",  # Use automatic indexing to simplify complex index settings
    metric_type="COSINE"  # Specify similarity metric type, such as L2, COSINE, or IP
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
    index_type: IndexType.AUTOINDEX,
});
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "tags",
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

定義されたスキーマとインデックスパラメータを使用して、コレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_array_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_array_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "my_array_collection",
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
    \"collectionName\": \"my_array_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## データの挿入{#insert-data}

コレクションを作成した後、配列フィールドを含むデータを挿入できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {
        "tags": ["pop", "rock", "classic"],
        "ratings": [5, 4, 3],
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    },
    {
        "tags": ["jazz", "blues"],
        "ratings": [4, 5],
        "pk": 2,
        "embedding": [0.78, 0.91, 0.23]
    },
    {
        "tags": ["electronic", "dance"],
        "ratings": [3, 3, 4],
        "pk": 3,
        "embedding": [0.67, 0.45, 0.89]
    }
]

client.insert(
    collection_name="my_array_collection",
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
rows.add(gson.fromJson("{\"tags\": [\"pop\", \"rock\", \"classic\"], \"ratings\": [5, 4, 3], \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"tags\": [\"jazz\", \"blues\"], \"ratings\": [4, 5], \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"tags\": [\"electronic\", \"dance\"], \"ratings\": [3, 3, 4], \"pk\": 3, \"embedding\": [0.7, 0.8, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_array_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {
        "tags": ["pop", "rock", "classic"],
        "ratings": [5, 4, 3],
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    },
    {
        "tags": ["jazz", "blues"],
        "ratings": [4, 5],
        "pk": 2,
        "embedding": [0.78, 0.91, 0.23]
    },
    {
        "tags": ["electronic", "dance"],
        "ratings": [3, 3, 4],
        "pk": 3,
        "embedding": [0.67, 0.45, 0.89]
    }
];

client.insert({
  collection_name: "my_array_collection",
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
        {
        "tags": ["pop", "rock", "classic"],
        "ratings": [5, 4, 3],
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    },
    {
        "tags": ["jazz", "blues"],
        "ratings": [4, 5],
        "pk": 2,
        "embedding": [0.78, 0.91, 0.23]
    },
    {
        "tags": ["electronic", "dance"],
        "ratings": [3, 3, 4],
        "pk": 3,
        "embedding": [0.67, 0.45, 0.89]
    }       
    ],
    "collectionName": "my_array_collection"
}'
```

</TabItem>
</Tabs>

この例では:

- 各データエントリにはプライマリフィールド(`pk`)が含まれ、`tags`と`ratings`はタグと評価を格納するために使用される配列フィールドです。

- `embedding`は、ベクトル類似性検索に使用される3次元ベクトル場です。

## 検索とクエリ{#search-and-query}

配列フィールドを使用すると、検索中にスカラーフィルタリングが可能になり、Milvusのベクトル検索機能が強化されます。ベクトル類似検索とともに、配列フィールドのプロパティに基づいてクエリを実行できます。

### クエリのフィルター{#filter-queries}

特定の要素へのアクセスや、配列要素が特定の条件を満たすかどうかのチェックなど、Arrayフィールドのプロパティに基づいてデータをフィルタリングできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'ratings[0] < 4'

res = client.query(
    collection_name="my_array_collection",
    filter=filter,
    output_fields=["tags", "ratings", "embedding"]
)

print(res)

# Output
# data: ["{'pk': 3, 'tags': ['electronic', 'dance'], 'ratings': [3, 3, 4], 'embedding': [np.float32(0.67), np.float32(0.45), np.float32(0.89)]}"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "ratings[0] < 4";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_array_collection")
        .filter(filter)
        .outputFields(Arrays.asList("tags", "ratings", "embedding"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={ratings=[3, 3, 4], pk=3, embedding=[0.7, 0.8, 0.9], tags=[electronic, dance]})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_array_collection',
    filter: 'ratings[0] < 4',
    output_fields: ['tags', 'ratings', 'embedding']
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
    "collectionName": "my_array_collection",
    "filter": "ratings[0] < 4",
    "outputFields": ["tags", "ratings", "embedding"]
}'
# {"code":0,"cost":0,"data":[{"embedding":[0.67,0.45,0.89],"pk":3,"ratings":{"Data":{"LongData":{"data":[3,3,4]}}},"tags":{"Data":{"StringData":{"data":["electronic","dance"]}}}}]}
```

</TabItem>
</Tabs>

このクエリでは、Zilliz Cloudクラスターは、`ratings`配列の最初の要素が小なり4であるエンティティをフィルタリングし、条件に一致するエンティティを返します。

### 配列フィルタリングによるベクトル検索{#vector-search-with-array-filtering}

ベクトル類似性と配列フィルタリングを組み合わせることで、検索されたデータが意味的に類似しているだけでなく、特定の条件を満たしていることを確認でき、検索結果をより正確にし、ビジネスニーズに合わせることができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'tags[0] == "pop"'

res = client.search(
    collection_name="my_array_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["tags", "ratings", "embedding"],
    filter=filter
)

print(res)

# Output
# data: ["[{'id': 1, 'distance': 1.1276001930236816, 'entity': {'ratings': [5, 4, 3], 'embedding': [0.11999999731779099, 0.3400000035762787, 0.5600000023841858], 'tags': ['pop', 'rock', 'classic']}}]"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "tags[0] == \"pop\"";
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_array_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("tags", "ratings", "embedding"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={ratings=[5, 4, 3], embedding=[0.1, 0.2, 0.3], tags=[pop, rock, classic]}, score=-0.2364331, id=1)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_array_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['tags', 'ratings', 'embdding'],
    filter: 'tags[0] == "pop"'
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
    "collectionName": "my_array_collection",
    "data": [
        [0.3, -0.6, 0.1]
    ],
    "annsField": "embedding",
    "limit": 5,
    "filter": "tags[0] == \"pop\"",
    "outputFields": ["tags", "ratings", "embedding"]
}'

# {"code":0,"cost":0,"data":[{"distance":-0.24793813,"embedding":[0.12,0.34,0.56],"id":1,"ratings":{"Data":{"LongData":{"data":[5,4,3]}}},"tags":{"Data":{"StringData":{"data":["pop","rock","classic"]}}}}]}
```

</TabItem>
</Tabs>

この例では、Zilliz Cloudは、`タグ`配列の最初の要素が`"pop"`であるクエリベクトルに最も似た上位5つのエンティティを返します。

さらに、Zilliz Cloudは、`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、`ARRAY_LENGTH`などの高度な配列フィルタリング演算子をサポートしています。詳細については、「[アレイ演算子](./array-filtering-operators)」を参照してください。

## 限界{#limits}

- **データ型**:配列フィールド内のすべての要素は、`element_type`で指定された同じデータ型でなければなりません。

- **Array Capacity**: Arrayフィールドの要素数は、Arrayが作成されたときに定義された最大容量に小なりまたは等しくなければなりません。`max_Capacity`で指定されています。

- **文字列処理**:配列フィールド内の文字列値は、意味的なエスケープや変換なしにそのまま保存されます。例えば、`'a"b'`、`"a'b"`、`'a\'b'`、および`"a\"b"`は入力されたまま保存されますが、`'a'b'`と`"a"b"`は無効な値と見なされます。

