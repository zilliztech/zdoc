---
title: "インデックススカラーフィールド | BYOC"
slug: /index-scalar-fields
sidebar_label: "インデックススカラーフィールド"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、スカラーフィールド（非ベクトルフィールド）でのインデックス化をサポートしており、特に大規模なデータセットでのフィルタリングと検索のパフォーマンスを大幅に向上させます。 | BYOC"
type: origin
token: XCCwwOLqKi2nYGkfy5Gc0Vnfnpb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - scalar field
  - index
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# インデックススカラーフィールド

Zilliz Cloudは、スカラーフィールド（非ベクトルフィールド）でのインデックス化をサポートしており、特に大規模なデータセットでのフィルタリングと検索のパフォーマンスを大幅に向上させます。

<Admonition type="info" icon="📘" title="ノート">

<p>スカラーフィールドのインデックスは<strong>オプション</strong>ですが、フィルター条件で頻繁に使用されるフィールドには強くお勧めします。</p>

</Admonition>

## インデックスできるもの{#what-you-can-index}

Zilliz Cloudは、次のフィールドタイプに対して`AUTOINDEX`をサポートしています:

<table>
   <tr>
     <th><p>フィールドタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>ストリング</p></td>
   </tr>
   <tr>
     <td><p><code>INT8</code>, <code>INT32</code>,<code>INT64</code>,インラインコードプレースホルダー</p></td>
     <td><p>Integer型の整数</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
     <td><p>浮動小数点</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>ブール値</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>スカラー値の均質配列</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>スキーマ定義または動的フィールド(特定のパスターゲティング付き)</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>JSONオブジェクト全体のインデックスはサポートされていません。JSONフィールド内にスカラー値へのパスを指定する必要があります。詳細については、<a href="./use-json-fields">JSONフィールド</a>を参照してください。</p>

</Admonition>

## コレクションスキーマを定義する{#define-a-collection-schema}

インデックスを作成する前に、ベクトルフィールドとスカラーフィールドの両方を含むコレクションを定義してください。Zilliz Cloudでは、すべてのコレクションにベクトルフィールドが必要です。

この例では、スカラーフィールド、JSON `metadata`フィールド、必須のベクトルフィールドを含む製品カタログのスキーマを定義し、動的フィールド機能を有効にします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your cluster endpoint

# Define schema with dynamic field support
schema = client.create_schema(
    auto_id=False,
    # highlight-next-line
    enable_dynamic_field=True # Enable dynamic field
)

# Required fields
schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# Scalar and JSON fields
# highlight-start
schema.add_field(field_name="price", datatype=DataType.DOUBLE)
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)
# highlight-end

# Create the collection
client.create_collection(
    collection_name="product_catalog",
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
        .fieldName("product_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Double)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("metadata")
        .dataType(DataType.JSON)
        .isNullable(true)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("product_catalog")
        .collectionSchema(schema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

// initialize client
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT', // Replace with your cluster endpoint
});

const collectionName = 'product_catalog';

// define schema
const schema = [
  {
    name: 'product_id',
    description: 'Primary key',
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: false,
  },
  {
    name: 'vector',
    description: 'Embedding vector',
    data_type: DataType.FloatVector,
    type_params: {
      dim: '5',
    },
  },
  {
    name: 'price',
    description: 'Product price',
    data_type: DataType.Double,
  },
  {
    name: 'metadata',
    description: 'Additional metadata',
    data_type: DataType.JSON,
    is_nullable: true,
  },
];

// create collection
const res = await client.createCollection({
    collection_name: collectionName,
    fields: schema,
    enable_dynamic_field: true,
});

console.log('Create collection result:', res);
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
    WithName("product_id").pk
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
).WithField(entity.NewField().
    WithName("price").
    WithDataType(entity.FieldTypeDouble),
).WithField(entity.NewField().
    WithName("metadata").
    WithDataType(entity.FieldTypeJSON).
    WithNullable(true),
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("product_catalog", schema))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

```bash
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export productIdField='{
  "fieldName": "product_id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": false
}'

export vectorField='{
  "fieldName": "vector",
  "dataType": "FloatVector",
  "elementTypeParams": {
    "dim": 5
  }
}'

export priceField='{
  "fieldName": "price",
  "dataType": "Double"
}'

export metadataField='{
  "fieldName": "metadata",
  "dataType": "JSON",
  "isNullable": true
}'

export schema="{
  \"autoID\": false,
  \"enableDynamicField\": true,
  \"fields\": [
    $productIdField,
    $vectorField,
    $priceField,
    $metadataField
  ]
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"schema\": $schema
}"

```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<p>JSONフィールドと動的フィールドの使用方法の詳細については、<a href="./use-json-fields">JSONフィールド</a>と<a href="./enable-dynamic-field">ダイナミックフィールド</a>を参照してください。</p>

</Admonition>

## インデックス非JSONフィールド{#index-a-non-json-field}

`AUTOINDEX`を使用して、JSON以外のスカラーフィールドにインデックスを作成できます。追加のインデックスパラメータは必要ありません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params() # Prepare an empty IndexParams object, without having to specify any index parameters

index_params.add_index(
    field_name="price", # Name of the scalar field to be indexed
    # highlight-next-line
    index_type="AUTOINDEX", # Type of index to be created
    index_name="price_index" # Name of the index to be created
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(IndexParam.builder()
        .fieldName("price")
        .indexName("price_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    collection_name: collectionName,
    field_name: 'price',
    index_type: 'AUTOINDEX',
    index_name: 'price_index'
}];
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/index"
)

indexOpt := client.NewCreateIndexOption("product_catalog", "price",
        index.NewInvertedIndex())
```

</TabItem>

<TabItem value='bash'>

```bash
export priceIndex='{
  "fieldName": "price",
  "indexName": "price_index",
  "params": {
    "index_type": "AUTOINDEX"
  }
}'

```

</TabItem>
</Tabs>

## JSONフィールドのインデックス{#index-a-json-field}

Zilliz Cloudは、**JSONパスインデックス**を使用してJSONフィールドのインデックスをサポートしています。これにより、フィールド全体をスキャンすることなく、JSONオブジェクト内のキーまたはネストされた値でフィルタリングできます。

### JSONフィールドの例{#example-json-field}

スキーマ定義の`metadata`フィールドを考えてみましょう。

```json
{
  "metadata": {
    "category": "electronics",
    "brand": "BrandA",
    "in_stock": true,
    "tags": ["clearance", "summer_sale"],
    "string_price": "99.99"
  }
}
```

パスにインデックスを作成することができます:

- インラインコードプレースホルダー0

- インラインコードプレースホルダー0

- 'metadata["string_price"]'→[cast関数を使用する](./index-scalar-fields#use-json-cast-functions-for-type-conversion)を使用して、文字列番号をdoubleに変換します。

### JSONパスインデックスの構文{#json-path-indexing-syntax}

JSONパスインデックスを作成するには、次のように指定します。

- JSONパス(`json_path`):インデックス化したいJSONオブジェクト内のキーまたはネストされたフィールドへのパス。

    - 例: `metadata["category"]`の場合

        これにより、インデックスエンジンがJSON構造内のどこを見るべきかが定義されます。

- **JSONキャストタイプ**(`json_cast_type`):データ型Zillizクラウド指定されたパスの値を解釈およびインデックス化する場合に使用する必要があります。

    - このタイプは、インデックス化されるフィールドの実際のデータ型と一致する必要があります。

    - 完全なリストについては、[サポートされているJSONキャストタイプ](./use-json-fields#supported-json-cast-types)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Index the category field as a string
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="category_index",
    # highlight-start
    params={
        "json_path": "metadata[\"category\"]",
        "json_cast_type": "varchar"
    }
    # highlight-end
)

# Index the tags array as string array
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="tags_array_index", 
    # highlight-start
    params={
        "json_path": "metadata[\"tags\"]",
        "json_cast_type": "array_varchar"
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> extraParams1 = new HashMap<>();
extraParams1.put("json_path", "metadata[\"category\"]");
extraParams1.put("json_cast_type", "varchar");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("category_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams1)
        .build());

Map<String,Object> extraParams2 = new HashMap<>();
extraParams2.put("json_path", "metadata[\"tags\"]");
extraParams2.put("json_cast_type", "array_varchar");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("tags_array_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams2)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    collection_name: collectionName,
    field_name: 'metadata',
    index_name: 'category_index',
    index_type: 'AUTOINDEX',
    params: {
      json_path: 'metadata["category"]',
      json_cast_type: 'varchar',
    },
  });
  
indexParams.push({
    collection_name: collectionName,
    field_name: 'metadata',
    index_name: 'tags_array_index',
    index_type: 'AUTOINDEX',
    params: {
      json_path: 'metadata["tags"]',
      json_cast_type: 'array_varchar',
    },
  });
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex1 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["category"]`)
    .WithIndexName("category_index")
jsonIndex2 := index.NewJSONPathIndex(index.AUTOINDEX, "array_varchar", `metadata["tags"]`)
    .WithIndexName("tags_array_index")

indexOpt1 := milvusclient.NewCreateIndexOption("product_catalog", "metadata", jsonIndex1)
indexOpt2 := milvusclient.NewCreateIndexOption("product_catalog", "metadata", jsonIndex2)
```

</TabItem>

<TabItem value='bash'>

```bash
export categoryIndex='{
  "fieldName": "metadata",
  "indexName": "category_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\"category\"]",
    "json_cast_type": "varchar"
  }
}'

export tagsArrayIndex='{
  "fieldName": "metadata",
  "indexName": "tags_array_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\"tags\"]",
    "json_cast_type": "array_varchar"
  }
}'
```

</TabItem>
</Tabs>

### 型変換にJSONキャスト関数を使用する{#use-json-cast-functions-for-type-conversion}

JSONに正しくない形式の値が含まれている場合(文字列として格納されている数値など)、インデックス作成中にキャスト関数を使用して値を変換できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Convert string numbers to double for indexing
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="string_to_double_index",
    # highlight-start
    params={
        "json_path": "metadata[\"string_price\"]",
        "json_cast_type": "double", # # Must be the output type of the cast function
        "json_cast_function": "STRING_TO_DOUBLE" # Case insensitive
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> extraParams3 = new HashMap<>();
extraParams3.put("json_path", "metadata[\"string_price\"]");
extraParams3.put("json_cast_type", "double");
extraParams3.put("json_cast_function", "STRING_TO_DOUBLE");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("string_to_double_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams3)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    collection_name: collectionName,
    field_name: 'metadata',
    index_name: 'string_to_double_index',
    index_type: 'AUTOINDEX',
    params: {
      json_path: 'metadata["string_price"]',
      json_cast_type: 'double',                   
      json_cast_function: 'STRING_TO_DOUBLE',     
    },
});
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex3 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `metadata["string_price"]`)
                    .WithIndexName("string_to_double_index")

indexOpt3 := milvusclient.NewCreateIndexOption("product_catalog", "metadata", jsonIndex3)

```

</TabItem>

<TabItem value='bash'>

```bash
export stringToDoubleIndex='{
  "fieldName": "metadata",
  "indexName": "string_to_double_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\"string_price\"]",
    "json_cast_type": "double",
    "json_cast_function": "STRING_TO_DOUBLE"
  }
}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>型の変換に失敗した場合（例えば、<code>"not_a_number"</code>の値を数値に変換できない場合）、その値はスキップされ、インデックス化されません。</p></li>
<li><p>キャスト関数のパラメータの詳細については、<a href="./use-json-fields#use-json-cast-functions-for-type-conversion">JSONフィールド</a>を参照してください。</p></li>
</ul>

</Admonition>

## 動的フィールド内のインデックスキー{#index-keys-in-the-dynamic-field}

動的フィールドが有効になっている場合、スキーマで明示的に定義されていない特定のスカラーキーをインデックス化できます。これらのキーは非表示のJSONフィールドに格納され、インデックス化の目的で他のスカラーフィールドと同様に扱われます。

<Admonition type="info" icon="📘" title="ノート">

<p>ダイナミックフィールドの詳細については、<a href="./enable-dynamic-field">ダイナミックフィールド</a>を参照してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Index a dynamic key (e.g., inserted but not defined in schema)
index_params.add_index(
    field_name="overview",  # Key name in the dynamic field
    index_type="AUTOINDEX",
    index_name="overview_index",
    # highlight-start
    params={
        "json_path": "overview", # Key name in the dynamic field
        "json_cast_type": "varchar" # # Data type that Zilliz Cloud uses when indexing the values
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> extraParams4 = new HashMap<>();
extraParams4.put("json_path", "overview");
extraParams4.put("json_cast_type", "varchar");
indexParams.add(IndexParam.builder()
        .fieldName("overview")
        .indexName("overview_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams4)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    collection_name: collectionName,
    field_name: 'overview', 
    index_name: 'overview_index',
    index_type: 'AUTOINDEX',
    params: {
      json_path: 'overview',
      json_cast_type: 'varchar',
    },
});
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex4 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", "overview")
                    .WithIndexName("overview_index")

indexOpt4 := milvusclient.NewCreateIndexOption("product_catalog", "overview", jsonIndex4)
```

</TabItem>

<TabItem value='bash'>

```bash
export overviewIndex='{
  "fieldName": "overview",
  "indexName": "overview_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "overview",
    "json_cast_type": "varchar"
  }
}'
```

</TabItem>
</Tabs>

## コレクションにインデックスを適用する{#apply-indexes-to-the-collection}

インデックスパラメータを定義した後、`create_index()`を使用してコレクションに適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_index(
    collection_name="product_catalog",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.CreateIndexReq;

client.createIndex(CreateIndexReq.builder()
        .collectionName("product_catalog")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.createIndex(indexParams)
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
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams="[
  $categoryIndex,
  $tagsArrayIndex,
  $stringToDoubleIndex,
  $overviewIndex
]"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## よくある質問(FAQ){#faq}

### スカラーフィールドにインデックスを作成するのはいつですか?{#when-should-i-create-indexes-on-scalar-fields}

スカラーインデックスを作成することは**オプション**ですが、フィールドがフィルター条件で頻繁に使用される場合は強くお勧めします。インデックスがない場合、Zilliz Cloudはフィルタリング中にフルコレクションスキャンを実行し、大規模なデータセットのパフォーマンスに重大な影響を与える可能性があります。このようなフィールドにインデックスを付けることで、スカラーインデックスを使用した高速フィルタリングが可能になります。

### 同じJSONフィールドに複数のインデックスを作成できますか?{#can-i-create-multiple-indexes-on-the-same-json-field}

はい、同じJSONフィールド内の異なるパスにインデックスを付けることはできますが、一意のパスごとに1つのインデックスのみが許可されています。

### 特定のJSONパスをインデックス化する場合、一部の行にJSONパスが存在しない場合はどうなりますか?{#when-indexing-a-specific-json-path-what-if-the-json-path-doesnt-exist-in-some-rows}

インデックス作成中にこれらの行は静かにスキップされます。エラーは発生しません。

### JSONフィールドをインデックス化する場合、キャスト関数が失敗した場合はどうなりますか?{#when-indexing-a-json-field-what-happens-when-cast-functions-fail}

Zilliz Cloudは、数値に解析できない文字列など、変換できない値を静かに無視します。

### 特定の配列要素をインデックス化できますか?{#can-i-index-specific-array-elements}

はい、配列の最初の要素に`metadata["tags"][0]`のような特定の配列位置をインデックス化することができます。

### JSONフィールドの一部の値がインデックス型にキャストできない場合、どうなりますか?{#what-happens-if-some-values-in-a-json-field-cant-be-cast-to-the-index-type}

インデックス作成中は自動的にスキップされ、インデックスベースのクエリ結果から除外されます。これにより、データの型に一貫性がない場合に部分的な結果が生じる可能性があります。

### 同じJSONフィールドパスを異なるタイプで複数回インデックス化できますか?{#can-i-index-the-same-json-field-path-multiple-times-with-different-types}

いいえ、単一のJSONパスまたは動的フィールドキーは、一度に1つのインデックスのみをサポートします。インデックス作成には、`json_cast_type`を1つ選択する必要があります。

### JSONフィールドまたは動的フィールドのインデックスに関する詳細はどこで見つけることができますか?{#where-can-i-find-full-details-about-indexing-json-fields-or-dynamic-fields}

詳細については、[JSONフィールド](./use-json-fields)および[ダイナミックフィールド](./enable-dynamic-field)のセクションを参照してください。