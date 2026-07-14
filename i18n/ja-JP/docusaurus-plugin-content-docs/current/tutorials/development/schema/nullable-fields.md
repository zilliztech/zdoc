---
title: "Nullable Fields | Cloud"
slug: /nullable-fields
sidebar_label: "Nullable Fields"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は nullable フィールドをサポートしており、フィールド値を欠損させる、または明示的に NULL に設定できます。nullability はスキーマレベルで定義され、データ取り込み、インデックス作成、検索、クエリ操作全体に一貫して適用されます。 | Cloud"
type: origin
token: DjROwgK6ziCf7Rkoji6ccyEUnsg
sidebar_position: 15
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nullable Fields

Zilliz Cloud は nullable フィールドをサポートしており、フィールド値を欠損させる、または明示的に NULL に設定できます。nullability はスキーマレベルで定義され、データ取り込み、インデックス作成、検索、クエリ操作全体に一貫して適用されます。

nullable フィールドは、次のような場合に使用します。

- 欠損値を許容する外部システムからデータを取り込む場合

- 一部のメタデータがオプションである、またはデータセットの一部にしか存在しない場合

- vector 埋め込みが非同期で生成され、後から挿入される場合

## Limits\{#limits}

- NULL 値を許容する vector フィールドでは、`IS NULL` または `IS NOT NULL` フィルター式はサポートされません。vector フィールド値が NULL かどうかに基づいて entity を明示的にフィルタリングすることはできません。

- Array of Structs フィールドは NULL 値をサポートしません。Array of Structs フィールド自体、またはその内部にネストされた任意のフィールドを nullable としてマークすることはできません。

- `nullable` 属性はフィールド作成時に定義され、その後で変更することはできません。既存のフィールドに対して nullability を有効化または無効化することはできません。

- nullable としてマークされたフィールドは partition key として使用できません。partition key フィールドには常に有効な非 NULL 値が含まれている必要があります。

## What is a nullable field?\{#what-is-a-nullable-field}

Zilliz Cloud では、フィールドが NULL 値を保存できるかどうかは、`nullable` というスキーマレベルのフィールド属性によって制御されます。

フィールドが `nullable=True` で定義されている場合、Zilliz Cloud はデータ取り込み時にそのフィールド値が欠けていても許可します。実際には、Zilliz Cloud は次の 2 つの入力を同等に扱い、フィールド値を NULL として保存します。

- 入力 entity にそのフィールドが含まれていない

- フィールドが明示的に NULL に設定されている（たとえば Python の `None`）

フィールドが nullable として定義されていない場合（デフォルトの動作）、すべての entity はそのフィールドに有効な値を指定する必要があります。フィールドを省略するか、明示的に NULL 値を代入すると、insert または import 操作は失敗します。

nullable 属性は、collection スキーマ内の**scalar フィールドと vector フィールドの両方**でサポートされます。ただし、Array of Structs フィールドでは nullable 属性はサポートされません。

<Admonition type="info" icon="📘" title="注意">

nullability はフィールド値が欠けていてよいかどうかを決定するものであり、フィールドが欠けている場合にどの値が使われるかを定義するものではありません。

- nullable フィールドがデフォルト値なしで設定されている場合、フィールドを省略すると NULL 値が保存されます。

- デフォルト値が設定されている場合、代わりに Zilliz Cloud がそのデフォルト値を保存することがあります。詳細は [Default Values](./default-fields) を参照してください。

</Admonition>

## Define a nullable field in the collection schema\{#define-a-nullable-field-in-the-collection-schema}

nullable フィールドを使用するには、collection スキーマを定義するときに `nullable` 属性を有効にする必要があります。

この例では、collection スキーマで `embedding` という名前の vector フィールドを `nullable=True` で定義しています。これにより、collection 内の entity はデータ取り込み時に vector 値を省略するか、明示的に NULL に設定できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Define schema fields
schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True) # Primary field
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
    # highlight-next-line
    nullable=True, # Enable the nullable attribute; defaults to False
)

client.create_collection(
    collection_name="my_collection",
    schema=schema,
)
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
        .token("YOUR_CLUSTER_TOKEN")
        .build());

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        // highlight-next-line
        .isNullable(true)
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

await client.createCollection({
  collection_name: 'my_collection',
  fields: [
    {
      name: 'id',
      data_type: DataType.Int64,
      is_primary_key: true
    },
    {
      name: 'embedding',
      data_type: DataType.FloatVector,
      dim: 4,
      // highlight-next-line
      nullable: true // Enable the nullable attribute; defaults to false
    }
  ]
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
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
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(4).
    // highlight-next-line
    WithNullable(true),
)

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "schema": {
      "autoID": false,
      "fields": [
        {
          "fieldName": "id",
          "dataType": "Int64",
          "isPrimary": true
        },
        {
          "fieldName": "embedding",
          "dataType": "FloatVector",
          "elementTypeParams": {
            "dim": "4"
          },
          "nullable": true
        }
      ]
    }
  }'
```

</TabItem>
</Tabs>

このスキーマでは、次のようになります。

- `embedding` フィールドは明示的に nullable としてマークされています。

- entity は挿入時に `embedding` フィールドを省略するか、NULL 値を割り当てることができます。

- NULL 値を許可するかどうかの決定は、collection 作成時点で固定されます。

分かりやすくするため、以下の例では nullable な vector フィールド（`embedding`）に焦点を当てます。nullable な scalar フィールドの定義はオプションであり、このガイドの残りを理解するために必須ではありません。

<details>

<summary>**任意: nullable な scalar フィールドを定義する**</summary>

scalar フィールドも同じ `nullable` 属性を使用して nullable として定義でき、取り込み時には同じルールに従います。たとえば次のとおりです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="age",
    datatype=DataType.INT64,
    # highlight-next-line
    nullable=True,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        // highlight-next-line
        .isNullable(true)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const ageField = {
  name: 'age',
  data_type: DataType.Int64,
  // highlight-next-line
  nullable: true
};
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().
    WithName("age").
    WithDataType(entity.FieldTypeInt64).
    // highlight-next-line
    WithNullable(true),
)
```

</TabItem>

<TabItem value='bash'>

```bash
{
  "fieldName": "age",
  "dataType": "Int64",
  "nullable": true
}
```

</TabItem>
</Tabs>

</details>

## Insert behavior with missing or NULL values\{#insert-behavior-with-missing-or-null-values}

フィールドが collection スキーマで nullable として定義されると、Zilliz Cloud はデータ取り込み時にそのフィールド値が欠けている、または明示的に NULL に設定されていることを許可します。

以下の例では、[Step 1](./nullable-fields#define-a-nullable-field-in-the-collection-schema) で作成した collection に 3 つの entity を挿入し、これらの異なるケースを示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {
        "id": 1,
        "embedding": [0.1, 0.2, 0.3, 0.4],
    },
    {
        "id": 2,
        "embedding": None,   # Explicitly set to NULL
    },
    {
        "id": 3,             # Field omitted → stored as NULL
    },
]

client.insert(
    collection_name="my_collection",
    data=data,
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;

import java.util.Arrays;
import java.util.List;

Gson gson = new Gson();

JsonObject row1 = new JsonObject();
row1.addProperty("id", 1);
row1.add("embedding", gson.toJsonTree(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f)));

JsonObject row2 = new JsonObject();
row2.addProperty("id", 2);
row2.add("embedding", JsonNull.INSTANCE); // Explicitly set to NULL

JsonObject row3 = new JsonObject();
row3.addProperty("id", 3); // Field omitted; stored as NULL

List<JsonObject> data = Arrays.asList(row1, row2, row3);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(data)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  {
    id: 1,
    embedding: [0.1, 0.2, 0.3, 0.4]
  },
  {
    id: 2,
    embedding: null // Explicitly set to NULL
  },
  {
    id: 3 // Field omitted; stored as NULL
  }
];

await client.insert({
  collection_name: 'my_collection',
  data
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

embeddingCol, err := column.NewNullableColumnFloatVector(
    "embedding",
    4,
    [][]float32{{0.1, 0.2, 0.3, 0.4}},
    []bool{true, false, false},
)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption(
    "my_collection",
    column.NewColumnInt64("id", []int64{1, 2, 3}),
    embeddingCol,
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "data": [
      {
        "id": 1,
        "embedding": [0.1, 0.2, 0.3, 0.4]
      },
      {
        "id": 2,
        "embedding": null
      },
      {
        "id": 3
      }
    ]
  }'
```

</TabItem>
</Tabs>

この例では、次のようになります。

- Entity **id = 1** は有効な vector 値を指定しています。

- Entity **id = 2** は embedding フィールドに明示的に NULL 値を割り当てています。

- Entity **id = 3** は embedding フィールドを完全に省略しています。Zilliz Cloud はこれを NULL として保存します。

## Index behavior on nullable fields\{#index-behavior-on-nullable-fields}

データを挿入した後は、通常どおり nullable フィールドに index を構築できます。主な違いは、インデックス構築中に Zilliz Cloud が NULL 値をどのように扱うかです。

- 非 NULL 値を持つ entity のみが index に追加されます。

- NULL 値を持つ entity はスキップされ、インデックス構築には参加しません。

nullable な vector フィールドの場合、これは有効な vector を持つ entity だけが vector 類似度検索の対象になることを意味します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index parameters
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

# Create index
client.create_index(
    collection_name="my_collection",
    index_params=index_params,
)

# Load collection for future search operations
client.load_collection(collection_name="my_collection")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.index.request.CreateIndexReq;

import java.util.Collections;

IndexParam indexParam = IndexParam.builder()
        .fieldName("embedding")
        .indexName("embedding_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();

client.createIndex(CreateIndexReq.builder()
        .collectionName("my_collection")
        .indexParams(Collections.singletonList(indexParam))
        .build());

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
  collection_name: 'my_collection',
  field_name: 'embedding',
  index_type: 'AUTOINDEX',
  metric_type: 'COSINE'
});

await client.loadCollection({
  collection_name: 'my_collection'
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

indexTask, err := client.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection",
    "embedding",
    index.NewAutoIndex(entity.COSINE),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = indexTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = loadTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "indexParams": [
      {
        "fieldName": "embedding",
        "indexName": "embedding_index",
        "indexType": "AUTOINDEX",
        "metricType": "COSINE"
      }
    ]
  }'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection"
  }'
```

</TabItem>
</Tabs>

この時点では、次のようになります。

- 有効な `embedding` 値を持つ entity は index 化され、検索の準備ができています。

- `embedding` が NULL の entity は collection 内には残りますが、vector index には含まれません。

## Search behavior with nullable fields\{#search-behavior-with-nullable-fields}

nullable フィールドに対して検索操作を実行すると、Zilliz Cloud は検索に使用されたフィールドについて非 NULL 値を持つ entity のみを評価します。vector フィールドが NULL の entity は自動的にスキップされます。

この例の `embedding` のような nullable な vector フィールドでは、次のようになります。

- 有効な vector 値を持つ entity のみが評価およびランク付けされます。

- NULL vector を持つ entity がエラーを引き起こすことはありません。

- 有効な vector の数が要求された topK（`limit`）より少ない場合、Zilliz Cloud は `limit` より少ない結果を返すことがあります。

次の例では、nullable な vector フィールド `embedding` に対して vector 検索を実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="embedding",
    limit=3,
    output_fields=["embedding"],
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;
import java.util.Collections;

SearchResp res = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f))))
        .annsField("embedding")
        .limit(3)
        .outputFields(Collections.singletonList("embedding"))
        .build());

System.out.println(res);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
  collection_name: 'my_collection',
  data: [[0.1, 0.2, 0.3, 0.4]],
  anns_field: 'embedding',
  limit: 3,
  output_fields: ['embedding']
});

console.log(res);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

query := []float32{0.1, 0.2, 0.3, 0.4}
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.FloatVector(query)},
).WithANNSField("embedding").
    WithOutputFields("embedding"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(resultSets)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "my_collection",
    "data": [[0.1, 0.2, 0.3, 0.4]],
    "annsField": "embedding",
    "limit": 3,
    "outputFields": ["embedding"]
  }'
```

</TabItem>
</Tabs>

この検索では、次のようになります。

- 非 NULL の `embedding` 値を持つ entity のみが候補として考慮されます。

- `embedding` に NULL 値を持つ entity は評価対象から除外されます。

- 返される結果数は、collection 内に存在する有効な vector の数に依存します。

## Query & filtering implications\{#query-and-filtering-implications}

前の例では vector フィールドに焦点を当てました。このセクションでは、**scalar フィルター式**において NULL 値がどのように振る舞うかを説明します。

scalar フィールドは `nullable=True` で定義でき、vector フィールドと同じ取り込みルールに従います。ただし、**NULL の scalar 値はフィルター式では常に false と評価されます**。

たとえば、nullable な scalar フィールド `age` がある場合、次のフィルターは `age` が 18 より大きい entity を選択します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "age > 18"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "age > 18";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'age > 18';
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > 18"
```

</TabItem>

<TabItem value='bash'>

```bash
"filter": "age > 18"
```

</TabItem>
</Tabs>

`age` が NULL の entity は、NULL 値がフィルター条件を満たさないため、結果から除外されます。

同様に、等価比較でも NULL 値には一致しません。たとえば次のようになります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "status == \"active\""
```

</TabItem>

<TabItem value='java'>

```java
String filter = "status == \"active\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'status == "active"';
```

</TabItem>

<TabItem value='go'>

```go
filter := `status == "active"`
```

</TabItem>

<TabItem value='bash'>

```bash
"filter": "status == \"active\""
```

</TabItem>
</Tabs>

`status` が NULL の entity は結果から除外されます。

## Applicable rules\{#applicable-rules}

フィールドに `nullable` と `default_value` の両方が設定されている場合、挿入時に NULL 入力またはフィールド値の欠損を Zilliz Cloud がどのように扱うかは、次のルールによって決まります。

| Nullable | Default Value | User Input | Result |
| --- | --- | --- | --- |
| ✅ | ✅ (non-NULL) | NULL or omitted | デフォルト値を使用 |
| ✅ | ❌ | NULL or omitted | NULL として保存 |
| ❌ | ✅ (non-NULL) | NULL or omitted | デフォルト値を使用 |
| ❌ | ❌ | NULL or omitted | エラーをスロー |
| ❌ | ✅ (NULL) | NULL or omitted | エラーをスロー |

**要点:**

- フィールドに非 NULL のデフォルト値がある場合、`nullable` が有効かどうかに関係なくその値が使用されます。

- `nullable=True` でデフォルト値が設定されていない場合、フィールドは NULL を保存します。

- `nullable=False` でデフォルト値が設定されていない場合、挿入はエラーで失敗します。

- 非 nullable フィールドに NULL のデフォルト値を設定することは無効であり、エラーの原因になります。

