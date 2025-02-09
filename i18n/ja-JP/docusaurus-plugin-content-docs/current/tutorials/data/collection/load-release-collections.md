---
title: "ロード&リリース | Cloud"
slug: /load-release-collections
sidebar_label: "ロード&リリース"
beta: FALSE
notebook: FALSE
description: "コレクションのロードは、コレクション内の類似検索やクエリを実行するための前提条件です。このページでは、コレクションのロードとリリースの手順に焦点を当てています。 | Cloud"
type: origin
token: RHtIwOn0yimJfQkOqsxcRiXqnhe
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - load
  - release
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ロード&リリース

コレクションのロードは、コレクション内の類似検索やクエリを実行するための前提条件です。このページでは、コレクションのロードとリリースの手順に焦点を当てています。

## ロードコレクション{#load-collection}

コレクションをロードすると、Zilliz Cloudはインデックスファイルとすべてのフィールドの生データをメモリにロードし、検索やクエリに迅速に応答します。コレクションのロード後に挿入されたエンティティは自動的にインデックス化され、ロードされます。

次のコードスニペットは、コレクションを読み込む方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 7. Load the collection
client.load_collection(
    collection_name="customized_setup_1"
)

res = client.get_load_state(
    collection_name="customized_setup_1"
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
        .collectionName("customized_setup_1")
        .build();

client.loadCollection(loadCollectionReq);

// 7. Get load state of the collection
GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("customized_setup_1")
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
    collection_name: "customized_setup_1"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.getLoadState({
    collection_name: "customized_setup_1"
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
    "log"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("customized_setup_1"))
if err != nil {
    // handle error
}

// sync wait collection to be loaded
err = loadTask.Await(ctx)
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "customized_setup_1"
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
    "collectionName": "customized_setup_1"
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

## 特定のフィールドをロード{#load-specific-fields}

Zilliz Cloudは、検索やクエリに関係するフィールドのみを読み込むことができ、メモリ使用量を減らし、検索パフォーマンスを向上させることができます。

<Admonition type="info" icon="📘" title="ノート">

<p>部分コレクションの読み込みは現在ベータ版であり、本番環境での使用は推奨されていません。</p>

</Admonition>

次のコードスニペットは、**customised_setup_2**という名前のコレクションを作成し、コレクションにmy_**id**と**my_vector**という2つのフィールドがあることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.load_collection(
    collection_name="customized_setup_1",
    # highlight-next-line
    load_fields=["my_id", "my_vector"] # Load only the specified fields
    skip_load_dynamic_field=True # Skip loading the dynamic field
)

res = client.get_load_state(
    collection_name="customized_setup_1"
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
        .collectionName("customized_setup_1")
        .loadFields(Arrays.asList("my_id", "my_vector"))
        .build();

client.loadCollection(loadCollectionReq);

// 7. Get load state of the collection
GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("customized_setup_1")
        .build();

Boolean res = client.getLoadState(loadStateReq);
System.out.println(res);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.load_collection({
  collection_name: "customized_setup_1",
  load_fields: ["my_id", "my_vector"], // Load only the specified fields
  skip_load_dynamic_field: true //Skip loading the dynamic field
});

const loadState = client.getCollectionLoadState({
    collection_name: "customized_setup_1",
})

console.log(loadState);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v2"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

loadTask, err := cli.LoadCollection(ctx, client.NewLoadCollectionOption("customized_setup_1").
    WithLoadFields("my_id", "my_vector"))
if err != nil {
    // handle error
}

// sync wait collection to be loaded
err = loadTask.Await(ctx)
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# REST 缺失
```

</TabItem>
</Tabs>

特定のフィールドをロードすることを選択した場合、`load_fields`に含まれるフィールドのみが検索やクエリのフィルタや出力フィールドとして使用できることに注意してください。`load_fields`には常にプライマリフィールドと少なくとも1つのベクトルフィールドの名前を含める必要があります。

また、`skip_load_dynamic_field`を使用して、動的フィールドをロードするかどうかを決定することもできます。動的フィールドは**$meta**という名前の予約済みJSONフィールドで、スキーマ定義されていないすべてのフィールドとその値をキーと値のペアで保存します。動的フィールドをロードすると、フィールド内のすべてのキーがロードされ、フィルタリングと出力に使用できます。動的フィールド内のすべてのキーがメタデータのフィルタリングと出力に関与していない場合は、`skip_load_dynamic_field`を`True`に設定します。

コレクションの読み込み後にさらに多くのフィールドを読み込むには、インデックスの変更によってエラーが発生する可能性があるため、最初にコレクションを解放する必要があります。

## リリースコレクション{#release-collection}

検索とクエリはメモリを大量に消費する操作です。コストを節約するために、現在使用されていないコレクションを解放することをお勧めします。

次のコードスニペットは、コレクションをリリースする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 8. Release the collection
client.release_collection(
    collection_name="custom_quick_setup"
)

res = client.get_load_state(
    collection_name="custom_quick_setup"
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
        .collectionName("custom_quick_setup")
        .build();

client.releaseCollection(releaseCollectionReq);

GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("custom_quick_setup")
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
    collection_name: "custom_quick_setup"
})

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
// LoadStateNotLoad
// 
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

err := cli.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("custom_quick_setup"))
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "custom_quick_setup"
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
    "collectionName": "custom_quick_setup"
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

