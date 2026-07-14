---
title: "Load & Release | BYOC"
slug: /load-release-collections
sidebar_label: "ロードと解放"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションをロードすることは、その中で類似検索やクエリを実行するための前提条件です。このページでは、コレクションのロードと解放の手順に焦点を当てます。 | BYOC"
type: origin
token: CemEwKryciMUepkgYWZcOw6wncb
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ロードと解放

コレクションをロードすることは、その中で類似検索やクエリを実行するための前提条件です。このページでは、コレクションのロードと解放の手順に焦点を当てます。

## 前提条件\{#prerequisites}

コレクションをロードする前に、以下を確認してください。

- 外部コレクションの場合は、インデックスを作成する前に、sub-second refresh を呼び出してコレクションとボリュームの間でデータを同期していることを確認してください。

- 少なくともすべてのベクトルフィールドにインデックスを作成しており、必要に応じて一部のスカラーフィールドにも作成していること。

## ロードの挙動\{#loading-behaviors}

同じロードリクエストが外部コレクションとマネージドコレクションの両方に適用されますが、外部コレクションのロード戦略は対象アーキテクチャによって異なります。

| 環境 | メモリの挙動 | 実行の詳細 |
| --- | --- | --- |
| サービングクラスター内のマネージドコレクション | 完全ロード | 高パフォーマンスでアクセスできるように、すべてのインデックスとデータ（ベクトルフィールドとスカラーフィールド）を直接メモリにロードします。 |
| スタンドアロンデータベース内の外部コレクション | インデックスのみロード | インデックスのみをメモリにロードします。生データは、実際の検索やクエリ時に必要に応じてディスクから取得されます。 |

## コレクションのロード\{#load-collection}

コレクションをロードすると、Zilliz Cloud は検索およびクエリに迅速に応答できるよう、インデックスファイルとすべてのフィールドの生データをメモリにロードします。コレクションのロード後に挿入されたエンティティは、自動的にインデックス化され、ロードされます。

以下のコードスニペットは、コレクションをロードする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 7. Load the collection
client.load_collection(
    collection_name="my_collection"
)

res = client.get_load_state(
    collection_name="my_collection"
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
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.collection.request.GetLoadStateReq;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 6. Load the collection
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build();

client.loadCollection(loadCollectionReq);

// 7. Get load state of the collection
GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .build();

Boolean res = client.getLoadState(loadStateReq);
System.out.println(res);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 7. Load the collection
res = await client.loadCollection({
    collection_name: "my_collection"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.getLoadState({
    collection_name: "my_collection"
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
import (
    "context"
    "fmt"
    
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
    
loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}

// sync wait collection to be loaded
err = loadTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(state)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": {
#         "loadProgress": 100,
#         "loadState": "LoadStateLoaded",
#         "message": ""
#     }
# }
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->LoadCollection(milvus::LoadCollectionRequest()
                                    .WithCollectionName("my_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetLoadStateResponse response;
status = client->GetLoadState(milvus::GetLoadStateRequest()
                                .WithCollectionName("my_collection"),
                              response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << std::to_string(response.State()) << std::endl;
```

</TabItem>
</Tabs>

## 特定のフィールドをロードする\{#load-specific-fields}

Zilliz Cloud では、検索やクエリに関与するフィールドのみをロードできるため、メモリ使用量を削減し、検索パフォーマンスを向上させることができます。

以下のコードスニペットは、**my_collection** という名前のコレクションをすでに作成しており、そのコレクションに **my_id** と **my_vector** という名前の 2 つのフィールドがあることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.load_collection(
    collection_name="my_collection",
    # highlight-next-line
    load_fields=["my_id", "my_vector"] # Load only the specified fields
    skip_load_dynamic_field=True # Skip loading the dynamic field
)

res = client.get_load_state(
    collection_name="my_collection"
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
// 6. Load the collection
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("my_collection")
        .loadFields(Arrays.asList("my_id", "my_vector"))
        .skipLoadDynamicField(true)
        .build();

client.loadCollection(loadCollectionReq);

// 7. Get load state of the collection
GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .build();

Boolean res = client.getLoadState(loadStateReq);
System.out.println(res);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.load_collection({
  collection_name: "my_collection",
  load_fields: ["my_id", "my_vector"], // Load only the specified fields
  skip_load_dynamic_field: true //Skip loading the dynamic field
});

const loadState = client.getCollectionLoadState({
    collection_name: "my_collection",
})

console.log(loadState);
```

</TabItem>

<TabItem value='go'>

```go
loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection").
        WithLoadFields("my_id", "my_vector"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// sync wait collection to be loaded
err = loadTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(state)
```

</TabItem>

<TabItem value='bash'>

```bash
# REST
# Not supported yet
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->LoadCollection(milvus::LoadCollectionRequest()
                                        .WithCollectionName("my_collection")
                                        .AddLoadField("my_id")
                                        .AddLoadField("my_vector")
                                        .WithSkipDynamicField(true));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetLoadStateResponse response;
status = client->GetLoadState(milvus::GetLoadStateRequest()
                                .WithCollectionName("my_collection"),
                              response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << std::to_string(response.State()) << std::endl;
```

</TabItem>
</Tabs>

特定のフィールドをロードすることを選択した場合、検索およびクエリでフィルターや出力フィールドとして使用できるのは、`load_fields` に含まれるフィールドのみである点に注意してください。`load_fields` には、プライマリフィールドの名前と少なくとも 1 つのベクトルフィールドの名前を必ず含める必要があります。

また、`skip_load_dynamic_field` を使用して動的フィールドをロードするかどうかを決定できます。動的フィールドは **\&#36;meta** という名前の予約済み JSON フィールドであり、スキーマで定義されていないすべてのフィールドとその値をキーと値のペアで保存します。動的フィールドをロードすると、そのフィールド内のすべてのキーがロードされ、フィルタリングおよび出力に使用可能になります。動的フィールド内のすべてのキーがメタデータのフィルタリングや出力に関与しない場合は、`skip_load_dynamic_field` を `True` に設定してください。

コレクションのロード後にさらに多くのフィールドをロードするには、インデックス変更によって発生する可能性のあるエラーを避けるため、まずコレクションを解放する必要があります。

## コレクションの解放\{#release-collection}

検索とクエリはメモリ集約型の操作です。コストを節約するため、現在使用していないコレクションは解放することをお勧めします。

以下のコードスニペットは、コレクションを解放する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# 8. Release the collection
client.release_collection(
    collection_name="my_collection"
)

res = client.get_load_state(
    collection_name="my_collection"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;

// 8. Release the collection
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
        .collectionName("my_collection")
        .build();

client.releaseCollection(releaseCollectionReq);

GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .build();
Boolean res = client.getLoadState(loadStateReq);
System.out.println(res);

// Output:
// false
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. Release the collection
res = await client.releaseCollection({
    collection_name: "my_collection"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.getLoadState({
    collection_name: "my_collection"
})

console.log(res.state)

// Output
// 
// LoadStateNotLoad
// 
```

</TabItem>

<TabItem value='go'>

```go
err = client.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(state)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": {
#         "loadProgress": 0,
#         "loadState": "LoadStateNotLoaded",
#         "message": ""
#     }
# }
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->ReleaseCollection(milvus::ReleaseCollectionRequest()
                                            .WithCollectionName("my_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetLoadStateResponse response;
status = client->GetLoadState(milvus::GetLoadStateRequest()
                                .WithCollectionName("my_collection"),
                              response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << std::to_string(response.State()) << std::endl;
```

</TabItem>
</Tabs>

