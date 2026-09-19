---
title: "Nullable フィールド | Cloud"
slug: /nullable-fields
sidebar_label: "Nullable フィールド"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は nullable フィールドをサポートしています。nullable フィールドでは、フィールド値を欠落させるか、明示的に NULL に設定できます。nullability はスキーマレベルで定義され、データ取り込み、インデックス作成、検索、クエリ操作に一貫して適用されます。 | Cloud"
type: origin
token: DjROwgK6ziCf7Rkoji6ccyEUnsg
sidebar_position: 15
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nullable フィールド

Zilliz Cloud は nullable フィールドをサポートしています。nullable フィールドでは、フィールド値を欠落させるか、明示的に NULL に設定できます。nullability はスキーマレベルで定義され、データ取り込み、インデックス作成、検索、クエリ操作に一貫して適用されます。

nullable フィールドは、次のような場合に使用します。

- 欠損値を許容する外部システムからデータを取り込む場合

- 一部のメタデータが任意である、またはデータセットの一部にしか存在しない場合

- ベクトル埋め込みが非同期で生成され、後から挿入される場合

## 制限\{#limits}

- NULL 値を許可するベクトルフィールドでは、`IS NULL` または `IS NOT NULL` フィルター式はサポートされていません。ベクトルフィールド値が NULL かどうかに基づいてエンティティを明示的にフィルタリングすることはできません。

- Zilliz Cloud では、nullable な StructArray フィールドは、3.0.x 系の Milvus 3.0.0 以降を実行する On-Demand クラスターでサポートされています。Serving クラスターでは、nullable な StructArray フィールドはサポートされていません。`nullable=True` は、個々のサブフィールドではなく、親の StructArray フィールドに設定します。NULL は StructArray フィールド全体に適用され、個々の Struct 要素には適用されません。また、親の設定は内部的にそのサブフィールドに伝播されます。既存のコレクションに追加する StructArray フィールドは nullable である必要があり、これにより既存のエンティティは新しいフィールドに対して NULL を返すことができます。詳細は、[StructArray の制限](./struct-array-limits) を参照してください。

- `nullable` 属性はフィールドの作成時に定義され、後から変更することはできません。既存のフィールドに対して nullability を有効化または無効化することはできません。

- nullable としてマークされたフィールドは、partition key として使用できません。partition key フィールドには、常に有効な非 NULL 値が含まれている必要があります。

## nullable フィールドとは何ですか？\{#what-is-a-nullable-field}

Zilliz Cloud では、フィールドに NULL 値を保存できるかどうかは、`nullable` というスキーマレベルのフィールド属性によって制御されます。

フィールドが `nullable=True` で定義されている場合、Zilliz Cloud はデータ取り込み時にフィールド値が欠落していても許可します。実際には、Zilliz Cloud は次の 2 つの入力を同等として扱い、フィールド値を NULL として保存します。

- 入力エンティティからそのフィールドが省略されている

- フィールドが明示的に NULL に設定されている（たとえば Python の `None`）

フィールドが nullable として定義されていない場合（デフォルトの動作）、すべてのエンティティはそのフィールドに有効な値を指定する必要があります。フィールドを省略するか、明示的に NULL 値を割り当てると、挿入またはインポート操作は失敗します。

nullable 属性は、コレクションスキーマ内の**スカラーフィールドとベクトルフィールドの両方**でサポートされています。サポート対象の On-Demand クラスターでは、親の StructArray フィールドでもサポートされています。Struct のサブフィールドを個別に nullable として設定しないでください。nullability は StructArray の親で定義し、その設定は内部的にサブフィールドに伝播されます。

<Admonition type="info" title="Notes">

nullability は、フィールド値が欠落していてもよいかどうかを決定するものであり、フィールドが欠落している場合にどの値が使用されるかを定義するものではありません。

- nullable フィールドがデフォルト値なしで設定されている場合、そのフィールドを省略すると NULL 値が保存されます。

- デフォルト値が設定されている場合、Zilliz Cloud は代わりにそのデフォルト値を保存することがあります。詳細は、[デフォルト値](./default-fields) を参照してください。

</Admonition>

## コレクションスキーマで nullable フィールドを定義する\{#define-a-nullable-field-in-the-collection-schema}

nullable フィールドを使用するには、コレクションスキーマを定義するときに `nullable` 属性を有効にする必要があります。

この例では、コレクションスキーマで `embedding` という名前のベクトルフィールドを `nullable=True` で定義しています。これにより、コレクション内のエンティティは、データ取り込み時にベクトル値を省略したり、明示的に NULL に設定したりできます。

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

- エンティティは、挿入時に `embedding` フィールドを省略したり、NULL 値を割り当てたりできます。

- NULL 値を許可するかどうかは、コレクションの作成時に確定します。

わかりやすくするため、以降の例では nullable なベクトルフィールド（`embedding`）に焦点を当てます。nullable なスカラーフィールドの定義は任意であり、このガイドの残りの手順を進めるうえで必須ではありません。

<details>

<summary>**任意: nullable なスカラーフィールドを定義する**</summary>

スカラーフィールドも、同じ `nullable` 属性を使用して nullable として定義でき、取り込み時には同じルールに従います。たとえば、次のとおりです。

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

## 値の欠落または NULL がある場合の挿入動作\{#insert-behavior-with-missing-or-null-values}

コレクションスキーマでフィールドが nullable として定義されると、Zilliz Cloud はデータ取り込み時にそのフィールド値が欠落していること、または明示的に NULL に設定されていることを許可します。

次の例では、[手順 1](./nullable-fields#define-a-nullable-field-in-the-collection-schema) で作成したコレクションに 3 つのエンティティを挿入し、これらの異なるケースを示します。

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

この例では、次のとおりです。

- エンティティ **id = 1** は有効なベクトル値を指定しています。

- エンティティ **id = 2** は、embedding フィールドに明示的に NULL 値を割り当てています。

- エンティティ **id = 3** は embedding フィールドを完全に省略しています。Zilliz Cloud はそれを NULL として保存します。

## nullable フィールドのインデックス動作\{#index-behavior-on-nullable-fields}

データを挿入した後は、通常どおり nullable フィールドにインデックスを構築できます。主な違いは、インデックス構築時に Zilliz Cloud が NULL 値をどのように処理するかです。

- 非 NULL 値を持つエンティティのみがインデックスに追加されます。

- NULL 値を持つエンティティはスキップされ、インデックス構築には関与しません。

nullable なベクトルフィールドの場合、これは有効なベクトルを持つエンティティのみがベクトル類似度による検索の対象になることを意味します。

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

この時点では、次のとおりです。

- 有効な `embedding` 値を持つエンティティはインデックスに登録され、検索できる状態になります。

- `embedding` が NULL のエンティティはコレクションに残りますが、ベクトルインデックスには含まれません。

## nullable フィールドの検索動作\{#search-behavior-with-nullable-fields}

nullable フィールドに対して検索操作を実行すると、Zilliz Cloud は検索で使用するフィールドに非 NULL 値を持つエンティティのみを評価します。ベクトルフィールドが NULL のエンティティは自動的にスキップされます。

この例の `embedding` のような nullable なベクトルフィールドの場合、次のとおりです。

- 有効なベクトル値を持つエンティティのみが評価され、ランク付けされます。

- NULL ベクトルを持つエンティティがエラーの原因になることはありません。

- 有効なベクトルの数が要求された topK（`limit`）より少ない場合、Zilliz Cloud は `limit` より少ない結果を返すことがあります。

次の例では、nullable なベクトルフィールド `embedding` に対してベクトル検索を実行します。

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

この検索では、次のとおりです。

- 非 NULL の `embedding` 値を持つエンティティのみが候補として考慮されます。

- `embedding` が NULL 値のエンティティは、評価から除外されます。

- 返される結果の数は、コレクション内に存在する有効なベクトルの数によって決まります。

## クエリとフィルタリングへの影響\{#query-and-filtering-implications}

これまでの例ではベクトルフィールドに焦点を当ててきました。このセクションでは、**スカラーフィルター式**における NULL 値の動作について説明します。

スカラーフィールドは `nullable=True` で定義でき、ベクトルフィールドと同じ取り込みルールに従います。ただし、**フィルター式では NULL のスカラー値は常に false と評価されます**。

たとえば、nullable なスカラーフィールド `age` の場合、次のフィルターは `age` が 18 より大きいエンティティを選択します。

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

`age` が NULL のエンティティは、NULL 値がフィルター条件を満たさないため、結果から除外されます。

同様に、等価比較は NULL 値と一致しません。たとえば、次のとおりです。

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

`status` が NULL のエンティティは、結果から除外されます。

## 適用ルール\{#applicable-rules}

あるフィールドに `nullable` と `default_value` の両方が設定されている場合、挿入時に NULL 入力またはフィールド値の欠落を Zilliz Cloud がどのように処理するかは、次のルールによって決まります。

| Nullable | デフォルト値 | ユーザー入力 | 結果 |
| --- | --- | --- | --- |
| ✅ | ✅（非 NULL） | NULL または省略 | デフォルト値を使用 |
| ✅ | ❌ | NULL または省略 | NULL として保存 |
| ❌ | ✅（非 NULL） | NULL または省略 | デフォルト値を使用 |
| ❌ | ❌ | NULL または省略 | エラーをスロー |
| ❌ | ✅（NULL） | NULL または省略 | エラーをスロー |

**重要なポイント:**

- フィールドに非 NULL のデフォルト値がある場合、`nullable` が有効かどうかに関係なく、その値が使用されます。

- `nullable=True` でデフォルト値が設定されていない場合、そのフィールドには NULL が保存されます。

- `nullable=False` でデフォルト値が設定されていない場合、挿入はエラーで失敗します。

- NULL 不可のフィールドに NULL のデフォルト値を設定することは無効であり、エラーの原因となります。

