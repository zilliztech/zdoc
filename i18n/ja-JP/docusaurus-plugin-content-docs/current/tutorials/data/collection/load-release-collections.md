---
title: "ロード & リリース | クラウド"
slug: /load-release-collections
sidebar_label: "ロード & リリース"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションのロードは、コレクションでの類似検索およびクエリを実行するための前提条件です。このページでは、コレクションのロードおよびリリース手順について説明します。 | Cloud"
type: origin
token: CemEwKryciMUepkgYWZcOw6wncb
sidebar_position: 7
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - ロード
  - リリース
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - オープンソースベクトルDB

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ロード & リリース

コレクションのロードは、コレクションでの類似検索およびクエリを実行するための前提条件です。このページでは、コレクションのロードおよびリリース手順について説明します。

## コレクションのロード\{#load-collection}

コレクションをロードすると、Zilliz Cloudはインデックスファイルとすべてのフィールドの生データをメモリにロードし、検索およびクエリに迅速に対応できるようにします。コレクションのロード後に挿入されたエンティティは自動的にインデックス化およびロードされます。

以下のコードスニペットは、コレクションをロードする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 7. コレクションをロード
client.load_collection(
    collection_name="my_collection"
)

res = client.get_load_state(
    collection_name="my_collection"
)

print(res)

# 出力
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

// 1. Milvusサーバーに接続
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 6. コレクションをロード
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build();

client.loadCollection(loadCollectionReq);

// 7. コレクションのロード状態を取得
GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .build();

Boolean res = client.getLoadState(loadStateReq);
System.out.println(res);

// 出力:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 7. コレクションをロード
res = await client.loadCollection({
    collection_name: "my_collection"
})

console.log(res.error_code)

// 出力
//
// Success
//

res = await client.getLoadState({
    collection_name: "my_collection"
})

console.log(res.state)

// 出力
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
    // エラー処理
}
defer client.Close(ctx)

loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

// コレクションがロードされるまで同期待機
err = loadTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
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
</Tabs>

## 特定のフィールドをロード\{#load-specific-fields}

Zilliz Cloudでは、検索およびクエリに関与するフィールドのみをロードすることで、メモリ使用量を削減し、検索パフォーマンスを向上させることができます。

以下のコードスニペットでは、**my_collection**という名前のコレクションが作成済みで、コレクションには**my_id**および**my_vector**という名前の2つのフィールドが存在すると仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.load_collection(
    collection_name="my_collection",
    # highlight-next-line
    load_fields=["my_id", "my_vector"] # 指定したフィールドのみをロード
    skip_load_dynamic_field=True # ダイナミックフィールドのロードをスキップ
)

res = client.get_load_state(
    collection_name="my_collection"
)

print(res)

# 出力
#
# {
#     "state": "<LoadState: Loaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
// 6. コレクションをロード
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("my_collection")
        .loadFields(Arrays.asList("my_id", "my_vector"))
        .build();

client.loadCollection(loadCollectionReq);

// 7. コレクションのロード状態を取得
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
  load_fields: ["my_id", "my_vector"], // 指定したフィールドのみをロード
  skip_load_dynamic_field: true // ダイナミックフィールドのロードをスキップ
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
    // エラー処理
}

// コレクションがロードされるまで同期待機
err = loadTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
fmt.Println(state)
```

</TabItem>

<TabItem value='bash'>

```bash
# REST
# 未対応
```

</TabItem>
</Tabs>

特定のフィールドをロードすることを選択した場合、`load_fields`に含まれるフィールドのみが検索およびクエリでのフィルターおよび出力フィールドとして使用できることに注意してください。常に、主キーフィールドの名前と少なくとも1つのベクトルフィールドを`load_fields`に含める必要があります。

また、`skip_load_dynamic_field`を使用して、ダイナミックフィールドをロードするかどうかを決定することもできます。ダイナミックフィールドは**\&#36;meta**という名前の予約済みJSONフィールドであり、スキーマ定義されていないすべてのフィールドとその値をキーと値のペアで保存します。ダイナミックフィールドをロードする際、フィールド内のすべてのキーがロードされ、フィルターおよび出力で使用可能になります。ダイナミックフィールド内のすべてのキーがメタデータのフィルタリングおよび出力に関与しない場合は、`skip_load_dynamic_field`を`True`に設定してください。

コレクションのロード後にさらに多くのフィールドをロードするには、インデックスの変更によるエラーを回避するために、最初にコレクションをリリースする必要があります。

## コレクションのリリース\{#release-collection}

検索およびクエリはメモリを大量に使用する操作です。コストを節約するために、現在使用していないコレクションをリリースすることをお勧めします。

以下のコードスニペットは、コレクションをリリースする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 8. コレクションをリリース
client.release_collection(
    collection_name="my_collection"
)

res = client.get_load_state(
    collection_name="my_collection"
)

print(res)

# 出力
#
# {
#     "state": "<LoadState: NotLoad>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;

// 8. コレクションをリリース
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
        .collectionName("my_collection")
        .build();

client.releaseCollection(releaseCollectionReq);

GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .build();
Boolean res = client.getLoadState(loadStateReq);
System.out.println(res);

// 出力:
// false
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. コレクションをリリース
res = await client.releaseCollection({
    collection_name: "my_collection"
})

console.log(res.error_code)

// 出力
//
// Success
//

res = await client.getLoadState({
    collection_name: "my_collection"
})

console.log(res.state)

// 出力
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
    // エラー処理
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
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
</Tabs>