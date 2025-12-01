---
title: "Dynamic Field | BYOC"
slug: /enable-dynamic-field
sidebar_label: "Dynamic Field"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、動的フィールドと呼ばれる特別な機能を通じて、柔軟で進化する構造を持つエンティティを挿入できます。このフィールドは`#meta`という名前の非表示のJSONフィールドとして実装され、コレクションスキーマで明示的に定義されていないデータ内のすべてのフィールドを自動的に格納します。| BYOC"
type: origin
token: OVxRwZWxNi4pYrkdKxCcOuY2nf1
sidebar_position: 13
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - dynamic field
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Dynamic Field

Zilliz Cloudでは、**動的フィールド**と呼ばれる特別な機能を通じて、柔軟で進化する構造を持つエンティティを挿入できます。このフィールドは`#meta`という名前の非表示のJSONフィールドとして実装され、**明示的に定義されていない**コレクションスキーマのフィールドを自動的に格納します。

## 動作原理\{#how-it-works}

動的フィールドが有効になっている場合、Zilliz Cloudは各エンティティに非表示の`#meta`フィールドを追加します。このフィールドはJSON型であり、JSON互換の任意のデータ構造を格納でき、JSONパス構文を使用してインデックスを作成できます。

データ挿入時、スキーマで宣言されていないすべてのフィールドは自動的にこの動的フィールド内のキー・バリューのペアとして保存されます。

`#meta`を手動で管理する必要はありません—Zilliz Cloudが透過的に処理します。

たとえば、コレクションスキーマが`id`と`vector`のみを定義している場合、次のエンティティを挿入するとします：

```json
{
  "id": 1,
  "vector": [0.1, 0.2, 0.3],
  "name": "Item A",    // スキーマには定義されていません
  "category": "books"  // スキーマには定義されていません
}
```

動的フィールド機能が有効な場合、Zilliz Cloudは内部的に以下のように格納します：

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

これにより、スキーマを変更することなくデータ構造を進化させることができます。

一般的な使用例は次のとおりです：

- オプションのフィールドやまれに取得されるフィールドの格納

- エンティティごとに変化するメタデータのキャプチャ

- 特定の動的フィールドキーにインデックスを作成することによる柔軟なフィルタリングのサポート

## サポートされるデータ型\{#supported-data-types}

動的フィールドは、Zilliz Cloudが提供するすべてのスカラー型をサポートし、単純な値と複雑な値の両方を含みます。これらのデータ型は、**$metaに格納されたキーの値**に適用されます。

**サポートされる型は以下の通りです：**

- String（`VARCHAR`）

- Integer（`INT8`、`INT32`、`INT64`）

- Floating point（`FLOAT`、`DOUBLE`）

- Boolean（`BOOL`）

- 配列要素型（`ARRAY`）

- JSONオブジェクト（`JSON`）

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

上記の各キーと値は`#meta`フィールド内に格納されます。

## 動的フィールドの有効化\{#enable-dynamic-field}

動的フィールド機能を使用するには、コレクションスキーマを作成する際に`enable_dynamic_field=True`を設定します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# クライアントを初期化
client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# 動的フィールドを有効にしてスキーマを作成
schema = client.create_schema(
    auto_id=False,
    # highlight-next-line
    enable_dynamic_field=True,
)

# 明示的に定義されたフィールドを追加
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# コレクションを作成
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

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, CreateCollectionReq } from '@zilliz/milvus2-sdk-node';

// クライアントを初期化
const client = new MilvusClient({ address: 'YOUR_CLUSTER_ENDPOINT' });

// コレクションを作成
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

<TabItem value='go'>

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
    WithName("my_id").
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

<TabItem value='bash'>

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

動的フィールドを使用すると、スキーマで定義されていない追加のフィールドを挿入できます。これらのフィールドは自動的に`#meta`に格納されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
entities = [
    {
        "my_id": 1, # 明示的に定義された主キー
        "my_vector": [0.1, 0.2, 0.3, 0.4, 0.5], # 明示的に定義されたベクターフィールド
        "overview": "Great product",       # スキーマで定義されていないスカラー
        "words": 150,                      # スキーマで定義されていないスカラー
        "dynamic_json": {                  # スキーマで定義されていないJSON
            "varchar": "some text",
            "nested": {
                "value": 42.5
            },
            "string_price": "99.99"        # 数値として格納された文字列
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

<TabItem value='javascript'>

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

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("my_id", []int64{1}).
    WithFloatVectorColumn("my_vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
    }).WithColumns(
    column.NewColumnVarChar("overview", []string{"Great product"}),
    column.NewColumnInt32("words", []int32{150}),
    column.NewColumnJSONBytes("dynamic_json", [][]byte{
        []byte(`{
            varchar: 'some text',
            nested: {
                value: 42.5,
            },
            string_price: '99.99',
        }`),
    }),
))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

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

## 動的フィールド内のキーにインデックスを作成\{#index-keys-in-the-dynamic-field}

Zilliz Cloudを使用すると、**JSONパスインデックス**を使用して、動的フィールド内の特定のキーにインデックスを作成できます。これらはJSONオブジェクト内のスカラー値またはネストされた値にすることができます。

<Admonition type="info" icon="📘" title="注意">

<p>動的フィールドキーにインデックスを作成するのは<strong>オプション</strong>です。インデックスなしでも動的フィールドキーでクエリやフィルタリングを実行できますが、総当たりの検索によるため、パフォーマンスが低下する可能性があります。</p>

</Admonition>

### JSONパスのインデックス構文\{#json-path-indexing-syntax}

JSONパスインデックスを作成するには、以下を指定します：

- **JSONパス**（`json_path`）：JSONオブジェクト内でインデックスを作成するキーまたはネストされたフィールドまでのパスを指定します。

    - 例：`metadata["category"]`

        これにより、インデックスエンジンがJSON構造内でどの場所を探すべきかが定義されます。

- **JSONキャスト型**（`json_cast_type`）：Zilliz Cloudが指定されたパスの値を解釈してインデックス化する際に使用するデータ型。

    - この型は、インデックス化されるフィールドの実際のデータ型と一致する必要があります。

    - 完全なリストについては、[サポートされているJSONキャスト型](./use-json-fields)を参照してください。

### JSONパスを使用した動的フィールドキーのインデックス作成\{#use-json-path-to-index-dynamic-field-keys}

動的フィールドはJSONフィールドであるため、JSONパス構文を使用して内の任意のキーにインデックスを作成できます。これは、単純なスカラー値と複雑なネストされた構造の両方に機能します。

**JSONパスの例：**

- 単純なキーの場合：`overview`、`words`

- ネストされたキーの場合：`dynamic_json['varchar']`、`dynamic_json['nested']['value']`

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# 単純な文字列キーをインデックス化
index_params.add_index(
    field_name="overview",  # 動的フィールド内のキー名
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデックス作成の場合はAUTOINDEXに設定する必要があります
    index_name="overview_index",  # 固有のインデックス名
    # highlight-start
    params={
        "json_cast_type": "varchar",   # Zilliz Cloudが値をインデックス化する際に使用するデータ型
        "json_path": "overview"        # キーへのJSONパス
    }
    # highlight-end
)

# 単純な数値キーをインデックス化
index_params.add_index(
    field_name="words",  # 動的フィールド内のキー名
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデックス作成の場合はAUTOINDEXに設定する必要があります
    index_name="words_index",  # 固有のインデックス名
    # highlight-start
    params={
        "json_cast_type": "double",  # Zilliz Cloudが値をインデックス化する際に使用するデータ型
        "json_path": "words" # キーへのJSONパス
    }
    # highlight-end
)

# JSONオブジェクト内のネストされたキーをインデックス化
index_params.add_index(
    field_name="dynamic_json", # 動的フィールド内のJSONキー名
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデックス作成の場合はAUTOINDEXに設定する必要があります
    index_name="json_varchar_index", # 固有のインデックス名
    # highlight-start
    params={
        "json_cast_type": "varchar", # Zilliz Cloudが値をインデックス化する際に使用するデータ型
        "json_path": "dynamic_json['varchar']" # ネストされたキーへのJSONパス
    }
    # highlight-end
)

# 深くネストされたキーをインデックス化
index_params.add_index(
    field_name="dynamic_json",
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデックス作成の場合はAUTOINDEXに設定する必要があります
    index_name="json_nested_index", # 固有のインデックス名
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

<TabItem value='javascript'>

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

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/index"
)

jsonIndex1 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", "overview")
    .WithIndexName("overview_index")
jsonIndex2 := index.NewJSONPathIndex(index.AUTOINDEX, "double", "words")
    .WithIndexName("words_index")
jsonIndex3 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `dynamic_json['varchar']`)
    .WithIndexName("json_varchar_index")
jsonIndex4 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `dynamic_json['nested']['value']`)
    .WithIndexName("json_nested_index")

indexOpt1 := milvusclient.NewCreateIndexOption("my_collection", "overview", jsonIndex1)
indexOpt2 := milvusclient.NewCreateIndexOption("my_collection", "words", jsonIndex2)
indexOpt3 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex3)
indexOpt4 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex4)
```

</TabItem>

<TabItem value='bash'>

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

### 型変換のためのJSONキャスト関数の使用\{#use-json-cast-functions-for-type-conversion}

動的フィールドキーに誤った形式で値が含まれている場合（たとえば文字列として格納されている数値）、キャスト関数を使用して変換できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# インデックス作成前に文字列をdoubleに変換
index_params.add_index(
    field_name="dynamic_json", # JSONキー名
    index_type="AUTOINDEX",
    index_name="json_string_price_index",
    params={
        "json_path": "dynamic_json['string_price']",
        "json_cast_type": "double", # キャスト関数の出力型でなければならない
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE" # 大文字小文字を区別しない; 文字列をdoubleに変換
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

<TabItem value='javascript'>

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

<TabItem value='go'>

```go
jsonIndex5 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `dynamic_json['string_price']`)
    .WithIndexName("json_string_price_index")
indexOpt5 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex5)
```

</TabItem>

<TabItem value='bash'>

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

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><p>型変換が失敗した場合（例：<code>"not_a_number"</code>のような値を数値に変換できない場合）、その値はスキップされ、インデックス化されません。</p></li>
<li><p>キャスト関数パラメータの詳細については、<a href="./use-json-fields">JSON Field</a>を参照してください。</p></li>
</ul>

</Admonition>

### コレクションへのインデックスの適用\{#apply-indexes-to-the-collection}

インデックスパラメータを定義した後、`create_index()`を使用してコレクションに適用できます：

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

<TabItem value='javascript'>

```javascript
  await client.createIndex(indexParams);
```

</TabItem>

<TabItem value='go'>

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

<TabItem value='bash'>

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

動的フィールドキーを持つエンティティを挿入した後、標準のフィルタ式を使用してフィルタリングできます。

- JSONでないキー（文字列、数値、ブール値など）については、キー名で直接参照できます。

- JSONオブジェクトを格納するキーについては、JSONパス構文を使用してネストされた値にアクセスします。

前のセクションの[例のエンティティ](./enable-dynamic-field#insert-entities-to-the-collection)に基づき、有効なフィルタ式は以下のとおりです：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'overview == "Great product"'                # 非JSONキー
filter = 'words >= 100'                               # 非JSONキー
filter = 'dynamic_json["nested"]["value"] < 50'       # JSONオブジェクトキー
```

</TabItem>

<TabItem value='java'>

```java
String filter = 'overview == "Great product"';
String filter = 'words >= 100';
String filter = 'dynamic_json["nested"]["value"] < 50';
```

</TabItem>

<TabItem value='javascript'>

```javascript
filter = 'overview == "Great product"'                // 非JSONキー
filter = 'words >= 100'                               // 非JSONキー
filter = 'dynamic_json["nested"]["value"] < 50'       // JSONオブジェクトキー
```

</TabItem>

<TabItem value='go'>

```go
filter := 'overview == "Great product"'
filter := 'words >= 100'
filter := 'dynamic_json["nested"]["value"] < 50'
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export filterOverview='overview == "Great product"'
export filterWords='words >= 100'
export filterNestedValue='dynamic_json["nested"]["value"] < 50'
```

</TabItem>
</Tabs>

**動的フィールドキーの取得**: 検索またはクエリ結果に動的フィールドキーを含めるには、フィルタリングと同じJSONパス構文を使用して`output_fields`パラメータに明示的に指定する必要があります：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 例: 動的フィールドキーを検索結果に含める
results = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],
    filter=filter,                         # 以前に定義したフィルター式
    limit=10,
    # highlight-start
    output_fields=[
        "overview",                        # 単純な動的フィールドキー
        'dynamic_json["varchar"]'          # ネストされたJSONキー
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
        .outputFields(Arrays.asList("overview", "dynamic_json['varchar']"))
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='javascript'>

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
    output_fields: ["overview", "dynamic_json['varchar']"]
})
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
    WithOutputFields("overview", "dynamic_json['varchar']"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

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
  \"outputFields\": [\"overview\", \"dynamic_json.varchar\"]
}"
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="注意">

<p>動的フィールドキーはデフォルトでは結果に含まれず、明示的に要求する必要があります。</p>

</Admonition>

サポートされる演算子とフィルター式の完全なリストについては、[Filtered Search](./filtered-search)を参照してください。

## すべてをまとめましょう\{#put-it-all-together}

ここまでで、スキーマで定義されていないキーを柔軟に格納およびインデックス化するために動的フィールドを使用する方法を学びました。一度動的フィールドキーが挿入されれば、フィルター式で他のフィールドと同様に使用できます—特別な構文は不要です。

実際のアプリケーションでワークフローを完了するには、以下のことも必要です：

- **ベクトルフィールドにインデックスを作成**（各コレクションに必須）

    [Index Vector Fields](./index-vector-fields)を参照してください

- **コレクションをロード**

    [Load & Release](./load-release-collections)を参照してください

- **JSONパスフィルターを使用して検索またはクエリ**

    [Filtered Search](./filtered-search)および[JSON Operators](./json-filtering-operators)を参照してください

## よくある質問\{#faq}

### スキーマで明示的にフィールドを定義する代わりに動的フィールドキーを使用すべき場面は？\{#when-should-i-define-a-field-explicitly-in-the-schema-instead-of-using-a-dynamic-field-key}

動的フィールドキーを使用する代わりに、スキーマでフィールドを明示的に定義すべきなのは以下のときです：

- **フィールドが頻繁に出力フィールドに含まれる場合**: 明示的に定義されたフィールドのみが`output_fields`を介して効率的に取得できることを保証されます。動的フィールドキーは高頻度の取得には最適化されておらず、パフォーマンスのオーバーヘッドが発生する可能性があります。

- **フィールドが頻繁にアクセスまたはフィルターされる場合**: 動的フィールドキーにインデックスを作成すれば固定スキーマフィールドと同様のフィルタリングパフォーマンスを提供できますが、明示的に定義されたフィールドはより明確な構造と保守性を提供します。

- **フィールドの動作を完全に制御する必要がある場合**: 明示的なフィールドはスキーマレベルの制約、検証、およびより明確な型付けをサポートし、データの整合性と一貫性を管理するのに役立ちます。

- **インデックスの不整合を避ける場合**: 動的フィールドキーのデータは型や構造の不整合が起こりやすいです。固定スキーマを使用すると、特にインデックスやキャストを計画している場合、データの品質を確保するのに役立ちます。

### 同じ動的フィールドキーに異なるデータ型で複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-dynamic-field-key-with-different-data-types}

いいえ、**1つのJSONパスにつき1つのインデックスのみ**作成できます。動的フィールドキーに混合型の値（文字列と数値など）が含まれていても、そのパスをインデックス化する際には単一の`json_cast_type`を選択する必要があります。同じキーに異なる型で複数のインデックスを作成することは現在サポートされていません。

### 動的フィールドキーをインデックス化するときに、データキャストが失敗した場合どうなりますか？\{#when-indexing-a-dynamic-field-key-what-if-the-data-casting-fails}

動的フィールドキーにインデックスを作成し、データキャストが失敗した場合—たとえば、`double`に変換しようとした値が`"abc"`のような非数値文字列だった場合—それらの特定の値は**インデックス作成中に黙ってスキップされます**。インデックスに含まれず、したがって**インデックスに依存するフィルター検索やクエリ結果では返されません**。

これにはいくつか重要な意味合いがあります：

- **完全スキャンにフォールバックしない**: ほとんどのエンティティが正常にインデックス化されれば、フィルタリングクエリは完全にインデックスに依存します。キャストの失敗が発生したエンティティは結果セットから除外されます—論理的にフィルター条件に一致する場合でも。

- **検索精度のリスク**: データ品質が一貫していない大規模データセット（特に動的フィールドキー）では、この動作により予期しない結果の欠落が生じる可能性があります。インデックス作成前に一貫した有効なデータ形式を確保することが重要です。

- **キャスト関数は慎重に使用**: インデックス作成中に文字列から数値への変換に`json_cast_function`を使用する場合、文字列値が確実に変換可能であることを確認してください。`json_cast_type`と実際に変換された型の不一致はエラーまたはスキップされたエントリを引き起こします。

### クエリがインデックスで使用されたキャスト型とは異なるデータ型を使用している場合どうなりますか？\{#what-happens-if-my-query-uses-a-different-data-type-than-the-indexed-cast-type}

クエリが**異なるデータ型**を使用して動的フィールドキーを比較する場合（たとえば、インデックスが`double`としてキャストされているにもかかわらず文字列による比較を行う場合）、システムは**インデックスを使用せず**、可能であれば完全スキャンにフォールバックします。最高のパフォーマンスと精度を確保するには、クエリの型がインデックス作成時の`json_cast_type`と一致していることを確認してください。