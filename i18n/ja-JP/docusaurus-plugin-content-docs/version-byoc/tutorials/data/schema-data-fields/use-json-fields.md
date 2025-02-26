---
title: "JSONフィールド | BYOC"
slug: /use-json-fields
sidebar_label: "JSONフィールド"
beta: FALSE
notebook: FALSE
description: "JSONは、複雑なデータ構造を格納およびクエリする柔軟な方法を提供する軽量データ交換形式です。Zilliz Cloudクラスターでは、JSONフィールドを使用してベクトルデータと一緒に追加の構造化情報を格納でき、ベクトルの類似性と構造化フィルタリングを組み合わせた高度な検索およびクエリが可能になります。 | BYOC"
type: origin
token: DOUswo6Y8iXFeNkYc1xcX1QBnkc
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - json field
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSONフィールド

[JSON](https://en.wikipedia.org/wiki/JSON)(Java Script Object Notation)は、複雑なデータ構造を格納およびクエリする柔軟な方法を提供する軽量データ交換形式です。Zilliz Cloudクラスターでは、JSONフィールドを使用してベクトルデータと一緒に追加の構造化情報を格納でき、ベクトルの類似性と構造化フィルタリングを組み合わせた高度な検索およびクエリが可能になります。

JSONフィールドは、検索結果を最適化するためにメタデータが必要なアプリケーションに最適です。例えば、eコマースでは、カテゴリー、価格、ブランドなどの属性で製品ベクトルを強化することができます。レコメンデーションシステムでは、ユーザーベクトルを好みや人口統計情報と組み合わせることができます。以下は典型的なJSONフィールドの例です

```python
{
  "category": "electronics",
  "price": 99.99,
  "brand": "BrandA"
}
```

## JSONフィールドを追加する{#add-json-field}

JSONフィールドを使用するにはZilliz Cloudクラスター、コレクションスキーマで関連するフィールドタイプを定義し、`datatype`をサポートされているJSONタイプ、つまり`JSON`に設定します。

JSONフィールドを含むコレクションスキーマを定義する方法は次のとおりです:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="metadata", datatype=DataType.JSON)
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
        .fieldName("metadata")
        .dataType(DataType.JSON)
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
    name: "embedding",
    data_type: DataType.FloatVector,
    dim: 3,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export jsonField='{
    "fieldName": "metadata",
    "dataType": "JSON"
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
        $jsonField,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

この例では、`メタデータ`というJSONフィールドを追加して、商品カテゴリ、価格、ブランド情報などのベクトルデータに関連する追加のメタデータを格納します。

<Admonition type="info" icon="📘" title="ノート">

<p>コレクションを作成する際には、プライマリフィールドとベクトルフィールドは必須です。プライマリフィールドは各エンティティを一意に識別し、ベクトルフィールドは類似検索に重要です。詳細については、「<a href="./primary-field-auto-id">プライマリフィールドとAutoID</a>」、「<a href="./use-dense-vector">密集ベクトル</a>」、「<a href="./use-binary-vector">バイナリベクトル</a>」、または「<a href="./use-sparse-vector">疎ベクトル</a>」を参照してください。</p>

</Admonition>

## コレクションを作成{#create-collection}

コレクションを作成する際には、検索性能を確保するためにベクトル場のインデックスを作成する必要があります。この例では、インデックスの設定を簡単にするために`AUTOINDEX`を使用しています。詳細については、「[AUTOINDEXの説明](./autoindex-explained)」を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = {
    index_name: 'embedding_index',
    field_name: 'embedding',
    metricType: MetricType.CONSINE,
    index_type: IndexType.AUTOINDEX,
);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "embedding",
            "metricType": "COSINE",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

定義されたスキーマとインデックスパラメータを使用して、コレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_json_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_json_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "my_json_collection",
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
    \"collectionName\": \"my_json_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## データの挿入{#insert-data}

コレクションを作成した後、JSONフィールドを含むデータを挿入できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Data to be inserted
data = [
  {
      "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "metadata": {"category": "home_appliances", "price": 249.99, "brand": "BrandB"},
      "pk": 2,
      "embedding": [0.56, 0.78, 0.90]
  },
  {
      "metadata": {"category": "furniture", "price": 399.99, "brand": "BrandC"},
      "pk": 3,
      "embedding": [0.91, 0.18, 0.23]
  }
]

# Insert data into the collection
client.insert(
    collection_name="your_collection_name",
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
rows.add(gson.fromJson("{\"metadata\": {\"category\": \"electronics\", \"price\": 99.99, \"brand\": \"BrandA\"}, \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"metadata\": {\"category\": \"home_appliances\", \"price\": 249.99, \"brand\": \"BrandB\"}, \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"metadata\": {\"category\": \"furniture\", \"price\": 399.99, \"brand\": \"BrandC\"}, \"pk\": 3, \"embedding\": [0.7, 0.8, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_json_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  {
      "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "metadata": {"category": "home_appliances", "price": 249.99, "brand": "BrandB"},
      "pk": 2,
      "embedding": [0.56, 0.78, 0.90]
  },
  {
      "metadata": {"category": "furniture", "price": 399.99, "brand": "BrandC"},
      "pk": 3,
      "embedding": [0.91, 0.18, 0.23]
  }
]

client.insert({
    collection_name: "my_json_collection",
    data: data
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
            "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
            "pk": 1,
            "embedding": [0.12, 0.34, 0.56]
        },
        {
            "metadata": {"category": "home_appliances", "price": 249.99, "brand": "BrandB"},
            "pk": 2,
            "embedding": [0.56, 0.78, 0.90]
        },
        {
            "metadata": {"category": "furniture", "price": 399.99, "brand": "BrandC"},
            "pk": 3,
            "embedding": [0.91, 0.18, 0.23]
        }       
    ],
    "collectionName": "my_json_collection"
}'
```

</TabItem>
</Tabs>

この例では:

- 各データエントリには、プライマリフィールド(`pk`)、製品カテゴリ、価格、ブランドなどの情報を格納するJSONフィールドとしての`メタデータ`が含まれます。

- `embedding`は、ベクトル類似性検索に使用される3次元ベクトル場です。

## 検索とクエリ{#search-and-query}

JSONフィールドを使用すると、検索中にスカラーフィルタリングが可能になり、Zilliz Cloudのベクトル検索機能が強化されます。ベクトルの類似性に加えて、JSONプロパティに基づいてクエリを実行できます。

### クエリのフィルター{#filter-queries}

JSONプロパティに基づいてデータをフィルタリングすることができます。例えば、特定の値を一致させたり、数値が特定の範囲内にあるかどうかを確認することができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata["category"] == "electronics" and metadata["price"] < 150'

res = client.query(
    collection_name="my_json_collection",
    filter=filter,
    output_fields=["metadata"]
)

print(res)

# Output
# data: ["{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "metadata[\"category\"] == \"electronics\" and metadata[\"price\"] < 150";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_json_collection")
        .filter(filter)
        .outputFields(Collections.singletonList("metadata"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [QueryResp.QueryResult(entity={metadata={"category":"electronics","price":99.99,"brand":"BrandA"}, pk=1})]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_scalar_collection',
    filter: 'metadata["category"] == "electronics" and metadata["price"] < 150',
    output_fields: ['metadata']
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
    "collectionName": "my_json_collection",
    "filter": "metadata[\"category\"] == \"electronics\" and metadata[\"price\"] < 150",
    "outputFields": ["metadata"]
}'
{"code":0,"cost":0,"data":[{"metadata":"{\"category\": \"electronics\", \"price\": 99.99, \"brand\": \"BrandA\"}","pk":1}]}
```

</TabItem>
</Tabs>

上記のクエリでは、Zilliz Cloudは、`メタデータ`フィールドのカテゴリが`"electronics"`で価格が150未満のエンティティをフィルタリングし、これらの条件に一致するエンティティを返します。

### JSONフィルタリングによるベクトル検索{#vector-search-with-json-filtering}

ベクトル類似性とJSONフィルタリングを組み合わせることで、検索されたデータが意味的に一致するだけでなく、特定のビジネス条件を満たしていることを確認し、検索結果をより正確かつユーザーのニーズに合わせることができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata["brand"] == "BrandA"'

res = client.search(
    collection_name="my_json_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["metadata"],
    filter=filter
)

print(res)

# Output
# data: ["[{'id': 1, 'distance': -0.2479381263256073, 'entity': {'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}}}]"] 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "metadata[\"brand\"] == \"BrandA\"";
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_json_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Collections.singletonList("metadata"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={metadata={"category":"electronics","price":99.99,"brand":"BrandA"}}, score=-0.2364331, id=1)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.search({
    collection_name: 'my_json_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['metadata'],
    filter: 'metadata["category"] == "electronics" and metadata["price"] < 150',
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
    "collectionName": "my_json_collection",
    "data": [
        [0.3, -0.6, 0.1]
    ],
    "annsField": "embedding",
    "limit": 5,
    "searchParams":{
        "params":{"nprobe":10}
    },
    "outputFields": ["metadata"],
    "filter": "metadata[\"brand\"] == \"BrandA\""
}'

## {"code":0,"cost":0,"data":[{"distance":-0.24793813,"id":1,"metadata":"{\"category\": \"electronics\", \"price\": 99.99, \"brand\": \"BrandA\"}"}]}
```

</TabItem>
</Tabs>

この例では、Zilliz Cloudは、`メタデータ`フィールドに`"BrandA"`というブランドが含まれるクエリベクトルに最も類似した上位5つのエンティティを返します。

さらに、Zilliz Cloudは、`JSON_CONTAINS`、`JSON_CONTAINS_ALL`、`JSON_CONTAINS_ANY`などの高度なJSONフィルタリング演算子をサポートしています。詳細については、「[JSON演算子](./json-filtering-operators)」を参照してください。

## 限界{#limits}

- **インデックスの制限**:データ構造が複雑なため、JSONフィールドのインデックスはサポートされていません。

- **データ型マッチング**: JSONフィールドのキー値が整数または浮動小数点の場合、他の整数または浮動小数点キー、`INT32/64`または`FLOAT 32/64`フィールドとのみ比較できます。キー値が文字列(`VARCHAR`)の場合、他の文字列キーとのみ比較できます。

- **命名制限**: JSONキーに名前を付ける場合、文字、数字、アンダースコアのみを使用することをお勧めします。他の文字は、フィルタリングや検索中に問題を引き起こす可能性があります。

- **文字列値の処理**:文字列値(`VARCHAR`)の場合、Zilliz Cloudは、JSONフィールド文字列を意味変換せずにそのまま保存します。例:`'a"b'`、`"a'b"`、`'a\'b'`、`"a\"b"`は入力されたまま保存されますが、`'a'b'`と`"a"b"`は無効と見なされます。

- **ネストされた辞書**の処理: JSONフィールド値内のネストされた辞書は文字列として扱われます。

- **JSONフィールドサイズ制限**: JSONフィールドは65,536バイトに制限されています。

