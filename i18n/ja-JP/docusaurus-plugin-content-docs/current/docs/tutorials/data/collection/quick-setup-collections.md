---
title: "コレクションを即座に作成 | Cloud"
slug: /quick-setup-collections
sidebar_label: "コレクションを即座に作成"
beta: FALSE
notebook: FALSE
description: "名前とベクトルフィールドの次元を設定することで、コレクションを即座に作成できます。Zilliz Cloudはベクトルフィールドを自動的にインデックス化し、作成時にコレクションを読み込みます。このページでは、デフォルト設定でコレクションを即座に作成する方法を説明します。 | Cloud"
type: origin
token: AOMMwYmMOi7WSyktWWLcICV7neg
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - create collection
  - quick-setup
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションを即座に作成

名前とベクトルフィールドの次元を設定することで、コレクションを即座に作成できます。Zilliz Cloudはベクトルフィールドを自動的にインデックス化し、作成時にコレクションを読み込みます。このページでは、デフォルト設定でコレクションを即座に作成する方法を説明します。

## 概要について{#overview}{#overview}

コレクションは、固定列とバリアント行を持つ2次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。このような構造データ管理を実装するにはスキーマが必要です。挿入するすべてのエンティティは、スキーマで定義された制約を満たす必要があります。

AIGCアプリケーションは通常、ユーザーと大規模言語モデル(LLM)の相互作用中に生成されたデータを管理するための知識ベースとしてベクトルデータベースを使用します。このような知識ベースはほぼ同様です。このようなシナリオでZilliz Cloudクラスターの使用を加速するために、コレクション名とベクトルフィールド次元の2つのパラメータだけでコレクションを作成するためのインスタントメソッドが利用可能です。

デフォルト設定でコレクションを即座に作成する場合、次の設定が適用されます。

- プライマリフィールドとベクターフィールドがスキーマ(**id**と**vector**)に追加されます。

- プライマリフィールドは整数を受け入れ、**AutoId**を無効にします。

- ベクトル場は浮動ベクトルの埋め込みを受け入れます。

- **AUTOINDEX**はベクトル場のインデックスを作成するために使用されます。

- **COSINE**はベクトル埋め込みの類似性を測定するために使用されます。

- スキーマ定義されていない項目とその値をキーと値のペアで保存するには、**$meta**という名前の予約動的項目が有効になります。

- コレクションは作成時に自動的に読み込まれます。

上記の用語の詳細については、[コレクションの説明](./manage-collections)を参照してください。

デフォルト設定で即座にコレクションを作成することは、すべてのシナリオに適合するわけではないことに注意する価値があります。[一般的なコレクション作成手順](./manage-collections-sdks)に慣れておくことをお勧めします。これにより、Zilliz Cloudの機能をより良く理解することができます。

## クイックセットアップ{#quick-setup}{#quick-setup}

このようにして、コレクション名とベクトル場の次元だけでコレクションを即座に作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# 2. Create a collection in quick setup mode
client.create_collection(
    collection_name="quick_setup",
    dimension=5
)

res = client.get_load_state(
    collection_name="quick_setup"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetLoadStateReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a collection in quick setup mode
CreateCollectionReq quickSetupReq = CreateCollectionReq.builder()
        .collectionName("quick_setup")
        .dimension(5)
        .build();

client.createCollection(quickSetupReq);

GetLoadStateReq quickSetupLoadStateReq = GetLoadStateReq.builder()
        .collectionName("quick_setup")
        .build();

Boolean res = client.getLoadState(quickSetupLoadStateReq);
System.out.println(res);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 1. Set up a Milvus Client
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 2. Create a collection in quick setup mode
let res = await client.createCollection({
    collection_name: "quick_setup",
    dimension: 5,
});  

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.getLoadState({
    collection_name: "quick_setup"
})

console.log(res.state)

// Output
// 
// LoadStateLoaded
// 
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

collectionName := `quick_setup`

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    // handle err
}

err = cli.CreateCollection(ctx, milvusclient.SimpleCreateCollectionOptions(collectionName, 5))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
    "dimension": 5
}'

# {
#     "code": 0,
#     "data": {}
# }
```

</TabItem>
</Tabs>

## カスタムフィールドを使用したクイックセットアップ{#quick-setup-with-custom-fields}{#quick-setup-with-custom-fields}

デフォルトのメトリックタイプ、フィールド名、およびデータ型が必要に応じていない場合は、次のようにこれらの設定を調整できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# 2. Create a collection in quick setup mode
client.create_collection(
    collection_name="custom_quick_setup",
    dimension=5,
    primary_field_name="my_id",
    id_type="string",
    vector_field_name="my_vector",
    metric_type="L2",
    auto_id=True,
    max_length=512
)

res = client.get_load_state(
    collection_name="custom_quick_setup"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetLoadStateReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a collection in quick setup mode
CreateCollectionReq customQuickSetupReq = CreateCollectionReq.builder()
        .collectionName("custom_quick_setup")
        .dimension(5)
        .primaryFieldName("my_id")
        .idType(DataType.VarChar)
        .maxLength(512)
        .vectorFieldName("my_vector")
        .metricType("L2")
        .autoID(true)
        .build();

client.createCollection(customQuickSetupReq);

GetLoadStateReq customQuickSetupLoadStateReq = GetLoadStateReq.builder()
        .collectionName("custom_quick_setup")
        .build();

Boolean res = client.getLoadState(customQuickSetupLoadStateReq);
System.out.println(res);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 1. Set up a Milvus Client
const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 2. Create a collection in quick setup mode
let res = await client.createCollection({
    collection_name: "custom_quick_setup",
    dimension: 5,
    primary_field_name: "my_id",
    id_type: "Varchar",
    max_length: 512,
    vector_field_name: "my_vector",
    metric_type: "L2",
    auto_id: true
});  

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.getLoadState({
    collection_name: "custom_quick_setup"
})

console.log(res.state)

// Output
// 
// LoadStateLoaded
// 
```

</TabItem>

<TabItem value='go'>

```go
// Go 缺失
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "custom_quick_setup",
    "dimension": 5,
    "primaryFieldName": "my_id",
    "idType": "VarChar",
    "vectorFieldName": "my_vector",
    "metricType": "L2",
    "autoId": true,
    "params": {
        "max_length": "512"
    }
}'
```

</TabItem>
</Tabs>

上記の2つの方法で作成したコレクションでもニーズを満たせない場合は、Create Collectionの手順に従ってください。