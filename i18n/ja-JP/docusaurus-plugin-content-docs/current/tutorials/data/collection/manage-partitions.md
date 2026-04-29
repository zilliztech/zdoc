---
title: "パーティションの管理 | Cloud"
slug: /manage-partitions
sidebar_key: manage-partitions
sidebar_label: "パーティション"
beta: FALSE
notebook: FALSE
description: "パーティションはコレクションの部分集合です。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータの一部のみを含みます。このページでは、パーティションの管理方法について説明します。| Cloud"
type: origin
token: JCMPwIyVciCT4Hk4O20c96MEnch
sidebar_position: 8
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - partition
  - partitions

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# パーティションの管理

パーティションはコレクションの部分集合です。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータの一部のみを含みます。このページでは、パーティションの管理方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能はマネージドコレクションにのみ適用されます。</p>

</Admonition>

## 概要\{#overview}

コレクションを作成すると、Zilliz Cloud はそのコレクション内に **_default** という名前のパーティションも作成します。他のパーティションを追加しない場合、コレクションに挿入されたすべてのエンティティはデフォルトパーティションに格納され、すべての検索およびクエリもデフォルトパーティション内で実行されます。

特定の基準に基づいて追加のパーティションを作成し、そこにエンティティを挿入することができます。その後、特定のパーティション内でのみ検索やクエリを実行するように制限することで、検索パフォーマンスを向上させることができます。

1 つのコレクションが持てるパーティションの最大数は 1,024 です。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>パーティションキー</strong> 機能は、パーティションに基づく検索最適化であり、Zilliz Cloud が特定のスカラフィールドの値に基づいてエンティティを異なるパーティションに分散できるようにします。この機能は、パーティション指向のマルチテナンシーの実装を支援し、検索パフォーマンスを向上させます。</p>
<p>この機能についてはこのページで解説しません。詳細については、<a href="./use-partition-key">Use パーティションキー</a> を参照してください。</p>

</Admonition>

## パーティションの一覧表示\{#list-partitions}

コレクションを作成すると、Zilliz Cloud はそのコレクション内に **_default** という名前のパーティションも作成します。コレクション内のパーティションを一覧表示するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.list_partitions(
    collection_name="my_collection"
)

print(res)

# Output
#
# ["_default"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.ListPartitionsReq;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

import java.util.*;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("my_collection")
        .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);
System.out.println(partitionNames);

// Output:
// [_default]
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

let res = await client.listPartitions({
    collection_name: "my_collection"
})

console.log(res);

// Output
// ["_default"]
```

</TabItem>

<TabItem value='java'>

```go
import (
    "context"
    
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

partitionNames, err := client.ListPartitions(ctx, milvusclient.NewListPartitionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(partitionNames)
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": [
#         "_default"
#     ]
# }
```

</TabItem>
</Tabs>

## Create Partition\{#create-partition}

コレクションにさらにパーティションを追加し、特定の条件に基づいてエンティティをこれらのパーティションに挿入できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_partition(
    collection_name="my_collection",
    partition_name="partitionA"
)

res = client.list_partitions(
    collection_name="my_collection"
)

print(res)

# Output
#
# ["_default", "partitionA"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.CreatePartitionReq;

CreatePartitionReq createPartitionReq = CreatePartitionReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

client.createPartition(createPartitionReq);

ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("my_collection")
        .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);
System.out.println(partitionNames);

// Output:
// [_default, partitionA]
```

</TabItem>

<TabItem value='java'>

```javascript
await client.createPartition({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

res = await client.listPartitions({
    collection_name: "my_collection"
})

console.log(res)

// Output
// ["_default", "partitionA"]
```

</TabItem>

<TabItem value='java'>

```go
import (
    "fmt"
    
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

err = client.CreatePartition(ctx, milvusclient.NewCreatePartitionOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

partitionNames, err := client.ListPartitions(ctx, milvusclient.NewListPartitionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(partitionNames)
// Output
// ["_default", "partitionA"]
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionName": "partitionA"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": [
#         "_default",
#         "partitionA"
#     ]
# }
```

</TabItem>
</Tabs>

## 特定のパーティションの確認\{#check-for-a-specific-partition}

以下のコードスニペットは、特定のコレクション内にパーティションが存在するかどうかを確認する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.has_partition(
    collection_name="my_collection",
    partition_name="partitionA"
)

print(res)

# Output
#
# True
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.HasPartitionReq;

HasPartitionReq hasPartitionReq = HasPartitionReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

Boolean hasPartitionRes = client.hasPartition(hasPartitionReq);
System.out.println(hasPartitionRes);

// Output:
// true
```

</TabItem>

<TabItem value='java'>

```javascript
res = await client.hasPartition({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

console.log(res.value)

// Output
// true
```

</TabItem>

<TabItem value='java'>

```go
result, err := client.HasPartition(ctx, milvusclient.NewHasPartitionOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(result)

// Output:
// true
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionName": "partitionA"
}'

# {
#     "code": 0,
#     "data": {
#        "has": true
#     }
# }
```

</TabItem>
</Tabs>

## パーティションのロードとリリース\{#load-and-release-partitions}

1つまたは特定のパーティションを個別にロードまたはリリースできます。

### パーティションのロード\{#load-partitions}

コレクション内の特定のパーティションを個別にロードできます。コレクション内にロードされていないパーティションが1つでも存在する場合、そのコレクション全体のロード状態は「アンロード済み」となることに注意してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.load_partitions(
    collection_name="my_collection",
    partition_names=["partitionA"]
)

res = client.get_load_state(
    collection_name="my_collection",
    partition_name="partitionA"
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
import io.milvus.v2.service.partition.request.LoadPartitionsReq;
import io.milvus.v2.service.collection.request.GetLoadStateReq;

LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq.builder()
        .collectionName("my_collection")
        .partitionNames(Collections.singletonList("partitionA"))
        .build();

client.loadPartitions(loadPartitionsReq);

GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

Boolean getLoadStateRes = client.getLoadState(getLoadStateReq);
System.out.println(getLoadStateRes);

// True
```

</TabItem>

<TabItem value='java'>

```javascript
await client.loadPartitions({
    collection_name: "my_collection",
    partition_names: ["partitionA"]
})

res = await client.getLoadState({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

console.log(res)

// Output
// 
// LoadStateLoaded
// 
```

</TabItem>

<TabItem value='java'>

```go
task, err := client.LoadPartitions(ctx, milvusclient.NewLoadPartitionsOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// sync wait collection to be loaded
err = task.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(state)
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
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
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
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

### Release パーティション\{#release-partitions}

特定のパーティションをリリースすることもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.release_partitions(
    collection_name="my_collection",
    partition_names=["partitionA"]
)

res = client.get_load_state(
    collection_name="my_collection",
    partition_name="partitionA"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: NotLoaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;

ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
        .collectionName("my_collection")
        .partitionNames(Collections.singletonList("partitionA"))
        .build();

client.releasePartitions(releasePartitionsReq);

GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

Boolean getLoadStateRes = client.getLoadState(getLoadStateReq);
System.out.println(getLoadStateRes);

// False
```

</TabItem>

<TabItem value='java'>

```javascript
await client.releasePartitions({
    collection_name: "my_collection",
    partition_names: ["partitionA"]
})

res = await client.getLoadState({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

console.log(res)

// Output
// 
// LoadStateNotLoaded
// 
```

</TabItem>

<TabItem value='java'>

```go
err = client.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(state)
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
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
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
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

## パーティション内でのデータ運用\{#data-operations-within-partitions}

### エンティティの挿入と削除\{#insert-and-delete-entities}

特定のパーティションに対して、挿入（insert）、アップサート（upsert）、および削除（delete）の各操作を実行できます。詳細については、以下を参照してください。

- [パーティションへのエンティティの挿入](./insert-entities#insert-entities-into-a-partition)

- [パーティションへのエンティティのアップサート](./upsert-entities#upsert-entities-in-a-partition)

- [パーティションからのエンティティの削除](./delete-entities#delete-entities-from-partitions)

### 検索とクエリ\{#search-and-query}

特定のパーティション内で検索およびクエリを実行できます。詳細については、以下を参照してください。

- [パーティション内でのANN検索の実行](./single-vector-search#ann-search-in-partition)

- [パーティション内でのメタデータフィルタリングの実行](./get-and-scalar-query#queries-in-partitions)

## パーティションの削除\{#drop-partition}

不要になったパーティションを削除できます。パーティションを削除する前に、そのパーティションがリリース済みであることを確認してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.release_partitions(
    collection_name="my_collection",
    partition_names=["partitionA"]
)

client.drop_partition(
    collection_name="my_collection",
    partition_name="partitionA"
)

res = client.list_partitions(
    collection_name="my_collection"
)

print(res)

# ["_default"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.DropPartitionReq;
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;
import io.milvus.v2.service.partition.request.ListPartitionsReq;

ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
        .collectionName("my_collection")
        .partitionNames(Collections.singletonList("partitionA"))
        .build();

client.releasePartitions(releasePartitionsReq);

DropPartitionReq dropPartitionReq = DropPartitionReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

client.dropPartition(dropPartitionReq);

ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("my_collection")
        .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);
System.out.println(partitionNames);

// Output:
// [_default]
```

</TabItem>

<TabItem value='java'>

```javascript
await client.releasePartitions({
    collection_name: "my_collection",
    partition_names: ["partitionA"]
})

await client.dropPartition({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

res = await client.listPartitions({
    collection_name: "my_collection"
})

console.log(res)

// Output
// ["_default"]
```

</TabItem>

<TabItem value='java'>

```go
err = client.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.DropPartition(ctx, milvusclient.NewDropPartitionOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

partitionNames, err := client.ListPartitions(ctx, milvusclient.NewListPartitionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(partitionNames)
```

</TabItem>

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionName": "partitionA"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": [
#         "_default"
#     ]
# }
```

</TabItem>
</Tabs>

