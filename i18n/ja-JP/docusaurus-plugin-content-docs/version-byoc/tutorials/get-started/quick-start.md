---
title: "クイックスタート | BYOC"
slug: /quick-start
sidebar_label: "クイックスタート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud クラスターを使用して高性能なセマンティック検索に関する操作を実行する方法を示します。 | BYOC"
type: origin
token: GQN0wDCrni4n36kyeVQcF41Lned
sidebar_position: 6
keywords:
  - zilliz
  - vector database
  - quickstart
  - cloud
  - milvus
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クイックスタート

このガイドでは、Zilliz Cloud クラスターを使用して高性能なセマンティック検索に関する操作を実行する方法を示します。

## はじめる前に\{#before-you-start}

Zilliz Cloud は、Bring-Your-Own-Cloud (BYOC) ソリューションを提供しており、組織が Zilliz Cloud のインフラストラクチャではなく、自身のクラウドアカウントでアプリケーションとデータをホストできるようになります。当社 BYOC ソリューションの詳細については、[BYOC 概要](./byoc-intro) を参照してください。

以下の図は、当社 BYOC ソリューションの使用を開始する手順を示しています。

![ChT3woJqYhkzj1bipPxcXNZrnbc](/img/ChT3woJqYhkzj1bipPxcXNZrnbc.png)

このクイックスタートを実施する前に、以下のことを確認してください：

- Zilliz Cloud にアカウントを登録している。

  手順については、[Zilliz Cloud への登録](./register-with-zilliz-cloud) を参照してください。

- Zilliz Cloud 営業担当に連絡し、あなたのアカウントを当社に提供している。

  <Admonition type="info" icon="📘" title="Notes">

  <p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

  </Admonition>

- BYOC 組織内にプロジェクトを作成し、プロジェクトのデータプレーンインフラストラクチャを展開している。

  Zilliz BYOC は、Virtual Private Cloud (VPC) 内で動作し、データプレーンコンポーネントの展開を開始する必要があります。以下のクラウドプロバイダーでホストされている VPC にデータプレーンを展開できます：

  - [AWS に BYOC を展開](./deploy-byoc-aws)

  - [AWS に BYOC-I を展開](./deploy-byoc-i-aws)

  上記にクラウドプロバイダーがない場合は、[Zilliz Cloud サポート](https://zilliz.com/contact-sales) に連絡してください。

以下の手順では、すでにクラスターを作成し、API キーまたはクラスターコンテキストを取得し、使用したい SDK をインストールしていることを前提としています。

## 接続の設定\{#set-up-connection}

クラスターコンテキストまたは API キーを取得したら、それを使用してクラスターに接続できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"
# 有効なトークンは以下のいずれかです
# - API キー
# - コロンで区切られたクラスターのユーザー名とパスワード (例: `user:pass`)

# 1. Milvus クライアントを設定
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";
// 有効なトークンは以下のいずれかです
// - API キー
// - コロンで区切られたクラスターのユーザー名とパスワード (例: `user:pass`)

// 1. Milvus サーバーに接続
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
    "github.com/milvus-io/milvus/pkg/v2/common"
)
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
APIKey := "YOUR_API_KEY"
// または、クラスター認証情報を使用して認証することもできます
// Username := "YOUR_CLUSTER_USERNAME"
// Password := "YOUR_CLUSTER_PASSWORD"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: APIKey
})
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
defer client.Close(ctx)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType, sleep } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"
// 有効なトークンは以下のいずれかです
// - API キー、または
// - コロンで区切られたクラスターのユーザー名とパスワード (例: `user:pass`)

// 1. クラスターに接続
const client = new MilvusClient({address, token})
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export CLUSTER_TOKEN="YOUR_CLUSTER_TOKEN"
# 有効なトークンは以下のいずれかです
# - API キー、または
# - コロンで区切られたクラスターのユーザー名とパスワード (例: `user:pass`)
```

</TabItem>
</Tabs>

## コレクションの作成\{#create-collection}

Zilliz Cloud では、ベクトル埋め込みをコレクションに格納する必要があります。コレクションに格納されたすべてのベクトル埋め込みは、次元数と類似性を測定するための距離メトリックを共有します。

コレクションを作成するには、コレクションの各フィールドの属性を定義する必要があります。これには、名前、データ型、および特定のフィールドの追加属性が含まれます。また、検索性能を高速化するために必要なフィールドにインデックスを作成する必要があります。ベクトルフィールドではインデックスが必須であることに注意してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 3. カスタマイズ設定モードでコレクションを作成

# 3.1. スキーマを作成
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True,
)

# 3.2. フィールドをスキーマに追加
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3.3. インデックスパラメータを準備
index_params = client.prepare_index_params()

# 3.4. インデックスを追加
index_params.add_index(
    field_name="my_id"
)

index_params.add_index(
    field_name="my_vector",
    index_type="AUTOINDEX",
    metric_type="IP"
)

# 3.5. コレクションを作成
client.create_collection(
    collection_name="custom_setup",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 3.1 スキーマを作成
CreateCollectionReq.CollectionSchema schema = client.createSchema();

// 3.2 フィールドをスキーマに追加

AddFieldReq myId = AddFieldReq.builder()
    .fieldName("my_id")
    .dataType(DataType.Int64)
    .isPrimaryKey(true)
    .autoID(false)
    .build();

schema.addField(myId);

AddFieldReq myVector = AddFieldReq.builder()
    .fieldName("my_vector")
    .dataType(DataType.FloatVector)
    .dimension(5)
    .build();

schema.addField(myVector);

// 3.3 インデックスパラメータを準備
IndexParam indexParamForIdField = IndexParam.builder()
    .fieldName("my_id")
    .indexType(IndexParam.IndexType.STL_SORT)
    .build();

IndexParam indexParamForVectorField = IndexParam.builder()
    .fieldName("my_vector")
    .indexType(IndexParam.IndexType.AUTOINDEX)
    .metricType(IndexParam.MetricType.IP)
    .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForIdField);
indexParams.add(indexParamForVectorField);

// 3.4 スキーマとインデックスパラメータでコレクションを作成
CreateCollectionReq customizedSetupReq = CreateCollectionReq.builder()
    .collectionName("custom_setup")
    .collectionSchema(schema)
    .indexParams(indexParams)
    .build();

client.createCollection(customizedSetupReq);
```

</TabItem>

<TabItem value='go'>

```go
// フィールドを追加
schema := entity.NewSchema().WithDynamicFieldEnabled(true).
        WithField(entity.NewField().WithName("my_id").WithIsAutoID(false).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
        WithField(entity.NewField().WithName("my_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(5))

// インデックスオプションを設定
indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption(collectionName, "my_vector", index.NewAutoIndex(entity.COSINE)),
    milvusclient.NewCreateIndexOption(collectionName, "my_id", index.NewAutoIndex(entity.COSINE)),
}

// コレクションを作成
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("custom_setup", schema).
    WithIndexOptions(indexOptions...))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
fmt.Println("collection created")
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. カスタマイズ設定モードでコレクションを作成
// 3.1 フィールドを定義
const fields = [
    {
        name: "my_id",
        data_type: DataType.Int64,
        is_primary_key: true,
        auto_id: false
    },
    {
        name: "my_vector",
        data_type: DataType.FloatVector,
        dim: 5
    },
]

// 3.2 インデックスパラメータを準備
const index_params = [{
    field_name: "my_vector",
    index_type: "AUTOINDEX",
    metric_type: "IP"
}]

// 3.3 フィールドとインデックスパラメータでコレクションを作成
await client.createCollection({
    collection_name: "custom_setup",
    fields: fields,
    index_params: index_params,
})
```

</TabItem>

<TabItem value='bash'>

```bash
COLLECTION_NAME="customized_setup"

curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --d '{
        "collectionName": "custom_setup",
        "schema": {
            "autoId": false,
            "enabledDynamicField": false,
            "fields": [
                {
                    "fieldName": "my_id",
                    "dataType": "Int64",
                    "isPrimary": true
                },
                {
                    "fieldName": "my_vector",
                    "dataType": "FloatVector",
                    "elementTypeParams": {
                        "dim": "5"
                    }
                }
            ]
        }
    }'

# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

上記のセットアップでは、コレクション作成時にスキーマとインデックスパラメータを含むコレクションのさまざまな側面を定義しています。

- **スキーマ**

  スキーマはコレクションの構造を定義します。上記のように事前定義されたフィールドを追加し、その属性を設定する他に、以下の設定を有効または無効にすることができます。

  - **Auto ID**

    プライマリフィールドを自動的に増分する機能を有効にするかどうか。

  - **Dynamic Field**

    予約済みの JSON フィールド **$meta** を使用して、スキーマ定義以外のフィールドとその値を保存するかどうか。

   スキーマの詳細な説明については、[スキーマの説明](./schema-explained) を参照してください。

- **インデックスパラメータ**

  インデックスパラメータは、Zilliz Cloud がコレクション内でデータをどのように整理するかを決定します。**メトリックタイプ**と**インデックスタイプ**を設定することで、フィールドに特定のインデックスを割り当てることができます。

  - ベクトルフィールドの場合、インデックスタイプとして**AUTOINDEX**を使用し、`metric_type` として**COSINE**、**L2**、または**IP**を使用できます。

  - スカラー（数値）フィールドの場合、プライマリフィールドを含め、Zilliz Cloud は整数に**TRIE**、文字列に**STL_SORT**を使用します。

  インデックスタイプの追加の詳細については、[AUTOINDEX の説明](./autoindex-explained) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>先に示したコードスニペットで作成されたコレクションは自動的にロードされます。自動的にロードされるコレクションを作成したくない場合は、インデックスパラメータの設定をスキップしてください。詳細については、<a href="./manage-collections-sdks">コレクションの作成</a>を参照してください。</p></li>
<li><p>RESTful API を使用して作成されたコレクションは常に自動的にロードされます。</p></li>
</ul>

</Admonition>

## データの挿入\{#insert-data}

コレクションの準備ができたら、以下のようにデータを追加できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. コレクションにデータを挿入
# 4.1. データを準備
data=[
    {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682"},
    {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025"},
    {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781"},
    {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298"},
    {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794"},
    {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222"},
    {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392"},
    {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510"},
    {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381"},
    {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976"}
]

# 4.2. データを挿入
res = client.insert(
    collection_name="custom_setup",
    data=data
)

print(res)

# Output
#
# {
#     "insert_count": 10,
#     "ids": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
# }
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Arrays;
import com.alibaba.fastjson.JSONObject;

import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

// 4. コレクションにデータを挿入

// 4.1. データを準備

List<JSONObject> insertData = Arrays.asList(
    new JSONObject(Map.of("id", 0L, "vector", Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f), "color", "pink_8682")),
    new JSONObject(Map.of("id", 1L, "vector", Arrays.asList(0.19886812562848388f, 0.06023560599112088f, 0.6976963061752597f, 0.2614474506242501f, 0.838729485096104f), "color", "red_7025")),
    new JSONObject(Map.of("id", 2L, "vector", Arrays.asList(0.43742130801983836f, -0.5597502546264526f, 0.6457887650909682f, 0.7894058910881185f, 0.20785793220625592f), "color", "orange_6781")),
    new JSONObject(Map.of("id", 3L, "vector", Arrays.asList(0.3172005263489739f, 0.9719044792798428f, -0.36981146090600725f, -0.4860894583077995f, 0.95791889146345f), "color", "pink_9298")),
    new JSONObject(Map.of("id", 4L, "vector", Arrays.asList(0.4452349528804562f, -0.8757026943054742f, 0.8220779437047674f, 0.46406290649483184f, 0.30337481143159106f), "color", "red_4794")),
    new JSONObject(Map.of("id", 5L, "vector", Arrays.asList(0.985825131989184f, -0.8144651566660419f, 0.6299267002202009f, 0.1206906911183383f, -0.1446277761879955f), "color", "yellow_4222")),
    new JSONObject(Map.of("id", 6L, "vector", Arrays.asList(0.8371977790571115f, -0.015764369584852833f, -0.31062937026679327f, -0.562666951622192f, -0.8984947637863987f), "color", "red_9392")),
    new JSONObject(Map.of("id", 7L, "vector", Arrays.asList(-0.33445148015177995f, -0.2567135004164067f, 0.8987539745369246f, 0.9402995886420709f, 0.5378064918413052f), "color", "grey_8510")),
    new JSONObject(Map.of("id", 8L, "vector", Arrays.asList(0.39524717779832685f, 0.4000257286739164f, -0.5890507376891594f, -0.8650502298996872f, -0.6140360785406336f), "color", "white_9381")),
    new JSONObject(Map.of("id", 9L, "vector", Arrays.asList(0.5718280481994695f, 0.24070317428066512f, -0.3737913482606834f, -0.06726932177492717f, -0.6980531615588608f), "color", "purple_4976"))
);

// 4.2. データを挿入

InsertReq insertReq = InsertReq.builder()
    .collectionName("custom_setup")
    .data(insertData)
    .build();

InsertResp res = client.insert(insertReq);

System.out.println(JSONObject.toJSON(res));

// Output:
// {"insertCnt": 10}
```

</TabItem>

<TabItem value='go'>

```go
dynamicColumn := column.NewColumnString("color", []string{
    "pink_8682", "red_7025", "orange_6781", "pink_9298", "red_4794", "yellow_4222", "red_9392", "grey_8510", "white_9381", "purple_4976",
})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("custom_setup").
    WithInt64Column("id", []int64{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592},
        {0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104},
        {0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592},
        {0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345},
        {0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106},
        {0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955},
        {0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987},
        {-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052},
        {0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336},
        {0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608},
    }).
    WithColumns(dynamicColumn),
)
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. コレクションにデータを挿入
var data = [
    {id: 0, vector: [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], color: "pink_8682"},
    {id: 1, vector: [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], color: "red_7025"},
    {id: 2, vector: [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], color: "orange_6781"},
    {id: 3, vector: [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], color: "pink_9298"},
    {id: 4, vector: [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], color: "red_4794"},
    {id: 5, vector: [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], color: "yellow_4222"},
    {id: 6, vector: [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], color: "red_9392"},
    {id: 7, vector: [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], color: "grey_8510"},
    {id: 8, vector: [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], color: "white_9381"},
    {id: 9, vector: [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], color: "purple_4976"}
]

res = await client.insert({
    collection_name: "custom_setup",
    data: data
})

console.log(res.insert_cnt)

// Output
//
// 10
```

</TabItem>

<TabItem value='bash'>

```bash
curl -s --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --d '{
        "collectionName": "custom_setup",
        "data": [
          {"vector": [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231], "color": "grey_4070"},
          {"vector": [-0.3909198248479646, -0.8726174312444843, 0.4981267572657442, -0.9392508698102204, -0.5470572556090092], "color": "black_3737"},
          {"vector": [-0.9098169905660276, -0.9307025336058208, -0.5308685343695865, -0.3852032359431963, -0.8050806646961366], "color": "yellow_7436"},
          {"vector": [-0.05064204615748724, 0.6058571389881378, 0.26812302147792155, 0.4862225881265785, -0.27042586524166445], "color": "grey_9883"},
          {"vector": [-0.8610792440629793, 0.5278969698864726, 0.09065723848982965, -0.8685651142668274, 0.5912780986996793], "color": "green_8111"},
          {"vector": [0.4814454540587043, -0.23573937400668377, -0.14938260011601723, 0.08275006479687019, 0.6726732239961157], "color": "orange_2725"},
          {"vector": [0.9763298348098068, 0.5777919290849443, 0.9579310732153326, 0.8951091168874232, 0.46917481926682525], "color": "black_6073"},
          {"vector": [0.326134221411539, 0.6870356809753577, 0.7977120714123429, 0.4305198158670587, -0.14894148480426983], "color": "purple_1285"},
          {"vector": [0.8709056428858379, 0.021264532993509055, -0.8042932327188321, -0.007299919034885249, 0.14411861700299666], "color": "green_3127"},
          {"vector": [-0.8182282159972083, -0.7882247281939101, -0.1870871133115657, 0.07914806834708976, 0.9825978431531959], "color": "blue_6372"}
        ]
    }'

# {
#   "code": 200,
#   "data": {
#       "insertCount": 10,
#       "insertIds": [
#           "448985546440864743",
#           "448985546440864744",
#           "448985546440864745",
#           "448985546440864746",
#           "448985546440864747",
#           "448985546440864748",
#           "448985546440864749",
#           "448985546440864750",
#           "448985546440864751",
#           "448985546440864752"
#       ]
#   }
# }

```

</TabItem>
</Tabs>

上記のコードのように、

- 挿入するデータは、各辞書がエンティティと呼ばれるデータレコードを表す辞書のリストとして構成されます。

- 各辞書には、**color** という非スキーマ定義フィールドが含まれています。

- 各辞書には、事前定義されたフィールドと動的フィールドに対応するキーが含まれています。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>RESTful API を使用して作成されたコレクションは AutoID が有効になっているため、挿入するデータにプライマリフィールドを省略する必要があることに注意してください。</p></li>
<li><p>挿入操作は非同期であるため、データ挿入後にすぐに検索を行うと空の結果セットになる可能性があります。これを避けるために、数秒待つことをお勧めします。</p></li>
</ul>

</Admonition>

## 類似性検索\{#similarity-search}

1つまたは複数のベクトル埋め込みに基づいて類似性検索を実行できます。検索リクエストにフィルター条件を含めることで、類似性検索結果を強化することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 8. スキーマ定義フィールドを使用したフィルター式で検索
# 1 クエリベクトルを準備
query_vectors = [
    [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648]
]

# 2. 検索を開始
res = client.search(
    collection_name="custom_setup",
    data=query_vectors,
    filter="4 < id < 8",
    limit=3
)

print(res)

# Output
#
# [
#     [
#         {
#             "id": 5,
#             "distance": 0.08821295201778412,
#             "entity": {}
#         },
#         {
#             "id": 6,
#             "distance": 0.07432225346565247,
#             "entity": {}
#         },
#         {
#             "id": 7,
#             "distance": 0.07279646396636963,
#             "ent... [truncated]
```

</TabItem>

<TabItem value='java'>

```java
// 8. スキーマ定義フィールドを使用したフィルター式で検索
List<List<Float>> filteredVectorSearchData = new ArrayList<>();
filteredVectorSearchData.add(Arrays.asList(0.041732933f, 0.013779674f, -0.027564144f, -0.013061441f, 0.009748648f));

searchReq = SearchReq.builder()
    .collectionName("custom_setup")
    .data(filteredVectorSearchData)
    .filter("4 < id < 8")
    .outputFields(Arrays.asList("id"))
    .topK(3)
    .build();

SearchResp filteredVectorSearchRes = client.search(searchReq);

System.out.println(JSONObject.toJSON(filteredVectorSearchRes));

// Output:
// {"searchResults": [[
//     {
//         "distance": 0.08821295,
//         "id": 5,
//         "entity": {"id": 5}
//     },
//     {
//         "distance": 0.074322253,
//         "id": 6,
//         "entity": {"id": 6}
//     },
//     {
//         "distance": 0.072796463,
//         "id": 7,
//         "entity": {"id": 7}
//     }
// ]]}
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "custom_setup", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("vector").
    WithFilter("4 < id < 8").
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}

// IDs: 5
// Scores: 0.08821295201778412
// IDs: 6
// Scores: 0.07432225346565247
// IDs: 7
// Scores: 0.07279646396636963
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. スキーマ定義フィールドを使用したフィルター式で検索
res = await client.search({
    collection_name: "custom_setup",
    vectors: query_vector,
    limit: 3,
    filter: "4 < id < 8",
    output_fields: ["id"]
})

console.log(res.results)

// Output
//
// [
//   { score: 0.08821295201778412, id: '5' },
//   { score: 0.07432225346565247, id: '6' },
//   { score: 0.07279646396636963, id: '7' },
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
# 8. 単一ベクトル検索を実行
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    -d '{
       "collectionName": "custom_setup",
       "data": [
           [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231]
       ],
       "annsField": "vector",
       "filter": "4 < id < 8",
       "limit": 3
    }'

# {
#   "code": 200,
#   "data": [
#       {
#           "distance": 0.08821295201778412,
#           "id": 448985546440864743
#       },
#       {
#           "distance": 0.07432225346565247,
#           "id": 448985546440865160
#       },
#       {
#           "distance": 0.07279646396636963,
#           "id": 448985546440864927
#       }
#   ]
# }
```

</TabItem>
</Tabs>

出力は3つの辞書からなるサブリストで、それぞれはID、距離、および指定された出力フィールドを持つ検索されたエンティティを表します。

フィルター式で動的フィールドを使用することもできます。以下のコードスニペットでは、`color` は非スキーマ定義フィールドです。`#meta` フィールドのキーとして含めることができます（例: `#meta["color"]`）またはスキーマ定義フィールドのように直接使用できます（例: `color`）。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9. カスタムフィールドを使用したフィルター式で検索
# 9.1.クエリベクトルを準備
query_vectors = [
    [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648]
]

# 9.2.検索を開始
res = client.search(
    collection_name="custom_setup",
    data=query_vectors,
    filter='$meta["color"] like "red%"',
    limit=3,
    output_fields=["color"]
)

print(res)

# Output
#
# [
#     [
#         {
#             "id": 5,
#             "distance": 0.08821295201778412,
#             "entity": {
#                 "color": "yellow_4222"
#             }
#         },
#         {
#             "id": 6,
#             "distance": 0.07432225346565247,
#             "entity": {
#                 "color": "red_9392"
#             }
#         },
#         {
#             "id": 7,
#             "distance": 0.07279646396636963,
#             "entity": {
#                 "color": "grey_8510"
#             }
#         }
#     ]
# ]

```

</TabItem>

<TabItem value='java'>

```java
// 9. カスタムフィールドを使用したフィルター式で検索
List<List<Float>> customFilteredVectorSearchData = new ArrayList<>();
customFilteredVectorSearchData.add(Arrays.asList(0.041732933f, 0.013779674f, -0.027564144f, -0.013061441f, 0.009748648f));

searchReq = SearchReq.builder()
    .collectionName("custom_setup")
    .data(customFilteredVectorSearchData)
    .filter("$meta[\"color\"] like \"red%\"")
    .topK(3)
    .outputFields(Arrays.asList("color"))
    .build();

SearchResp customFilteredVectorSearchRes = client.search(searchReq);

System.out.println(JSONObject.toJSON(customFilteredVectorSearchRes));

// Output:
// {"searchResults": [[
//     {
//         "distance": 0.08821295,
//         "id": 5,
//         "entity": {"color": "yellow_4222"}
//     },
//     {
//         "distance": 0.074322253,
//         "id": 6,
//         "entity": {"color": "red_9392"}
//     },
//     {
//         "distance": 0.072796463,
//         "id": 7,
//         "entity": {"color": "grey_8510"}
//     }
// ]]}
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("vector").
    WithFilter("$meta[\"color\"] like \"red%\"").
    WithOutputFields("color"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("color: ", resultSet.GetColumn("color").FieldData().GetScalars())
}

// IDs: 5
// Scores: 0.08821295201778412
// color: yellow_4222
// IDs: 6
// Scores: 0.07432225346565247
// color: red_9392
// IDs: 7
// Scores: 0.07279646396636963
// color: grey_8510
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9. スキーマ定義外のフィールドを使用したフィルター式で検索
res = await client.search({
    collection_name: "custom_setup",
    vectors: query_vector,
    limit: 3,
    filter: '$meta["color"] like "red%"',
    output_fields: ["color"]
})

console.log(res.results)

// Output
//
// [
//   { score: 0.08821295201778412, id: '5', color: 'yellow_4222' },
//   { score: 0.07432225346565247, id: '6', color: 'red_9392' },
//   { score: 0.07279646396636963, id: '7', color: 'grey_8510' },
// ]
//
```

</TabItem>

<TabItem value='bash'>

```bash
# 9. フィルターと出力フィールドを使用した単一ベクトル検索を実行
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    -d '{
       "collectionName": "custom_setup",
       "data": [
           [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231]
       ],
       "annsField": "vector",
       "filter": "color like \"red%\"",
       "outputFields": ["color"],
       "limit": 3
    }'

# {
#   "code": 200,
#   "data": [
#       {
#           "color": "yellow_4222",
#           "distance": 0.08821295201778412
#       },
#       {
#           "color": "red_9392",
#           "distance": 0.07432225346565247
#       },
#       {
#           "color": "grey_8510",
#           "distance": 0.07279646396636963
#       }
#   ]
# }

```

</TabItem>
</Tabs>

## エンティティの削除\{#delete-entities}

Zilliz Cloud では、ID による削除とフィルターによる削除が可能です。

- **ID によるエンティティの削除。**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # 13. ID でエンティティを削除
    res = client.delete(
        collection_name="custom_setup",
        ids=[0,1,2,3,4]
    )

    print(res)

    # Output
    #
    # {
    #     "delete_count": 5
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.v2.service.vector.request.DeleteReq;
    import io.milvus.v2.service.vector.response.DeleteResp;

    // 13. ID によるエンティティ削除
    DeleteReq deleteReq = DeleteReq.builder()
        .collectionName("custom_setup")
        .ids(Arrays.asList(0L, 1L, 2L, 3L, 4L))
        .build();

    DeleteResp deleteRes = client.delete(deleteReq);

    System.out.println(JSONObject.toJSON(deleteRes));

    // Output:
    // {"deleteCnt": 5}
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    _, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
        WithInt64IDs("id", []int64{0, 1, 2, 3, 4}))
    if err != nil {
        fmt.Println(err.Error())
        // エラー処理
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 13. ID でエンティティを削除
    res = await client.deleteEntities({
        collection_name: "custom_setup",
        expr: "id in [5, 6, 7, 8, 9]",
        output_fields: ["vector"]
    })

    console.log(res.delete_cnt)

    // Output
    //
    // 5
    //
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 12. ID によるエンティティ削除
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "Accept: application/json" \
        --header "Content-Type: application/json" \
        -d '{
            "collectionName": "medium_articles",
            "filter": "id == 4321034832910"
        }'

    # {"code":200,"data":{}}
    ```

    </TabItem>
    </Tabs>

- **フィルターによるエンティティの削除**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # 14. フィルター式を使用してエンティティを削除
    res = client.delete(
        collection_name="custom_setup",
        filter="id in [5,6,7,8,9]"
    )

    print(res)

    # Output
    #
    # {
    #     "delete_count": 5
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 14. フィルターによるエンティティ削除
    DeleteReq filterDeleteReq = DeleteReq.builder()
        .collectionName("custom_setup")
        .filter("id in [5, 6, 7, 8, 9]")
        .build();

    DeleteResp filterDeleteRes = client.delete(filterDeleteReq);

    System.out.println(JSONObject.toJSON(filterDeleteRes));

    // Output:
    // {"deleteCnt": 5}

    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    _, err = client.Delete(ctx, milvusclient.NewDeleteOption("custom_setup").
        WithExpr("id in [5, 6, 7, 8, 9]"))
    if err != nil {
        fmt.Println(err.Error())
        // エラー処理
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 14. フィルターによるエンティティ削除
    res = await client.delete({
        collection_name: "custom_setup",
        ids: [0, 1, 2, 3, 4]
    })

    console.log(res.delete_cnt)

    // Output
    //
    // 5
    //
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 12. ID によるエンティティ削除
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "Accept: application/json" \
        --header "Content-Type: application/json" \
        -d '{
            "collectionName": "medium_articles",
            "filter": "id in [5, 6, 7, 8, 9]"
        }'

    # {"code":200,"data":{}}
    ```

    </TabItem>
    </Tabs>

    <Admonition type="info" icon="📘" title="Notes">

    <p>現在、RESTful API の削除エンドポイントはフィルターをサポートしていません。</p>

    </Admonition>

## コレクションの削除\{#drop-the-collection}

このガイドを完了したら、以下のようにコレクションを削除できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 15. コレクションを削除
client.drop_collection(
    collection_name="custom_setup"
)

client.drop_collection(
    collection_name="customized_setup"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.DropCollectionReq;

// 15. コレクションを削除
DropCollectionReq dropQuickSetupParam = DropCollectionReq.builder()
    .collectionName("custom_setup")
    .build();

client.dropCollection(dropQuickSetupParam);

DropCollectionReq dropCustomizedSetupParam = DropCollectionReq.builder()
    .collectionName("custom_setup")
    .build();

client.dropCollection(dropCustomizedSetupParam);
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropCollection(ctx, milvusclient.NewDropCollectionOption("custom_setup"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 15. コレクションを削除
res = await client.dropCollection({
    collection_name: "custom_setup"
})

console.log(res.error_code)

// Output
//
// Success
//

res = await client.dropCollection({
    collection_name: "customized_setup"
})

console.log(res.error_code)

// Output
//
// Success
//
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --data-raw '{
        "collectionName": "custom_setup"
    }'

# {"code":200,"data":{}}

curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --data-raw '{
        "collectionName": "customized_setup"
    }'

# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

## まとめ\{#recaps}

- コレクションを作成する前に、スキーマを作成し、コレクションのフィールドを定義する必要があります。

- データ挿入プロセスには完了までに少し時間がかかることがあります。データ挿入後、類似性検索を実行する前に数秒待つことを推奨します。

- フィルター式は検索リクエストおよびクエリリクエストの両方で使用できますが、クエリリクエストでは必須です。

## 次のステップ\{#next-steps}

このクイックスタートガイドを確認した後、以下のトピックを調べることができます：

- [コレクションの操作](./collection)

- [データの挿入と削除](./insert-update-delete)

- [データのインデックス作成](./manage-indexes)

- [検索と再ランク付け](./search-query-get)

- [データのインポートとエクスポート](./data-import-export)
