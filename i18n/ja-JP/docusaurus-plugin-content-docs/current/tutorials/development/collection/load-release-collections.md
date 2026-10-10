---
title: "ロードと解放 | Cloud"
slug: /load-release-collections
sidebar_label: "ロードと解放"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Loading a コレクション is a prerequisite for conducting similarity searches and queries within it. This page focuses on the procedures for loading and releasing a コレクション. | Cloud"
type: origin
token: CemEwKryciMUepkgYWZcOw6wncb
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ロードと解放

Loading a コレクション is a prerequisite for conducting similarity searches and queries within it. This page focuses on the procedures for loading and releasing a コレクション.

## 前提条件\{#prerequisites}

Before loading a コレクション, verify the following:

- For external コレクション, ensure you have called the sub-second refresh to synchronize data between the コレクション and the volume before creating インデックス.

- You have at least indexed all ベクトル fields, and optionally certain スカラー fields.

## ロード動作\{#loading-behaviors}

Although the same load request applies to both external and managed コレクション, the strategy for loading external コレクション depends on the target architecture:

| 環境 | メモリ動作 | 実行の詳細 |
| --- | --- | --- |
| Managed コレクション in serving クラスター | フルロード | Loads all インデックス and data (ベクトル and スカラー fields) directly into memory for high-performance access. |
| External コレクション in standalone データベース | インデックス-only Load | Loads only the インデックス into memory. Raw data is retrieved from disk on demand during active searches or queries. |

## Load コレクション\{#load-collection}

When you load a コレクション, Zilliz Cloud loads the インデックス files and the raw data of all fields into memory for rapid response to searches and queries. Entities inserted after a コレクション load are automatically indexed and loaded.

The following code snippets demonstrate how to load a コレクション.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

// 7. Load the collection
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build();

client.loadCollection(loadCollectionReq);

// Get load state of the collection
GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .build();

Boolean res = client.getLoadState(loadStateReq);
System.out.println(res);

// Output:
// true
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    )
    .await?;

    // 7. Load the collection
    client
        .load_collection(
            LoadCollectionRequest::builder()
                .collection_name("my_collection")
                .build()?,
        )
        .await?;

    let res = client
        .get_load_state(
            GetLoadStateRequest::builder()
                .collection_name("my_collection")
                .build()?,
        )
        .await?;

    println!("{:?}", res.state());

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

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

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 7. Load the collection
let res = await client.loadCollection({
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
</Tabs>

## 特定フィールドのロード\{#load-specific-fields}

Zilliz Cloud は、検索やクエリに関与するフィールドのみをロードできるため、メモリ使用量を削減し、検索パフォーマンスを向上させます。

The following code snippet assumes that you have created a コレクション named **my_collection**, and there are two fields named **my_id** and **my_vector** in the コレクション.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.load_collection(
    collection_name="my_collection",
    # highlight-next-line
    load_fields=["my_id", "my_vector"], # Load only the specified fields
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
import java.util.Arrays;

// Load the collection
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("my_collection")
        .loadFields(Arrays.asList("my_id", "my_vector"))
        .skipLoadDynamicField(true)
        .build();

client.loadCollection(loadCollectionReq);

// Get load state of the collection
GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .build();

Boolean res = client.getLoadState(loadStateReq);
System.out.println(res);
```

</TabItem>

<TabItem value='go'>

```go
loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection").
        WithLoadFields("my_id", "my_vector").
        WithSkipLoadDynamicField(true))
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

<TabItem value='rust'>

```rust
client
    .load_collection(
        LoadCollectionRequest::builder()
            .collection_name("my_collection")
            .load_fields(["my_id", "my_vector"])
            .skip_load_dynamic_field(true)
            .build()?,
    )
    .await?;

let res = client
    .get_load_state(
        GetLoadStateRequest::builder()
            .collection_name("my_collection")
            .build()?,
    )
    .await?;

println!("{:?}", res.state());
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

<TabItem value='javascript'>

```javascript
await client.loadCollection({
  collection_name: "my_collection",
  load_fields: ["my_id", "my_vector"], // Load only the specified fields
  skip_load_dynamic_field: true // Skip loading the dynamic field
});

const res = await client.getLoadState({
    collection_name: "my_collection",
});

console.log(res.state);

// Output
// LoadStateLoaded
```

</TabItem>

<TabItem value='bash'>

```bash
# REST
# Not supported yet
```

</TabItem>
</Tabs>

If you choose to load specific fields, it is worth noting that only the fields included in `load_fields` can be used as filters and output fields in searches and queries. You should always include the names of the primary field and at least one ベクトル field in `load_fields`.

また、`skip_load_dynamic_field` を使用して、dynamic field をロードするかどうかを決定できます。dynamic field は **\&#36;meta** という名前の予約済み JSON フィールドであり、スキーマで定義されていないすべてのフィールドとその値をキーと値のペアで保存します。dynamic field をロードすると、フィールド内のすべてのキーがロードされ、フィルタリングと出力に使用できるようになります。dynamic field 内のすべてのキーがメタデータのフィルタリングと出力に関与しない場合は、`skip_load_dynamic_field` を `True` に設定します。

To load more fields after the コレクション load, you need to release the コレクション first to avoid possible errors prompted because of インデックス changes.

## Release コレクション\{#release-collection}

Searches and queries are memory-intensive operations. To save the cost, you are advised to release the コレクション that are currently not in use.

The following code snippet demonstrates how to release a コレクション.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
// 8. Release the collection
client
    .release_collection(
        ReleaseCollectionRequest::builder()
            .collection_name("my_collection")
            .build()?,
    )
    .await?;

let res = client
    .get_load_state(
        GetLoadStateRequest::builder()
            .collection_name("my_collection")
            .build()?,
    )
    .await?;

println!("{:?}", res.state());
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

<TabItem value='javascript'>

```javascript
// 8. Release the collection
let res = await client.releaseCollection({
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
#         "loadState": "LoadStateNotLoad"
#     }
# }
```

</TabItem>
</Tabs>

