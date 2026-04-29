---
title: "ダイナミックフィールド | Cloud"
slug: /enable-dynamic-field
sidebar_key: enable-dynamic-field
sidebar_label: "ダイナミックフィールド"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、ダイナミックフィールドと呼ばれる特別な機能を使用して、柔軟で進化する構造を持つエンティティを挿入できます。このフィールドは `$meta` という名前の非表示 JSON フィールドとして実装されており、コレクションスキーマで明示的に定義されていないデータ内のすべてのフィールドを自動的に保存します。 | Cloud"
type: origin
token: OVxRwZWxNi4pYrkdKxCcOuY2nf1
sidebar_position: 13
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - schema
  - ダイナミックフィールド

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ダイナミックフィールド

Zilliz Cloud では、**ダイナミックフィールド**と呼ばれる特殊な機能により、柔軟で進化する構造を持つエンティティを挿入できます。このフィールドは `$meta` という名前の非表示の JSON フィールドとして実装され、コレクションスキーマに**明示的に定義されていない**データ内のすべてのフィールドを自動的に格納します。

## 動作の仕組み\{#how-it-works}

ダイナミックフィールドが有効になっている場合、Zilliz Cloud は各エンティティに非表示の `$meta` フィールドを追加します。このフィールドは JSON 型であるため、JSON 互換の任意のデータ構造を格納でき、JSONパス構文を使用してインデックスを作成できます。

データ挿入時、スキーマで宣言されていないフィールドはすべて、このダイナミックフィールド内にキーと値のペアとして自動的に格納されます。

`$meta` を手動で管理する必要はありません。Zilliz Cloud が透過的に処理します。

たとえば、コレクションスキーマで `id` と `vector` のみが定義されている場合、次のエンティティを挿入するとします：

```json
{
  "id": 1,
  "vector": [0.1, 0.2, 0.3],
  "name": "Item A",    // Not in schema
  "category": "books"  // Not in schema
}
```

動的フィールド機能が有効になっている場合、Zilliz Cloud はそれを内部で次のように格納します。

```json
{
  "id": 1,
  "vector": [0.1, 0.2, 0.3],
  // highlight-start
  "$meta": {
    "name": "Item A",
    "category": "books"
  }
  // highlight-end
}
```

これにより、スキーマを変更せずにデータ構造を進化させることができます。

一般的なユースケースには以下が含まれます：

- オプションのフィールドや、あまり取得されないフィールドの保存

- エンティティごとに異なるメタデータのキャプチャ

- 特定の動的フィールドキーに対するインデックスを使用した柔軟なフィルタリングのサポート

## サポートされるデータ型\{#supported-data-types}

動的フィールドは、Zilliz Cloud が提供するすべてのスカラー型をサポートしており、単純な値と複雑な値の両方を含みます。これらのデータ型は、**`$meta` に格納されるキーの値**に適用されます。

**サポートされる型には以下が含まれます：**

- 文字列 (`VARCHAR`)

- 整数 (`INT8`, `INT32`, `INT64`)

- 浮動小数点 (`FLOAT`, `DOUBLE`)

- 真偽値 (`BOOL`)

- スカラー値の配列 (`ARRAY`)

- JSON オブジェクト (`JSON`)

**例：**

```json
{
  "brand": "Acme",
  "price": 29.99,
  "in_stock": true,
  "tags": ["new", "hot"],
  "specs": {
    "weight": "1.2kg",
    "dimensions": { "width": 10, "height": 20 }
  }
}
```

上記の各キーと値は、すべて `$meta` フィールド内に格納されます。

## Enable dynamic field\{#enable-dynamic-field}

ダイナミックフィールド機能を使用するには、コレクションスキーマ作成時に `enable_dynamic_field=True` を設定します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Initialize client
client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Create schema with dynamic field enabled
schema = client.create_schema(
    auto_id=False,
    # highlight-next-line
    enable_dynamic_field=True,
)

# Add explicitly defined fields
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# Create the collection
client.create_collection(
    collection_name="my_collection",
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.*;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.AddFieldReq;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(true)
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("my_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("my_vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient, DataType, CreateCollectionReq } from '@zilliz/milvus2-sdk-node';

// Initialize client
const client = new MilvusClient({ address: 'YOUR_CLUSTER_ENDPOINT' });

// Create collection
const res = await client.createCollection({
  collection_name: 'my_collection',
  schema:  [
      {
        name: 'my_id',
        data_type: DataType.Int64,
        is_primary_key: true,
        autoID: false,
      },
      {
        name: 'my_vector',
        data_type: DataType.FloatVector,
        type_params: {
          dim: '5',
      }
   ],
   enable_dynamic_field: true
});

```

</TabItem>

<TabItem value='java'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    return err
}

schema := entity.NewSchema().WithDynamicFieldEnabled(true)
schema.WithField(entity.NewField().
    WithName("my_id").pk
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("my_vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='java'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export myIdField='{
  "fieldName": "my_id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": false
}'

export myVectorField='{
  "fieldName": "my_vector",
  "dataType": "FloatVector",
  "elementTypeParams": {
    "dim": 5
  }
}'

export schema="{
  \"autoID\": false,
  \"enableDynamicField\": true,
  \"fields\": [
    $myIdField,
    $myVectorField
  ]
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"my_collection\",
  \"schema\": $schema
}"

```

</TabItem>
</Tabs>

## コレクションへのエンティティの挿入\{#insert-entities-to-the-collection}

動的フィールドを使用すると、スキーマで定義されていない追加フィールドを挿入できます。これらのフィールドは自動的に `$meta` に格納されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
entities = [
    {
        "my_id": 1, # Explicitly defined primary field
        "my_vector": [0.1, 0.2, 0.3, 0.4, 0.5], # Explicitly defined vector field
        "overview": "Great product",       # Scalar key not defined in schema
        "words": 150,                      # Scalar key not defined in schema
        "dynamic_json": {                  # JSON key not defined in schema
            "varchar": "some text",
            "nested": {
                "value": 42.5
            },
            "string_price": "99.99"        # Number stored as string
        }
    }
]

client.insert(collection_name="my_collection", data=entities)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.service.vector.request.InsertReq;

Gson gson = new Gson();
JsonObject row = new JsonObject();
row.addProperty("my_id", 1);
row.add("my_vector", gson.toJsonTree(Arrays.asList(0.1, 0.2, 0.3, 0.4, 0.5)));
row.addProperty("overview", "Great product");
row.addProperty("words", 150);

JsonObject dynamic = new JsonObject();
dynamic.addProperty("varchar", "some text");
dynamic.addProperty("string_price", "99.99");

JsonObject nested = new JsonObject();
nested.addProperty("value", 42.5);

dynamic.add("nested", nested);
row.add("dynamic_json", dynamic);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(row))
        .build());
```

</TabItem>

<TabItem value='java'>

```javascript

const entities = [
  {
    my_id: 1,
    my_vector: [0.1, 0.2, 0.3, 0.4, 0.5],
    overview: 'Great product',
    words: 150,
    dynamic_json: {
      varchar: 'some text',
      nested: {
        value: 42.5,
      },
      string_price: '99.99',
    },
  },
];
const res = await client.insert({
    collection_name: 'my_collection',
    data: entities,
});
```

</TabItem>

<TabItem value='java'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("my_id", []int64{1}).
    WithFloatVectorColumn("my_vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
    }).WithColumns(
    column.NewColumnVarChar("overview", []string{"Great product"}),
    column.NewColumnInt32("words", []int32{150}),
    column.NewColumnJSONBytes("dynamic_json", [][]byte{
        []byte(\`{
            varchar: 'some text',
            nested: {
                value: 42.5,
            },
            string_price: '99.99',
        }\`),
    }),
))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='java'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "data": [
    {
      "my_id": 1,
      "my_vector": [0.1, 0.2, 0.3, 0.4, 0.5],
      "overview": "Great product",
      "words": 150,
      "dynamic_json": {
        "varchar": "some text",
        "nested": {
          "value": 42.5
        },
        "string_price": "99.99"
      }
    }
  ],
  "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## 動的フィールド内のキーのインデックス作成\{#index-keys-in-the-dynamic-field}

Zilliz Cloudでは、**JSONパスインデックス**を使用して動的フィールド内の特定のキーに対してインデックスを作成できます。これらのキーはスカラー値でもJSONオブジェクト内のネストされた値でも構いません。

<Admonition type="info" icon="📘" title="Notes">

<p>動的フィールドのキーに対するインデックス作成は<strong>任意</strong>です。インデックスなしでも動的フィールドのキーでクエリやフィルタリングが可能ですが、ブルートフォース検索による遅延が発生する可能性があります。</p>

</Admonition>

### JSONパスインデックスの構文\{#json-path-indexing-syntax}

JSONパスインデックスを作成するには、以下の項目を指定します。

- **JSONパス** (`json_path`): インデックスを作成したいJSONオブジェクト内のキーまたはネストされたフィールドへのパス。

    - 例: `metadata["category"]`

        これは、インデックスエンジンがJSON構造内のどこを参照すべきかを定義します。

- **JSONキャストタイプ** (`json_cast_type`): Zilliz Cloudが指定されたパスの値を解釈・インデックス作成する際に使用するデータ型。

    - この型は、インデックス対象のフィールドの実際のデータ型と一致している必要があります。

    - サポートされている型の完全な一覧については、[サポートされているJSONキャストタイプ](./use-json-fields)を参照してください。

### JSONパスを使用して動的フィールドのキーをインデックス作成する\{#use-json-path-to-index-dynamic-field-keys}

動的フィールドはJSONフィールドであるため、JSONパス構文を使用してその中の任意のキーをインデックス作成できます。これは単純なスカラー値だけでなく、複雑なネスト構造にも適用可能です。

**JSONパスの例:**

- 単純なキーの場合: `overview`, `words`

- ネストされたキーの場合: `dynamic_json['varchar']`, `dynamic_json['nested']['value']`

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Index a simple string key
index_params.add_index(
    field_name="overview",  # Key name in the dynamic field
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="overview_index",  # Unique index name
    # highlight-start
    params={
        "json_cast_type": "varchar",   # Data type that Zilliz Cloud uses when indexing the values
        "json_path": "overview"        # JSON path to the key
    }
    # highlight-end
)

# Index a simple numeric key
index_params.add_index(
    field_name="words",  # Key name in the dynamic field
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="words_index",  # Unique index name
    # highlight-start
    params={
        "json_cast_type": "double",  # Data type that Zilliz Cloud uses when indexing the values
        "json_path": "words" # JSON path to the key
    }
    # highlight-end
)

# Index a nested key within a JSON object
index_params.add_index(
    field_name="dynamic_json", # JSON key name in the dynamic field
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="json_varchar_index", # Unique index name
    # highlight-start
    params={
        "json_cast_type": "varchar", # Data type that Zilliz Cloud uses when indexing the values
        "json_path": "dynamic_json['varchar']" # JSON path to the nested key
    }
    # highlight-end
)

# Index a deeply nested key
index_params.add_index(
    field_name="dynamic_json",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="json_nested_index", # Unique index name
    # highlight-start
    params={
        "json_cast_type": "double",
        "json_path": "dynamic_json['nested']['value']"
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

Map<String,Object> extraParams1 = new HashMap<>();
extraParams1.put("json_path", "overview");
extraParams1.put("json_cast_type", "varchar");
indexParams.add(IndexParam.builder()
        .fieldName("overview")
        .indexName("overview_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams1)
        .build());

Map<String,Object> extraParams2 = new HashMap<>();
extraParams2.put("json_path", "words");
extraParams2.put("json_cast_type", "double");
indexParams.add(IndexParam.builder()
        .fieldName("words")
        .indexName("words_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams2)
        .build());

Map<String,Object> extraParams3 = new HashMap<>();
extraParams3.put("json_path", "dynamic_json['varchar']");
extraParams3.put("json_cast_type", "varchar");
indexParams.add(IndexParam.builder()
        .fieldName("dynamic_json")
        .indexName("json_varchar_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams3)
        .build());

Map<String,Object> extraParams4 = new HashMap<>();
extraParams4.put("json_path", "dynamic_json['nested']['value']");
extraParams4.put("json_cast_type", "double");
indexParams.add(IndexParam.builder()
        .fieldName("dynamic_json")
        .indexName("json_nested_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams4)
        .build());
```

</TabItem>

<TabItem value='java'>

```javascript
const indexParams = [
    {
      collection_name: 'my_collection',
      field_name: 'overview',
      index_name: 'overview_index',
      index_type: 'AUTOINDEX',
      metric_type: 'NONE',
      params: {
        json_path: 'overview',
        json_cast_type: 'varchar',
      },
    },
    {
      collection_name: 'my_collection',
      field_name: 'words',
      index_name: 'words_index',
      index_type: 'AUTOINDEX',
      metric_type: 'NONE',
      params: {
        json_path: 'words',
        json_cast_type: 'double',
      },
    },
    {
      collection_name: 'my_collection',
      field_name: 'dynamic_json',
      index_name: 'json_varchar_index',
      index_type: 'AUTOINDEX',
      metric_type: 'NONE',
      params: {
        json_cast_type: 'varchar',
        json_path: "dynamic_json['varchar']",
      },
    },
    {
      collection_name: 'my_collection',
      field_name: 'dynamic_json',
      index_name: 'json_nested_index',
      index_type: 'AUTOINDEX',
      metric_type: 'NONE',
      params: {
        json_cast_type: 'double',
        json_path: "dynamic_json['nested']['value']",
      },
    },
  ];
```

</TabItem>

<TabItem value='java'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/index"
)

jsonIndex1 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", "overview")
    .WithIndexName("overview_index")
jsonIndex2 := index.NewJSONPathIndex(index.AUTOINDEX, "double", "words")
    .WithIndexName("words_index")
jsonIndex3 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", \`dynamic_json['varchar']\`)
    .WithIndexName("json_varchar_index")
jsonIndex4 := index.NewJSONPathIndex(index.AUTOINDEX, "double", \`dynamic_json['nested']['value']\`)
    .WithIndexName("json_nested_index")

indexOpt1 := milvusclient.NewCreateIndexOption("my_collection", "overview", jsonIndex1)
indexOpt2 := milvusclient.NewCreateIndexOption("my_collection", "words", jsonIndex2)
indexOpt3 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex3)
indexOpt4 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex4)
```

</TabItem>

<TabItem value='java'>

```bash
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export overviewIndex='{
  "fieldName": "dynamic_json",
  "indexName": "overview_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "varchar",
    "json_path": "dynamic_json[\"overview\"]"
  }
}'

export wordsIndex='{
  "fieldName": "dynamic_json",
  "indexName": "words_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "double",
    "json_path": "dynamic_json[\"words\"]"
  }
}'

export varcharIndex='{
  "fieldName": "dynamic_json",
  "indexName": "json_varchar_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "varchar",
    "json_path": "dynamic_json[\"varchar\"]"
  }
}'

export nestedIndex='{
  "fieldName": "dynamic_json",
  "indexName": "json_nested_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "double",
          "json_path": "dynamic_json[\"nested\"][\"value\"]"
    }
  }'
```

</TabItem>
</Tabs>

### 型変換に JSON キャスト関数を使用する\{#use-json-cast-functions-for-type-conversion}

動的フィールドのキーに不適切な形式の値が含まれている場合（例：文字列として格納された数値）、キャスト関数を使用して変換できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Convert a string to double before indexing
index_params.add_index(
    field_name="dynamic_json", # JSON key name
    index_type="AUTOINDEX",
    index_name="json_string_price_index",
    params={
        "json_path": "dynamic_json['string_price']",
        "json_cast_type": "double", # Must be the output type of the cast function
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE" # Case insensitive; convert string to double
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> extraParams5 = new HashMap<>();
extraParams5.put("json_path", "dynamic_json['string_price']");
extraParams5.put("json_cast_type", "double");
indexParams.add(IndexParam.builder()
        .fieldName("dynamic_json")
        .indexName("json_string_price_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams5)
        .build());
```

</TabItem>

<TabItem value='java'>

```javascript
indexParams.push({
    collection_name: 'my_collection',
    field_name: 'dynamic_json',
    index_name: 'json_string_price_index',
    index_type: 'AUTOINDEX',
    metric_type: 'NONE',
    params: {
      json_path: "dynamic_json['string_price']",
      json_cast_type: 'double',
      json_cast_function: 'STRING_TO_DOUBLE',
    },
  });
```

</TabItem>

<TabItem value='java'>

```go
jsonIndex5 := index.NewJSONPathIndex(index.AUTOINDEX, "double", \`dynamic_json['string_price']\`)
    .WithIndexName("json_string_price_index")
indexOpt5 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex5)
```

</TabItem>

<TabItem value='java'>

```bash
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export stringPriceIndex='{
  "fieldName": "dynamic_json",
  "indexName": "json_string_price_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "dynamic_json[\"string_price\"]",
    "json_cast_type": "double",
    "json_cast_function": "STRING_TO_DOUBLE"
  }
}'

```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>型変換に失敗した場合（例: 値 <code>"not_a_number"</code> を数値に変換できない場合）、その値はスキップされ、インデックスされません。</p></li>
<li><p>キャスト関数のパラメータの詳細については、<a href="./use-json-fields">JSON フィールド</a>を参照してください。</p></li>
</ul>

</Admonition>

### コレクションにインデックスを適用する\{#apply-indexes-to-the-collection}

インデックスパラメータを定義した後、`create_index()` を使用してコレクションに適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_index(
    collection_name="my_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.CreateIndexReq;

client.createIndex(CreateIndexReq.builder()
        .collectionName("my_collection")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='java'>

```javascript
  await client.createIndex(indexParams);
```

</TabItem>

<TabItem value='java'>

```go
indexTask1, err := client.CreateIndex(ctx, indexOpt1)
if err != nil {
    return err
}
indexTask2, err := client.CreateIndex(ctx, indexOpt2)
if err != nil {
    return err
}
indexTask3, err := client.CreateIndex(ctx, indexOpt3)
if err != nil {
    return err
}
indexTask4, err := client.CreateIndex(ctx, indexOpt4)
if err != nil {
    return err
}
indexTask5, err := client.CreateIndex(ctx, indexOpt5)
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='java'>

```bash
# restful
export indexParams="[
  $varcharIndex,
  $nestedIndex,
  $overviewIndex,
  $wordsIndex,
  $stringPriceIndex
]"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"my_collection\",
  \"indexParams\": $indexParams
}"

```

</TabItem>
</Tabs>

## 動的フィールドキーによるフィルタリング\{#filter-by-dynamic-field-keys}

動的フィールドキーを持つエンティティを挿入した後、標準的なフィルター式を使用してそれらをフィルタリングできます。

- JSON以外のキー（例：文字列、数値、ブール値）の場合、キー名を直接参照できます。

- JSONオブジェクトを格納するキーの場合、JSONパス構文を使用してネストされた値にアクセスします。

[前のセクション](./enable-dynamic-field#insert-entities-to-the-collection)の[サンプルエンティティ](./enable-dynamic-field#insert-entities-to-the-collection)に基づくと、有効なフィルター式の例は次のとおりです：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'overview == "Great product"'                # Non-JSON key
filter = 'words >= 100'                               # Non-JSON key
filter = 'dynamic_json["nested"]["value"] < 50'       # JSON object key
```

</TabItem>

<TabItem value='java'>

```java
String filter = 'overview == "Great product"';
String filter = 'words >= 100';
String filter = 'dynamic_json["nested"]["value"] < 50';
```

</TabItem>

<TabItem value='java'>

```javascript
filter = 'overview == "Great product"'                // Non-JSON key
filter = 'words >= 100'                               // Non-JSON key
filter = 'dynamic_json["nested"]["value"] < 50'       // JSON object key
```

</TabItem>

<TabItem value='java'>

```go
filter := 'overview == "Great product"'
filter := 'words >= 100'
filter := 'dynamic_json["nested"]["value"] < 50'
```

</TabItem>

<TabItem value='java'>

```bash
# restful
export filter='overview == "Great product"'
export filter='words >= 100'
export filter='dynamic_json["nested"]["value"] < 50'
```

</TabItem>
</Tabs>

**動的フィールドキーの取得**: 検索またはクエリ結果に動的フィールドキーを返すには、フィルタリング時と同じJSONパス構文を使用して、`output_fields`パラメータで明示的に指定する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Example: Include dynamic field keys in search results
results = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],
    filter=filter,                         # Filter expression defined earlier
    limit=10,
    # highlight-start
    output_fields=[
        "overview",                        # Simple dynamic field key
        "dynamic_json"          # Nested JSON key
    ]
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

FloatVec queryVector = new FloatVec(new float[]{0.1, 0.2, 0.3, 0.4, 0.5});
SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .topK(5)
        .filter(filter)
        .outputFields(Arrays.asList("overview", "dynamic_json"))
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

const query_vector = [0.1, 0.2, 0.3, 0.4, 0.5]

const res = await client.search({
    collection_name: "my_collection",
    data: [query_vector],
    limit: 5,
    filters: filter,
    output_fields: ["overview", "dynamic_json"]
})
```

</TabItem>

<TabItem value='java'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := client.New(ctx, &client.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

queryVector := []float32{0.1, 0.2, 0.3, 0.4, 0.5}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("my_vector").
    WithFilter(filter).
    WithOutputFields("overview", "dynamic_json"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"
export FILTER='color like "red%" and likes > 50'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"my_collection\",
  \"data\": [
    [0.1, 0.2, 0.3, 0.4, 0.5]
  ],
  \"annsField\": \"my_vector\",
  \"filter\": \"${FILTER}\",
  \"limit\": 5,
  \"outputFields\": [\"overview\", \"dynamic_json\"]
}"
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>動的フィールドのキーはデフォルトで結果に含まれず、明示的にリクエストする必要があります。</p>

</Admonition>

サポートされている演算子およびフィルター式の完全な一覧については、[Filtered Search](./filtered-search) を参照してください。

## すべてをまとめる\{#put-it-all-together}

ここまでで、スキーマに定義されていないキーを柔軟に保存・インデックスするために動的フィールドを使用する方法を学びました。動的フィールドのキーが一度挿入されれば、特別な構文は不要で、フィルター式内で他のフィールドと同様に使用できます。

実際のアプリケーションでこのワークフローを完了するには、以下の手順も必要です。

- **ベクトルフィールドにインデックスを作成する**（各コレクションで必須）  

    [Index ベクトルフィールドs](./index-vector-fields) を参照

- **コレクションをロードする**

    [Load & Release](./load-release-collections) を参照

- **JSONパスフィルターを使用して検索またはクエリを実行する**  

    [Filtered Search](./filtered-search) および [JSON Operators](./json-filtering-operators) を参照

## FAQ\{#faq}

### スキーマ内でフィールドを明示的に定義すべきタイミングは？動的フィールドキーを使うべきではないのはいつ？\{#when-should-i-define-a-field-explicitly-in-the-schema-instead-of-using-a-dynamic-field-key}

動的フィールドキーではなく、スキーマ内でフィールドを明示的に定義すべきケースは以下の通りです。

- **そのフィールドが頻繁に `output_fields` に含まれる場合**: `output_fields` 経由で効率的に取得できることが保証されているのは、明示的に定義されたフィールドのみです。動的フィールドキーは高頻度での取得に最適化されておらず、パフォーマンスオーバーヘッドが発生する可能性があります。

- **そのフィールドが頻繁にアクセスまたはフィルターされる場合**: 動的フィールドキーにインデックスを作成すれば、固定スキーマフィールドと同程度のフィルタリング性能が得られますが、明示的に定義されたフィールドの方が構造が明確で保守性が高くなります。

- **フィールドの動作を完全に制御したい場合**: 明示的なフィールドでは、スキーマレベルでの制約、バリデーション、明確な型指定が可能であり、データの整合性と一貫性を管理するのに役立ちます。

- **インデックスの不整合を避けたい場合**: 動的フィールドキー内のデータは、型や構造において不整合が生じやすい傾向があります。固定スキーマを使用することでデータ品質を確保しやすくなり、特にインデックスやキャストを利用する予定がある場合は重要です。

### 同じ動的フィールドキーに対して、異なるデータ型で複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-dynamic-field-key-with-different-data-types}

いいえ、**1つのJSONパスにつき1つのインデックスしか作成できません**。たとえ動的フィールドキーに複数の型の値（例：一部が文字列、一部が数値）が混在していたとしても、そのパスのインデックス作成時には単一の `json_cast_type` を選択する必要があります。現時点では、同じキーに対して異なる型で複数のインデックスを作成することはサポートされていません。

### 動的フィールドキーのインデックス作成時にデータのキャストに失敗した場合はどうなりますか？\{#when-indexing-a-dynamic-field-key-what-if-the-data-casting-fails}

動的フィールドキーに対してインデックスを作成しており、データのキャストに失敗した場合（例：`double` 型へのキャストが想定されていた値が `"abc"` のような非数値文字列だった場合）、該当する値はインデックス作成中に**静かにスキップされます**。これらの値はインデックスに含まれないため、インデックスに依存するフィルターに基づく検索やクエリの結果にも**表示されません**。

これにはいくつか重要な影響があります。

- **フルスキャンへのフォールバックなし**: 多くのエンティティが正常にインデックスされた場合、フィルタリングクエリは完全にインデックスに依存します。キャストに失敗したエンティティは、フィルター条件に論理的に一致していても結果セットから除外されます。

- **検索精度のリスク**: データ品質が一貫していない大規模なデータセット（特に動的フィールドキー内）では、この動作により予期しない検索漏れが発生する可能性があります。インデックス作成前に、データのフォーマットが一貫しており有効であることを確認することが極めて重要です。

- **キャスト関数の慎重な使用**: インデックス作成時に `json_cast_function` を使って文字列を数値に変換する場合、その文字列値が確実に変換可能であることを保証してください。`json_cast_type` と実際に変換された型との間に不一致があると、エラーが発生するか、エントリがスキップされます。

### クエリで使用するデータ型が、インデックス作成時のキャスト型と異なる場合はどうなりますか？\{#what-happens-if-my-query-uses-a-different-data-type-than-the-indexed-cast-type}

クエリで動的フィールドキーを**異なるデータ型**で比較する場合（例：インデックスが `double` 型にキャストされているにもかかわらず、文字列として比較するクエリを実行する場合）、システムは**インデックスを使用せず**、可能な場合にのみフルスキャンにフォールバックします。最高のパフォーマンスと精度を得るには、クエリのデータ型がインデックス作成時に指定した `json_cast_type` と一致していることを確認してください。