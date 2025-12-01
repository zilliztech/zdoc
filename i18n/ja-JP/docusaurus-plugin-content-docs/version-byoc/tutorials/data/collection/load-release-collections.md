---
title: "ロードとリリース | BYOC"
slug: /load-release-collections
sidebar_label: "ロードとリリース"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションのロードは、コレクション内で類似検索およびクエリを実行するための前提条件です。このページでは、コレクションのロードおよびリリースの手順に焦点を当てます。 | BYOC"
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
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ロードとリリース

コレクションのロードは、コレクション内で類似検索およびクエリを実行するための前提条件です。このページでは、コレクションのロードおよびリリースの手順に焦点を当てます。

## コレクションのロード\{#load-collection}

コレクションをロードする際、Zilliz Cloudはインデックスファイルおよびすべてのフィールドの生データをメモリにロードし、検索およびクエリに迅速に対応できるようにします。コレクションロード後に挿入されたエンティティは自動的にインデックス化およびロードされます。

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

## 特定のフィールドのロード\{#load-specific-fields}

Zilliz Cloudは検索およびクエリに関連するフィールドのみをロードできるため、メモリ使用量を削減し検索性能を向上させます。

以下のコードスニペットでは、**my_collection**という名前のコレクションを作成し、コレクション内に**my_id**と**my_vector**という名前の2つのフィールドがあることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.load_collection(
    collection_name="my_collection",
    # highlight-next-line
    load_fields=["my_id", "my_vector"] # 指定されたフィールドのみをロード
    skip_load_dynamic_field=True # 動的フィールドのロードをスキップ
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
  load_fields: ["my_id", "my_vector"], // 指定されたフィールドのみをロード
  skip_load_dynamic_field: true // 動的フィールドのロードをスキップ
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
# まだサポートされていません
```

</TabItem>
</Tabs>

特定のフィールドをロードするように選択した場合、`load_fields`に含まれるフィールドのみが検索およびクエリのフィルタおよび出力フィールドとして使用できることに注意してください。常に主キー項目の名前と少なくとも1つのベクトルフィールドを`load_fields`に含める必要があります。

また、`skip_load_dynamic_field`を使用して動的フィールドをロードするかどうかを決定できます。動的フィールドは**$meta**という名前の予約JSONフィールドであり、スキーママで定義されていないすべてのフィールドとその値をキーバリュー形式で保存します。動的フィールドをロードする際、フィールド内のすべてのキーがロードされフィルタリングおよび出力に利用可能になります。動的フィールド内のすべてのキーがメタデータフィルタリングおよび出力に関与していない場合は、`skip_load_dynamic_field`を`True`に設定します。

コレクションロード後にさらに多くのフィールドをロードするには、インデックス変更によるエラーを避けるために、まずコレクションをリリースする必要があります。

## コレクションのリリース\{#release-collection}

検索およびクエリはメモリを多使用する操作です。コストを節約するため、現在使用していないコレクションをリリースすることをお勧めします。

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