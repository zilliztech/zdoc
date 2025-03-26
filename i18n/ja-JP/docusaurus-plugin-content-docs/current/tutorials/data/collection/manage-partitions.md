---
title: "パーティションの管理 | Cloud"
slug: /manage-partitions
sidebar_label: "パーティションの管理"
beta: FALSE
notebook: FALSE
description: "パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータのサブセットのみを含みます。このページでは、パーティションの管理方法を理解するのに役立ちます。 | Cloud"
type: origin
token: OFb3wIDSDiEXYTkEdAactjalnQd
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - partition
  - partitions
  - rag llm architecture
  - private llms
  - nn search
  - llm eval

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# パーティションの管理

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータのサブセットのみを含みます。このページでは、パーティションの管理方法を理解するのに役立ちます。

## 概要について{#overview}

コレクションを作成する場合、Zilliz Cloudはコレクション内に**_default**という名前のパーティションを作成します。他のパーティションを追加しない場合、コレクションに挿入されたすべてのエンティティはデフォルトパーティションに入り、すべての検索とクエリもデフォルトパーティション内で実行されます。

パーティションを追加し、特定の条件に基づいてエンティティを挿入することができます。その後、特定のパーティション内で検索とクエリを制限し、検索パフォーマンスを向上させることができます。

1つのコレクションには最大1,024個のパーティションを含めることができます。

<Admonition type="info" icon="📘" title="ノート">

<p>「<strong>パーティションキー</strong>」機能は、パーティションに基づく検索最適化であり、Zilliz Cloudが特定のスカラーフィールドの値に基づいてエンティティを異なるパーティションに分散することを可能にします。この機能により、パーティション指向のマルチテナントを実装し、検索パフォーマンスを向上させることができます。</p>
<p>この機能については、このページでは説明しません。詳細については、<a href="./use-partition-key">パーティションキーを使う</a>するを参照してください。</p>

</Admonition>

## リストパーティション{#list-partitions}

コレクションを作成する場合、Zilliz Cloudはコレクション内に**_default**という名前のパーティションを作成します。コレクション内のパーティションは以下のようにリストできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.list_partitions(
    collection_name="quick_setup"
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
        .collectionName("quick_setup")
        .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);
System.out.println(partitionNames);

// Output:
// [_default]
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

let res = await client.listPartitions({
    collection_name: "quick_setup"
})

console.log(res);

// Output
// ["_default"]
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    // handle error
}

defer cli.Close(ctx)

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
    // handle error
}

fmt.Println(partitionNames)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup"
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

## パーティションを作成{#create-partition}

コレクションにさらにパーティションを追加し、特定の条件に基づいてこれらのパーティションにエンティティを挿入できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_partition(
    collection_name="quick_setup",
    partition_name="partitionA"
)

res = client.list_partitions(
    collection_name="quick_setup"
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
        .collectionName("quick_setup")
        .partitionName("partitionA")
        .build();

client.createPartition(createPartitionReq);

ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("quick_setup")
        .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);
System.out.println(partitionNames);

// Output:
// [_default, partitionA]
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createPartition({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

res = await client.listPartitions({
    collection_name: "quick_setup"
})

console.log(res)

// Output
// ["_default", "partitionA"]
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"
    
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

err = cli.CreatePartition(ctx, milvusclient.NewCreatePartitionOption("quick_setup", "partitionA"))
if err != nil {
    // handle error
}

partitionNames, err := cli.ListPartitions(ctx, milvusclient.NewListPartitionOption("quick_setup"))
if err != nil {
    // handle error
}

fmt.Println(partitionNames)
// Output
// ["_default", "partitionA"]
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
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
    "collectionName": "quick_setup"
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

## 特定のパーティションを確認する{#check-for-a-specific-partition}

次のコードスニペットは、特定のコレクションにパーティションが存在するかどうかを確認する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.has_partition(
    collection_name="quick_setup",
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
        .collectionName("quick_setup")
        .partitionName("partitionA")
        .build();

Boolean hasPartitionRes = client.hasPartition(hasPartitionReq);
System.out.println(hasPartitionRes);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.hasPartition({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

console.log(res.value)

// Output
// true
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"
    
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

result, err := cli.HasPartition(ctx, milvusclient.NewHasPartitionOption("quick_setup", "partitionA"))
if err != nil {
    // handle error
}

fmt.Println(result)

// Output:
// true
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
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

## パーティションのロードとリリース{#load-and-release-partitions}

1つまたは特定のパーティションを個別にロードまたは解放できます。

### パーティションをロードする{#load-partitions}

コレクション内の特定のパーティションを別々にロードすることができます。コレクション内にアンロードされたパーティションがある場合、コレクションのロード状態はアンロードされたままになることに注意してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.load_partitions(
    collection_name="quick_setup",
    partition_names=["partitionA"]
)

res = client.get_load_state(
    collection_name="quick_setup",
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
        .collectionName("quick_setup")
        .partitionNames(Collections.singletonList("partitionA"))
        .build();

client.loadPartitions(loadPartitionsReq);

GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("quick_setup")
        .partitionName("partitionA")
        .build();

Boolean getLoadStateRes = client.getLoadState(getLoadStateReq);
System.out.println(getLoadStateRes);

// True
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.loadPartitions({
    collection_name: "quick_setup",
    partition_names: ["partitionA"]
})

res = await client.getLoadState({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

console.log(res)

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
    
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

task, err := cli.LoadPartitions(ctx, milvusclient.NewLoadPartitionsOption("quick_setup", "partitionA"))

// sync wait collection to be loaded
err = task.Await(ctx)
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
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
    "collectionName": "quick_setup",
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

### リリースパーティション{#release-partitions}

特定のパーティションを解放することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.release_partitions(
    collection_name="quick_setup",
    partition_names=["partitionA"]
)

res = client.get_load_state(
    collection_name="quick_setup",
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
        .collectionName("quick_setup")
        .partitionNames(Collections.singletonList("partitionA"))
        .build();

client.releasePartitions(releasePartitionsReq);

GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("quick_setup")
        .partitionName("partitionA")
        .build();

Boolean getLoadStateRes = client.getLoadState(getLoadStateReq);
System.out.println(getLoadStateRes);

// False
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.releasePartitions({
    collection_name: "quick_setup",
    partition_names: ["partitionA"]
})

res = await client.getLoadState({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

console.log(res)

// Output
// 
// LoadStateNotLoaded
// 
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

err = cli.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("quick_setup", "partitionA"))
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
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
    "collectionName": "quick_setup",
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

## パーティション内のデータ操作{#data-operations-within-partitions}

### 図形の挿入と削除{#insert-and-delete-entities}

特定の操作で挿入、挿入、削除を行うことができます。詳細については、以下を参照してください。

- [パーティションにエンティティを挿入](./insert-entities#insert-entities-into-a-partition)

- [コレクション内のエンティティの更新と挿入](./upsert-entities#upsert-entity-in-a-collection)

- [パーティションからエンティティを削除](./upsert-entities#upsert-entities-in-a-partition)

### 検索とクエリ{#search-and-query}

特定のパーティション内で検索やクエリを実行できます。詳細については、参照してください。

- [パーティション内でANN検索を実行する](./single-vector-search#ann-search-in-partition)

- [パーティション内でメタデータのフィルタリングを行う](./get-and-scalar-query#queries-in-partitions)

## ドロップパーティション{#drop-partition}

不要になったパーティションを削除することができます。パーティションを削除する前に、パーティションが解放されていることを確認してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.release_partitions(
    collection_name="quick_setup",
    partition_names=["partitionA"]
)

client.drop_partition(
    collection_name="quick_setup",
    partition_name="partitionA"
)

res = client.list_partitions(
    collection_name="quick_setup"
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
        .collectionName("quick_setup")
        .partitionNames(Collections.singletonList("partitionA"))
        .build();

client.releasePartitions(releasePartitionsReq);

DropPartitionReq dropPartitionReq = DropPartitionReq.builder()
        .collectionName("quick_setup")
        .partitionName("partitionA")
        .build();

client.dropPartition(dropPartitionReq);

ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("quick_setup")
        .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);
System.out.println(partitionNames);

// Output:
// [_default]
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.releasePartitions({
    collection_name: "quick_setup",
    partition_names: ["partitionA"]
})

await client.dropPartition({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

res = await client.listPartitions({
    collection_name: "quick_setup"
})

console.log(res)

// Output
// ["_default"]
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

err := cli.DropPartition(ctx, milvusclient.NewDropPartitionOption("quick_setup", "partitionA"))
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup",
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
    "collectionName": "quick_setup",
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
    "collectionName": "quick_setup"
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

