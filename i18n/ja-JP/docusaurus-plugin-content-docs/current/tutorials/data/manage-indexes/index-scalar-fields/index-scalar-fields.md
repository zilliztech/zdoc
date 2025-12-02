---
title: "スカラーフィールドのインデックス | Cloud"
slug: /index-scalar-fields
sidebar_label: "スカラーフィールドのインデックス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、特に大規模なデータセットにおいて、フィルタリングおよび検索パフォーマンスを大幅に高速化するために、スカラーフィールド（非ベクトルフィールド）のインデックス作成をサポートしています。 | Cloud"
type: origin
token: XCCwwOLqKi2nYGkfy5Gc0Vnfnpb
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - scalar field
  - index
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スカラーフィールドのインデックス

Zilliz Cloudは、特に大規模なデータセットにおいて、フィルタリングおよび検索パフォーマンスを大幅に高速化するために、スカラーフィールド（非ベクトルフィールド）のインデックス作成をサポートしています。

## 概要\{#overview}

スカラーフィールドのインデックス作成は任意ですが、フィルター条件で特定のスカラーフィールドに頻繁にアクセスする場合は推奨されます。

Zilliz Cloudは、以下のフィールドタイプに対して`AUTOINDEX`をサポートしています。

<table>
   <tr>
     <th><p>フィールドタイプ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列データ型。詳細については、<a href="./use-string-field">文字列フィールド</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>INT8</code>, <code>INT32</code>, <code>INT64</code></p></td>
     <td><p>整数。詳細については、<a href="./use-number-field">ブール値と数値</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT</code>, <code>DOUBLE</code></p></td>
     <td><p>浮動小数点。詳細については、<a href="./use-number-field">ブール値と数値</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>BOOL</code></p></td>
     <td><p>ブール値。詳細については、<a href="./use-number-field">ブール値と数値</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY</code></p></td>
     <td><p>スカラー値の同種配列。詳細については、<a href="./use-array-fields">配列フィールド</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>GEOMETRY</code></p></td>
     <td><p>空間情報を格納するジオメトリックデータ。詳細については、<a href="./use-geometry-field">ジオメトリフィールド</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>TIMESTAMPTZ</code></p></td>
     <td><p>タイムゾーン対応のISO 8601入力。複数のタイムゾーン間での一貫したフィルタリングと並べ替えのためにUTCとして保存されます。詳細については、<a href="./undefined">TIMESTAMPTZフィールド</a>を参照してください。</p></td>
   </tr>
</table>

## 事前準備\{#preparations}

インデックスを作成する前に、ベクトルフィールドとスカラーフィールドの両方を含むコレクションを定義します。Zilliz Cloudでは、すべてのコレクションにベクトルフィールドが必要です。

この例では、必須のベクトルフィールド（`vector`）と`DOUBLE`型のスカラーフィールド（`price`）を含む商品カタログのスキーマを定義します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # ご使用のクラスターエンドポイントに置き換えてください

# 動的フィールドサポート付きスキーマを定義
schema = client.create_schema(
    auto_id=False,
    # highlight-next-line
    enable_dynamic_field=True # 動的フィールドを有効化
)

# フィールドを定義
schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5) # ベクトルフィールド
schema.add_field(field_name="price", datatype=DataType.DOUBLE) # スカラーフィールド

# コレクションを作成
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

// クライアントを初期化
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT', // ご使用のクラスターエンドポイントに置き換えてください
});

const collectionName = 'product_catalog';

// スキーマを定義
const schema = [
  {
    name: 'product_id',
    description: '主キー',
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: false,
  },
  {
    name: 'vector',
    description: '埋め込みベクトル',
    data_type: DataType.FloatVector,
    type_params: {
      dim: '5',
    },
  },
  {
    name: 'price',
    description: '商品価格',
    data_type: DataType.Double,
  },
];

// コレクションを作成
const res = await client.createCollection({
    collection_name: collectionName,
    fields: schema,
    enable_dynamic_field: true,
});

console.log('コレクション作成結果:', res);
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

export schema="{
  \"autoID\": false,
  \"enableDynamicField\": true,
  \"fields\": [
    $productIdField,
    $vectorField,
    $priceField
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

## スカラーフィールドにインデックスを作成\{#index-a-scalar-field}

`AUTOINDEX`を使用してスカラーフィールドにインデックスを作成できます。追加のインデックスパラメータは必要ありません。以下の例では、`price`フィールドにインデックスを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params() # どのインデックスパラメータも指定せずに、空のIndexParamsオブジェクトを準備

index_params.add_index(
    field_name="price", # インデックス対象のスカラーフィールド名
    # highlight-next-line
    index_type="AUTOINDEX", # 作成するインデックスの種類
    index_name="price_index" # 作成するインデックス名
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

インデックスパラメータを定義したら、`create_index()`を使用してコレクションに適用できます。

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
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"indexParams\": [$priceIndex]
}"
```

</TabItem>
</Tabs>

## インデックスの詳細を確認\{#check-index-details}

インデックスを作成した後、その詳細を確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# インデックスを説明
res = client.list_indexes(
    collection_name="product_catalog"
)

print(res)

res = client.describe_index(
    collection_name="product_catalog",
    index_name="price_index"
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;

// インデックスを説明
// インデックス名を一覧表示
ListIndexesReq listIndexesReq = ListIndexesReq.builder()
    .collectionName("product_catalog")
    .build();

List<String> indexNames = client.listIndexes(listIndexesReq);

System.out.println(indexNames);

// インデックスを説明
DescribeIndexReq describeIndexReq = DescribeIndexReq.builder()
    .collectionName("product_catalog")
    .indexName("price_index")
    .build();

DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);

System.out.println(JSONObject.toJSON(describeIndexResp));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// インデックスを説明
res = await client.describeIndex({
    collection_name: "product_catalog",
    index_name: "price_index"
})

console.log(JSON.stringify(res.index_descriptions, null, 2))
```

</TabItem>
</Tabs>

## インデックスを削除\{#drop-an-index}

`drop_index()`メソッドを使用して、コレクションから既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="注意">

<p><strong>Milvus v2.6.x</strong>互換のクラスターでは、スカラーインデックスが不要になった時点で直接削除できます。まずコレクションを解放する必要はありません。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# インデックスを削除
client.drop_index(
    collection_name="product_catalog",
    index_name="price_index"
)
```

</TabItem>

<TabItem value='java'>

```java
// インデックスを削除

DropIndexReq dropIndexReq = DropIndexReq.builder()
    .collectionName("product_catalog")
    .indexName("price_index")
    .build();

client.dropIndex(dropIndexReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// インデックスを削除
res = await client.dropIndex({
    collection_name: "product_catalog",
    index_name: "price_index"
})

console.log(res.error_code)
```

</TabItem>
</Tabs>

## 高度な機能\{#advanced-features}

スカラーインデックスに関する他にも、ご興味をお持ちいただける高度な機能がいくつかあります。

import DocCardList from '@theme/DocCardList';

<DocCardList />