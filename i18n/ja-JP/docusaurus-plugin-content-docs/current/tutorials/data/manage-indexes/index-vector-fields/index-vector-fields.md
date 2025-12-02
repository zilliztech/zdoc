---
title: "ベクトルフィールドのインデックス | Cloud"
slug: /index-vector-fields
sidebar_label: "ベクトルフィールドのインデックス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、コレクション内のベクトルフィールドにインデックスを作成および管理する基本操作を説明します。 | Cloud"
type: origin
token: Qc0SwFomWiEXvMkDAH9cMAhlnIh
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - vector field
  - index
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ベクトルフィールドのインデックス

このガイドでは、コレクション内のベクトルフィールドにインデックスを作成および管理する基本操作を説明します。

## 概要\{#overview}

Zilliz Cloudは、インデックスファイルに保存されたメタデータを活用して、データを専門的な構造に整理し、検索またはクエリ時に要求された情報を迅速に取得できるようにします。

Zilliz Cloudは効率的な類似性検索を可能にするために[AUTOINDEX](./autoindex-explained)を利用しています。また、ベクトル埋め込み間の距離を測定するための以下の[メトリックタイプ](./search-metrics-explained)を提供しています：**コサイン類似度**（COSINE）、**ユークリッド距離**（L2）、**内積**（IP）、**JACCARD**、および**HAMMING**。ベクトルフィールドタイプとメトリックの詳細については、[メトリックタイプ](./search-metrics-explained)および[スキーマの説明](./schema-explained)を参照してください。

頻繁にアクセスされるベクトルフィールドとスカラーフィールドの両方に対してインデックスを作成することをお勧めします。コレクションに複数のベクトルフィールドが含まれている場合、各ベクトルフィールドごとに個別にインデックスを作成できます。

## 事前準備\{#preparations}

[コレクションの作成](./manage-collections-sdks)で説明されているように、コレクション作成リクエストにおいて以下の条件のいずれかが指定されている場合、Zilliz Cloudはコレクションを作成する際に自動的にインデックスを生成しメモリにロードします。

- ベクトルフィールドの次元数とメトリックタイプ、または

- スキーマとインデックスパラメータ。

以下のコードスニペットでは、既存のコードを再利用してZilliz Cloudに接続し、インデックスパラメータを指定せずにコレクションを作成します。この場合、コレクションにはインデックスが存在せず、アンロードされたままになります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Milvusクライアントを設定
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# 2. スキーマを作成
# 2.1. スキーマを作成
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True,
)

# 2.2. スキーマにフィールドを追加
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
# dim値は1より大きい整数である必要があります
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3. コレクションを作成
client.create_collection(
    collection_name="customized_setup", 
    schema=schema, 
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_TOKEN";

// 1. Milvusサーバーに接続
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. コレクションを作成

// 2.1 スキーマを作成
CreateCollectionReq.CollectionSchema schema = client.createSchema();

// 2.2 スキーマにフィールドを追加
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(true).autoID(false).build());
// 次元値は1より大きい整数である必要があります。
schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(5).build());

// 3 スキーマとインデックスパラメータなしでコレクションを作成
CreateCollectionReq customizedSetupReq = CreateCollectionReq.builder()
.collectionName("customized_setup")
.collectionSchema(schema)
.build();

client.createCollection(customizedSetupReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 1. Milvusクライアントを設定
client = new MilvusClient({address, token});

// 2. コレクションのフィールドを定義
const fields = [
    {
        name: "id",
        data_type: DataType.Int64,
        is_primary_key: true,
        auto_id: false
    },
    {
        name: "vector",
        data_type: DataType.FloatVector,
        dim: 5 // dim値は1より大きくなければなりません。
    },
]

// 3. コレクションを作成
res = await client.createCollection({
    collection_name: "customized_setup",
    fields: fields,
})

console.log(res.error_code)  

// 出力
// 
// Success
// 
```

</TabItem>
</Tabs>

## コレクションにインデックスを作成\{#index-a-collection}

コレクションに対してインデックスを作成するには、インデックスパラメータを設定して`create_index()`を呼び出す必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 4. インデックスを設定
# 4.1. インデックスパラメータを設定
index_params = MilvusClient.prepare_index_params()

# 4.2. ベクトルフィールドにインデックスを追加。
index_params.add_index(
    field_name="vector",
    metric_type="COSINE",
    index_type="AUTOINDEX",
    index_name="vector_index"
)

# 4.4. インデックスファイルを作成
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 5. インデックスを説明
res = client.list_indexes(
    collection_name="customized_setup"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

// 4 インデックスパラメータを準備

// 4.2 "vector"ベクトルフィールド用にインデックスを追加
IndexParam indexParamForVectorField = IndexParam.builder()
    .fieldName("vector")
    .indexName("vector_index")
    .indexType(IndexParam.IndexType.AUTOINDEX)
    .metricType(IndexParam.MetricType.COSINE)
    .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForVectorField);

// 4.3 インデックスファイルを作成
CreateIndexReq createIndexReq = CreateIndexReq.builder()
    .collectionName("customized_setup")
    .indexParams(indexParams)
    .build();

client.createIndex(createIndexReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. コレクションのインデックスを設定
// 4.1. インデックスパラメータを設定
res = await client.createIndex({
    collection_name: "customized_setup",
    field_name: "vector",
    index_type: "AUTOINDEX",
    metric_type: "COSINE",   
    index_name: "vector_index"
})

console.log(res.error_code)

// 出力
// 
// Success
// 
```

</TabItem>
</Tabs>

提供されたコードスニペットでは、ベクトルフィールドにインデックスを確立して、インデックスタイプを`AUTOINDEX`、メトリックタイプを`COSINE`に設定しています。さらに、スカラーフィールドにもインデックスタイプ`AUTOINDEX`でインデックスが作成されています。インデックスタイプとメトリックタイプの詳細については、[AUTOINDEXの説明](./autoindex-explained)および[メトリックタイプ](./search-metrics-explained)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>現在、コレクション内の各フィールドに対して1つのインデックスファイルのみを作成できます。</p>

</Admonition>

## インデックスの詳細を確認\{#check-index-details}

インデックスを作成した後、その詳細を確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 5. インデックスを説明
res = client.list_indexes(
    collection_name="customized_setup"
)

print(res)

# 出力
#
# [
#     "vector_index"
# ]

res = client.describe_index(
    collection_name="customized_setup",
    index_name="vector_index"
)

print(res)

# 出力
#
# {
#     "index_type": "AUTOINDEX",
#     "metric_type": "COSINE",
#     "field_name": "vector",
#     "index_name": "vector_index"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;

// 5. インデックスを説明
// 5.1 インデックス名を一覧表示
ListIndexesReq listIndexesReq = ListIndexesReq.builder()
    .collectionName("customized_setup")
    .build();

List<String> indexNames = client.listIndexes(listIndexesReq);

System.out.println(indexNames);

// 出力:
// [
//     "vector_index"
// ]

// 5.2 インデックスを説明
DescribeIndexReq describeIndexReq = DescribeIndexReq.builder()
    .collectionName("customized_setup")
    .indexName("vector_index")
    .build();

DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);

System.out.println(JSONObject.toJSON(describeIndexResp));

// 出力:
// {
//     "metricType": "COSINE",
//     "indexType": "AUTOINDEX",
//     "fieldName": "vector",
//     "indexName": "vector_index"
// }
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. インデックスを説明
res = await client.describeIndex({
    collection_name: "customized_setup",
    index_name: "vector_index"
})

console.log(JSON.stringify(res.index_descriptions, null, 2))

// 出力
// 
// [
//   {
//     "params": [
//       {
//         "key": "index_type",
//         "value": "AUTOINDEX"
//       },
//       {
//         "key": "metric_type",
//         "value": "COSINE"
//       }
//     ],
//     "index_name": "vector_index",
//     "indexID": "449007919953063141",
//     "field_name": "vector",
//     "indexed_rows": "0",
//     "total_rows": "0",
//     "state": "Finished",
//     "index_state_fail_reason": "",
//     "pending_index_rows": "0"
//   }
// ]
// 
```

</TabItem>
</Tabs>

特定のフィールドに作成されたインデックスファイルを確認し、このインデックスファイルを使用してインデックス化された行数の統計情報を収集できます。

## インデックスの削除\{#drop-an-index}

必要なくなった場合、簡単にインデックスを削除できます。

<Admonition type="info" icon="📘" title="注意">

<p>インデックスを削除する前に、最初に解放されていることを確認してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 6. インデックスを削除
client.drop_index(
    collection_name="customized_setup",
    index_name="vector_index"
)
```

</TabItem>

<TabItem value='java'>

```java
// 6. インデックスを削除

DropIndexReq dropIndexReq = DropIndexReq.builder()
    .collectionName("customized_setup")
    .indexName("vector_index")
    .build();

client.dropIndex(dropIndexReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. インデックスを削除
res = await client.dropIndex({
    collection_name: "customized_setup",
    index_name: "vector_index"
})

console.log(res.error_code)

// 出力
// 
// Success
// 
```

</TabItem>
</Tabs>

## 高度な機能\{#advanced-features}

さらに、ご興味をお持ちになる可能性のあるいくつかの高度なベクトルインデックス機能があります。



import DocCardList from '@theme/DocCardList';

<DocCardList />