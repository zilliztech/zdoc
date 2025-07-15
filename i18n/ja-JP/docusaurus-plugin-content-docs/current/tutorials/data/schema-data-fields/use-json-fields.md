---
title: "JSONフィールド | Cloud"
slug: /use-json-fields
sidebar_label: "JSONフィールド"
beta: FALSE
notebook: FALSE
description: "JSONフィールドは、キーと値のペアでベクトルの埋め込みとともに追加情報を格納するスカラーフィールドです。以下は、データがJSON形式で格納される例です。 | Cloud"
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
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSONフィールド

[JSON](https://en.wikipedia.org/wiki/JSON)フィールドは、キーと値のペアでベクトルの埋め込みとともに追加情報を格納するスカラーフィールドです。以下は、データがJSON形式で格納される例です。

```python
{
  "metadata": {
    "product_info": {
      "category": "electronics",
      "brand": "BrandA"
    },
    "price": 99.99,
    "in_stock": true,
    "tags": ["summer_sale", "clearance"]
  }
}
```

## 限界{#limits}

- **フィールドサイズ**: JSONフィールドの体格は65,536バイトに制限されています。

- **ネストされたディクショナリ**: JSONフィールド値内のネストされたディクショナリは、ストレージ用のプレーン文字列として扱われます。

- **デフォルト値**: JSONフィールドはデフォルト値をサポートしていません。ただし、null属性をTrueに設定してnull値を許可することができます。詳細については、「[Nullableデフォルト](./nullable-and-default)」を参照してください。

- **タイプの一致**: JSONフィールドのキー値が整数または浮動小数点数の場合、同じタイプの別の数値キーと（式フィルターを介して）比較することができます。

- **命名**: JSONキーに名前を付ける場合は、文字、数字、アンダースコアのみを使用することをお勧めします。他の文字を使用すると、フィルタリングや検索時に問題が発生する可能性があります。

- **文字列の処理**: Milvusは、セマンティック変換なしでJSONフィールドに入力された文字列値を保存します。例えば: 

    - `'a"b'`,`"a'b"`,`'a\'b'`と`"a\"b"`はそのまま保存されます。

    - `'a'b'`と`"a"b"`は無効と見なされます。

- **JSONインデックス作成**: JSONフィールドのインデックス作成時に、フィルタリングを高速化するためにJSONフィールドに1つ以上のパスを指定できます。追加のパスごとにインデックス作成のオーバーヘッドが増加するため、インデックス作成戦略を注意深く計画してください。JSONフィールドのインデックス作成に関する詳細な考慮事項については、「[JSONインデックス作成に関する考慮事項](./use-json-fields#considerations-on-json-indexing)」を参照してください。

## JSONフィールドを追加する{#add-json-field}

このJSONフィールド`メタデータ`をコレクションスキーマに追加するには、`DataType. JSON`を使用します。以下の例では、null値を許可するJSONフィールド`メタデータ`を定義しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Import necessary libraries
from pymilvus import MilvusClient, DataType

# Define server address
SERVER_ADDR = "YOUR_CLUSTER_ENDPOINT"

# Create a MilvusClient instance
client = MilvusClient(uri=SERVER_ADDR)

# Define the collection schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

# Add a JSON field that supports null values
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)
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
        .isNullable(true)
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
    WithName("pk").
    WithDataType(entity.FieldTypeInt64).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(3),
).WithField(entity.NewField().
    WithName("metadata").
    WithDataType(entity.FieldTypeJSON),
)
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
    \"enableDynamicField\": true,
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

<p>将来、追加の未定義フィールドを挿入する必要がある場合は <code>enable_dynamic_fields=True</code>を設定してください。</p>
<p>JSONオブジェクトが欠落しているかnullである場合は、<code>nullable=True</code>を使用してください。</p>

</Admonition>

## インデックスパラメータの設定{#set-index-params}

インデックス作成Zilliz Cloud大量のデータを素早くフィルタリングまたは検索します。Zilliz Cloudインデックス化とは:

- ベクトルフィールドには**必須**です(類似検索を効率的に実行するため)。

- 特定のJSONパスのスカラーフィルターを高速化するためのJSONフィールドの**オプション**。

### JSONフィールドのインデックス{#index-a-json-field}

デフォルトでは、JSONフィールドはインデックス化されないため、フィルタークエリ(例:`metadata["price"]<100`)はすべての行をスキャンする必要があります。`metadata`フィールド内の特定のパスでクエリを加速したい場合は、関心のある各パスに反転インデックスを作成できます。

この例では、JSONフィールド`metadata`内の異なるパスに2つのインデックスを作成します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Example 1: Index the 'category' key inside 'product_info' as a string
index_params.add_index(
    field_name="metadata", # JSON field name to index
    index_type="INVERTED", # Index type. Set to INVERTED
    index_name="json_index_1", # Index name
    params={
        "json_path": "metadata[\"product_info\"][\"category\"]", # Path in JSON field to index
        "json_cast_type": "varchar" # Data type that the extracted JSON values will be cast to
    }
)

# Example 2: Index 'price' as a numeric type (double)
index_params.add_index(
    field_name="metadata",
    index_type="INVERTED",
    index_name="json_index_2",
    params={
        "json_path": "metadata[\"price\"]",
        "json_cast_type": "double"
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

List<IndexParam> indexes = new ArrayList<>();

Map<String,Object> extraParams_1 = new HashMap<>();
extraParams_1.put("json_path", "metadata[\"product_info\"][\"category\"]");
extraParams_1.put("json_cast_type", "varchar");
indexes.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("json_index_1")
        .indexType(IndexParam.IndexType.INVERTED)
        .extraParams(extraParams_1)
        .build());

Map<String,Object> extraParams_2 = new HashMap<>();
extraParams_2.put("json_path", "metadata[\"price\"]");
extraParams_2.put("json_cast_type", "double");
indexes.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("json_index_2")
        .indexType(IndexParam.IndexType.INVERTED)
        .extraParams(extraParams_2)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex1 := index.NewJSONPathIndex(index.Inverted, "varchar", `metadata["product_info"]["category"]`)
jsonIndex2 := index.NewJSONPathIndex(index.Inverted, "double", `metadata["price"]`)
indexOpt1 := milvusclient.NewCreateIndexOption("my_collection", "metadata", jsonIndex1)
indexOpt2 := milvusclient.NewCreateIndexOption("my_collection", "metadata", jsonIndex2)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [
    {
        field_name: "metadata",
        index_type: "INVERTED",
        index_name: "json_index_1",
        params: {
            json_path: "metadata[\"product_info\"][\"category\"]",
            json_cast_type: "varchar"
        }
    },
    {
        field_name: "metadata",
        index_type: "INVERTED",
        index_name: "json_index_2",
        params: {
            json_path: "metadata[\"price\"]",
            json_cast_type: "double"
        }
    }
]

```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "indexParams": [
        {
            "fieldName": "metadata",
            "indexName": "json_index_1",
            "indexType": "INVERTED",
            "params": {
                "json_path": "metadata[\"product_info\"][\"category\"]",
                "json_cast_type": "varchar"
            }
        }
    ]
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "indexParams": [
        {
            "fieldName": "metadata",
            "indexName": "json_index_2",
            "indexType": "INVERTED",
            "params": {
                "json_path": "metadata[\"price\"]",
                "json_cast_type": "double"
            }
        }
    ]
}'
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
     <th><p>例の値</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>スキーマ内のJSONフィールドの名前。</p></td>
     <td><p><code>"metadata"</code></p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>作成するインデックスタイプ。現在、JSONパスインデックスには<code>INVERTED</code>のみがサポートされています。</p></td>
     <td><p><code>"INVERTED"</code></p></td>
   </tr>
   <tr>
     <td><p><code>index_name</code></p></td>
     <td><p>（オプション）カスタムインデックス名。同じJSONフィールドに複数のインデックスを作成する場合は、異なる名前を指定してください。</p></td>
     <td><p><code>"json_index_1"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.json_path</code></p></td>
     <td><p>インデックスを作成するJSONパスを指定します。ネストされたキー、配列の位置、または両方をターゲットにすることができます（例:<code>metadata["product_info"]["category"]</code>または<code>metadata["tags"][0]</code>）。</p><p>パスがない場合、または特定の行に配列要素が存在しない場合、インデックス作成中にその行は単にスキップされ、エラーはスローされません。</p></td>
     <td><p><code>"metadata[\"product_info\"][\"category\"]"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.json_cast_type</code></p></td>
     <td><p>ああ、データ型Zilliz Cloudインデックスを構築する際に、抽出されたJSON値をキャストします。有効な値:</p><ul><li><p>"bool"または"BOOL"</p></li><li><p>"double"または"double"</p></li><li><p>"varchar"または"VARCHAR"</p><p>注意:整数値の場合、Zilliz Cloud内部的にはインデックスにdoubleを使用します。2^53を超える大きな整数は精度を失います。型キャストが失敗した場合(型の不一致によるもの)、エラーはスローされず、その行の値はインデックスされません。</p></li></ul></td>
     <td><p><code>"varchar"</code></p></td>
   </tr>
</table>

#### JSONインデックスに関する考慮事項{#considerations-on-json-indexing}

- **フィルタリングロジック**:

    - double型インデックス（json_cast_type="double"）を作成する場合、数値型のフィルタ条件のみがインデックスを使用できます。フィルタがdouble型インデックスと非数値型の条件を比較する場合、Zilliz Cloudブルートフォース検索に戻ります。

    - varchar型インデックス(json_cast_type="varchar")を作成した場合、文字列型のフィルタ条件のみがインデックスを使用できます。それ以外の場合は、Zilliz Cloudブルートフォースに戻る。

    - ブールインデックスはvarchar-typeと同様に動作します。

- **用語の表現**:

    - [value 1, value 2,...]でjson["field"]を使用することができます。ただし、インデックスはそのパスに格納されたスカラー値に対してのみ機能します。json["field"]が配列の場合、クエリはブルートフォースにフォールバックされます（配列型インデックスはまだサポートされていません）。

- **数値の精度**:

    - 内部的に、Zilliz Cloudすべての数値フィールドをdoubleとしてインデックス化します。数値が2^{53}を超えると精度が低下し、範囲外の値に対するクエリは完全に一致しない可能性があります。

- **データの整合性**:

    - Zilliz Cloud指定されたキャストを超えてJSONキーを解析または変換しません。ソースデータが一貫性がない場合(例えば、一部の行はキー"k"の文字列を格納し、他の行は数値を格納します)、一部の行はインデックス化されません。

### ベクトル場のインデックス{#index-a-vector-field}

次の例では、`AUTOINDEX`インデックスタイプを使用してベクトル場の`embedding`にインデックスを作成します。このタイプでは、Zilliz Cloudデータ型に基づいて最適なインデックスを自動的に選択します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params

index_params = client.prepare_index_params()

# Index `embedding` with AUTOINDEX and specify similarity metric type
index_params.add_index(
    field_name="embedding",
    index_name="vector_index",
    index_type="AUTOINDEX",  # Use automatic indexing to simplify complex index settings
    metric_type="COSINE"  # Specify similarity metric type, options include L2, COSINE, or IP
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
        .indexName("vector_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
vectorIndex := index.NewAutoIndex(entity.COSINE)
indexOpt := milvusclient.NewCreateIndexOption("my_collection", "embedding", vectorIndex)
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    index_name: 'embedding_index',
    field_name: 'embedding',
    index_name: 'vector_index',
    metricType: MetricType.CONSINE,
    index_type: IndexType.AUTOINDEX,
));
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "embedding",
            "indexName": "vector_index",
            "metricType": "COSINE",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

## コレクションを作成{#create-collection}

スキーマとインデックスが定義されたら、文字列フィールドを含むコレクションを作成してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
    WithIndexOptions(indexOpt1, indexOpt2, indexOpt))
if err != nil {
    fmt.Println(err.Error())
    // handler err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    index_params: indexParams
});
```

</TabItem>

<TabItem value='bash'>

```bash
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

## データの挿入{#insert-data}

コレクションを作成した後、スキーマに一致するエンティティを挿入してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample data
data = [
    {
        "metadata": {
            "product_info": {"category": "electronics", "brand": "BrandA"},
            "price": 99.99,
            "in_stock": True,
            "tags": ["summer_sale"]
        },
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    },
    {
        "metadata": None,  # Entire JSON object is null
        "pk": 2,
        "embedding": [0.56, 0.78, 0.90]
    },
    {
        # JSON field is completely missing
        "pk": 3,
        "embedding": [0.91, 0.18, 0.23]
    },
    {
        # Some sub-keys are null
        "metadata": {
            "product_info": {"category": None, "brand": "BrandB"},
            "price": 59.99,
            "in_stock": None
        },
        "pk": 4,
        "embedding": [0.56, 0.38, 0.21]
    }
]

client.insert(
    collection_name="my_collection",
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
rows.add(gson.fromJson("{\"metadata\":{\"product_info\":{\"category\":\"electronics\",\"brand\":\"BrandA\"},\"price\":99.99,\"in_stock\":True,\"tags\":[\"summer_sale\"]},\"pk\":1,\"embedding\":[0.12,0.34,0.56]}", JsonObject.class));
rows.add(gson.fromJson("{\"metadata\":null,\"pk\":2,\"embedding\":[0.56,0.78,0.90]}", JsonObject.class));
rows.add(gson.fromJson("{\"pk\":3,\"embedding\":[0.91,0.18,0.23]}", JsonObject.class));
rows.add(gson.fromJson("{\"metadata\":{\"product_info\":{\"category\":null,\"brand\":\"BrandB\"},\"price\":59.99,\"in_stock\":null},\"pk\":4,\"embedding\":[0.56,0.38,0.21]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("pk", []int64{1, 2, 3, 4}).
    WithFloatVectorColumn("embedding", 3, [][]float32{
        {0.12, 0.34, 0.56},
        {0.56, 0.78, 0.90},
        {0.91, 0.18, 0.23},
        {0.56, 0.38, 0.21},
    }).WithColumns(
    column.NewColumnJSONBytes("metadata", [][]byte{
        []byte(`{
    "product_info": {"category": "electronics", "brand": "BrandA"},
    "price": 99.99,
    "in_stock": True,
    "tags": ["summer_sale"]
}`),
        []byte(`null`),
        []byte(`null`),
        []byte(`"metadata": {
    "product_info": {"category": None, "brand": "BrandB"},
    "price": 59.99,
    "in_stock": None
}`),
    }),
))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {
        "metadata": {
            "product_info": {"category": "electronics", "brand": "BrandA"},
            "price": 99.99,
            "in_stock": True,
            "tags": ["summer_sale"]
        },
        "pk": 1,
        "embedding": [0.12, 0.34, 0.56]
    },
    {
        "metadata": None,  # Entire JSON object is null
        "pk": 2,
        "embedding": [0.56, 0.78, 0.90]
    },
    {
        # JSON field is completely missing
        "pk": 3,
        "embedding": [0.91, 0.18, 0.23]
    },
    {
        # Some sub-keys are null
        "metadata": {
            "product_info": {"category": None, "brand": "BrandB"},
            "price": 59.99,
            "in_stock": None
        },
        "pk": 4,
        "embedding": [0.56, 0.38, 0.21]
    }
];

await client.insert({
    collection_name: "my_collection",
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
--data '{
    "data": [
        {
             "metadata":  {
                   "product_info": {"category": "electronics", "brand": "BrandA"},
                  "price":  99.99,
                   "in_stock":  true,
                  "tags": ["summer_sale"]
              }, 
             "varchar_field2": "High quality product", 
             "pk": 1, 
             "embedding": [0.1, 0.2, 0.3]
          },
          {
              "metadata": null,
              "pk": 2,
              "embedding": [0.56, 0.78, 0.90]
          },
         {
               "pk": 3,
               "embedding": [0.91, 0.18, 0.23]
         },
        {
              "metadata": {
                     "product_info": {"category": null, "brand": "BrandB"},
                     "price": 59.99,
                     "in_stock": null
               },
              "pk": 4,
              "embedding": [0.56, 0.38, 0.21]
         }
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## フィルタ式を使用したクエリ{#query-with-filter-expressions}

エンティティを挿入した後、queryメソッドを使用して、指定したフィルター式に一致するエンティティを取得します。

<Admonition type="info" icon="📘" title="ノート">

<p>null値を許可するJSONフィールドの場合、JSONオブジェクト全体が欠落しているか、Noneに設定されている場合、フィールドはnullとして扱われます。詳細については、<a href="./basic-filtering-operators#json-fields-with-null-values">Null値を持つJSONフィールド</a>を参照してください。</p>

</Admonition>

`metadata`がnullでないエンティティを取得するには:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query to filter out records with null metadata

filter = 'metadata is not null'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["metadata", "pk"]
)

# Expected result:
# Rows with pk=1 and pk=4 have valid, non-null metadata.
# Rows with pk=2 (metadata=None) and pk=3 (no metadata key) are excluded.

print(res)

# Output:
# data: [
#     "{'metadata': {'product_info': {'category': 'electronics', 'brand': 'BrandA'}, 'price': 99.99, 'in_stock': True, 'tags': ['summer_sale']}, 'pk': 1}",
#     "{'metadata': {'product_info': {'category': None, 'brand': 'BrandB'}, 'price': 59.99, 'in_stock': None}, 'pk': 4}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "metadata is not null";
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("metadata", "pk"))
        .build());

System.out.println(resp.getQueryResults());

// Output
//
// [
//    QueryResp.QueryResult(entity={metadata={"product_info":{"category":"electronics","brand":"BrandA"},"price":99.99,"in_stock":true,"tags":["summer_sale"]}, pk=1}),
//    QueryResp.QueryResult(entity={metadata={"product_info":{"category":null,"brand":"BrandB"},"price":59.99,"in_stock":null}, pk=4})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter := "metadata is not null"
rs, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("metadata", "pk"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("pk", rs.GetColumn("pk").FieldData().GetScalars())
fmt.Println("metadata", rs.GetColumn("metadata").FieldData().GetScalars())
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.query({
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
    "collectionName": "my_collection",
    "filter": "metadata is not null",
    "outputFields": ["metadata", "pk"]
}'

#{"code":0,"cost":0,"data":[{"metadata":"{\"product_info\": {\"category\": \"electronics\", \"brand\": \"BrandA\"}, \"price\": 99.99, \"in_stock\": true, \"tags\": [\"summer_sale\"]}","pk":1},{"metadata":"","pk":2},{"metadata":"","pk":3},{"metadata":"{\"product_info\": {\"category\": null, \"brand\": \"BrandB\"}, \"price\": 59.99, \"in_stock\": null}","pk":4}]}
```

</TabItem>
</Tabs>

`metadata["product_info"]["category"]`が`"electronics"`であるエンティティを取得するには:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata["product_info"]["category"] == "electronics"'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["metadata", "pk"]
)

# Expected result:
# - Only pk=1 has "category": "electronics".
# - pk=4 has "category": None, so it doesn't match.
# - pk=2 and pk=3 have no valid metadata.

print(res)

# Output:
# data: [
#     "{'pk': 1, 'metadata': {'product_info': {'category': 'electronics', 'brand': 'BrandA'}, 'price': 99.99, 'in_stock': True, 'tags': ['summer_sale']}}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "metadata[\"product_info\"][\"category\"] == \"electronics\"";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("metadata", "pk"))
        .build());

System.out.println(resp.getQueryResults());

// Output
// [QueryResp.QueryResult(entity={metadata={"product_info":{"category":"electronics","brand":"BrandA"},"price":99.99,"in_stock":true,"tags":["summer_sale"]}, pk=1})]
```

</TabItem>

<TabItem value='go'>

```go
filter = `metadata["product_info"]["category"] == "electronics"`
rs, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("metadata", "pk"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("pk", rs.GetColumn("pk").FieldData().GetScalars())
fmt.Println("metadata", rs.GetColumn("metadata").FieldData().GetScalars())
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'metadata["category"] == "electronics"';
const res = await client.query({
    collection_name: "my_collection",
    filter: filter,
    output_fields: ["metadata", "pk"]
});

// Example output:
// {
//.  data: [
//      {'pk': 1, 'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}}
// ]
// }
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
  "collectionName": "my_collection",
  "filter": "metadata[\"product_info\"][\"category\"] == \"electronics\"",
  "outputFields": ["metadata", "pk"]
}'

#{"code":0,"cost":0,"data":[{"metadata":"{\"product_info\": {\"category\": \"electronics\", \"brand\": \"BrandA\"}, \"price\": 99.99, \"in_stock\": true, \"tags\": [\"summer_sale\"]}","pk":1}]}
```

</TabItem>
</Tabs>

## フィルタ式を用いたベクトル検索{#vector-search-with-filter-expressions}

基本的なスカラー場フィルタリングに加えて、ベクトル類似検索をスカラー場フィルターと組み合わせることができます。例えば、次のコードはベクトル検索にスカラー場フィルターを追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata["product_info"]["brand"] == "BrandA"'

res = client.search(
    collection_name="my_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["metadata"],
    filter=filter
)

# Expected result:
# - Only pk=1 has "brand": "BrandA" in metadata["product_info"].
# - pk=4 has "brand": "BrandB".
# - pk=2 and pk=3 have no valid metadata.
# Hence, only pk=1 matches the filter.

print(res)

# Output:
# data: [
#     "[{'id': 1, 'distance': -0.2479381263256073, 'entity': {'metadata': {'product_info': {'category': 'electronics', 'brand': 'BrandA'}, 'price': 99.99, 'in_stock': True, 'tags': ['summer_sale']}}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "metadata[\"product_info\"][\"brand\"] == \"BrandA\"";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Collections.singletonList("metadata"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [
//   [
//     SearchResp.SearchResult(entity={metadata={"product_info":{"category":"electronics","brand":"BrandA"},"price":99.99,"in_stock":true,"tags":["summer_sale"]}}, score=-0.24793813, id=1)
//   ]
// ]

```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3, -0.6, -0.1}
filter = "metadata[\"product_info\"][\"brand\"] == \"BrandA\""

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 10)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithFilter(filter).
    WithOutputFields("metadata").
    WithAnnParam(annParam))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("metadata", resultSet.GetColumn("metadata").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
  "collectionName": "my_collection",
  "data": [
    [0.3, -0.6, 0.1]
  ],
  "annsField": "embedding",
  "limit": 5,
  "searchParams": {
    "params": {
      "nprobe": 10
    }
  },
  "outputFields": ["metadata"],
  "filter": "metadata[\"product_info\"][\"brand\"] == \"BrandA\""
}'

##{"code":0,"cost":0,"data":[{"metadata":"{\"product_info\": {\"category\": \"electronics\", \"brand\": \"BrandA\"}, \"price\": 99.99, \"in_stock\": true, \"tags\": [\"summer_sale\"]}","pk":1}]}
```

</TabItem>
</Tabs>

さらに、Zilliz Cloud`JSON_CONTAINS`、`JSON_CONTAINS_ALL`、`JSON_CONTAINS_ANY`などの高度なJSONフィルタリング演算子をサポートし、クエリ機能をさらに強化できます。詳細については、「[JSON演算子](./json-filtering-operators)」を参照してください。