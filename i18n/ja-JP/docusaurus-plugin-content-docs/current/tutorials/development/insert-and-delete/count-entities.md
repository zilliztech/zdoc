---
title: "エンティティのカウント | Cloud"
slug: /count-entities
sidebar_label: "カウント"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この記事では、collection 内のエンティティをカウントする方法と、エンティティ数が実際の値と異なる可能性がある理由について説明します。 | Cloud"
type: origin
token: OfUIwNWVuimZgFk3gBVc61GnnKW
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エンティティのカウント

この記事では、collection 内のエンティティをカウントする方法と、エンティティ数が実際の値と異なる可能性がある理由について説明します。

## 概要\{#overview}

Zilliz Cloud では、collection 内のエンティティをカウントするための方法が 2 つ提供されています。 

- **出力フィールドとして count(&ast;) を指定した Query**

    collection 内の正確なエンティティ数を取得するには、この方法を使用し、以下を満たしていることを確認してください。

    - 対象の collection をロードしていること。

    - query リクエストで `consistency_level` を `Strong` に設定していること。

    - `output_field` を `['count(*)']` に設定していること。

    このような query を受け取ると、Zilliz Cloud は query node にリクエストを送信し、すでにメモリにロードされているエンティティをカウントします。

    query では複数の partition 名を指定して、それらの partition に対応するエンティティ数を取得できます。詳細は、[出力フィールドとして count(*) を指定した Query](./count-entities) を参照してください。

- **get_collection_stats() を使用**

    上記の方法で collection の正確な件数を取得できますが、あらゆる場面での使用は推奨されません。この処理は基本的に query であり、頻繁に呼び出すとネットワークのジッターを引き起こしたり、業務に関連する検索や query に影響を与えたりする可能性があります。 

    精度が最優先でない場合は、代わりに `get_collection_stats()` と `get_partition_stats()` を使用してください。この呼び出しでは推定エンティティ数が返されますが、実行のために対象の collection をロードする必要はなく、内部トラッカーに記録されている内容を報告するだけなので、コストは無視できるほど小さいです。 

    ご参考までに、すべてのデータ操作は非同期であるため、内部トラッカーはエンティティ数をリアルタイムに反映できません。詳細は、[get_collection_stats() を使用](./count-entities#use-getcollectionstats) を参照してください。

<Admonition type="info" icon="📘" title="注意">

上記の両方の方法では、同じ主キーを持つエンティティも別々のエンティティとしてカウントされます。 

</Admonition>

プログラムからエンティティ数を取得する代わりに、Zilliz Cloud コンソール上で cluster、collection、または partition の値を確認することもできます。詳細は、[Zilliz Cloud コンソールでのエンティティ数](./count-entities) を参照してください。

## 出力フィールドとして `count(*)` を指定した Query\{#query-with-count-as-the-output-field}

正確なエンティティ数を取得するには、collection をロードし、出力フィールドとして `count(*)` を指定して query を実行し、その query の consistency level を `Strong` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Count without the entities in growing segments
res = client.query(
    collection_name="test_collection",
    # highlight-next-line
    output_fields=['count(*)']
)

# Count with the entities in growing segments
res = client.query(
    collection_name="test_collection",
    # highlight-start
    output_fields=['count(*)'],
    consistency_level="Strong"
    # highlight-end
)

# Count the entities in a specific partition
res = client.query(
    collection_name="test_collection",
    # highlight-start
    output_fields=['count(*)'],
    partition_names=['_default']
    # highlight-end
)

# Get the entity count
print(res[0]['count(*)'])
# Output
# 20
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq
import io.milvus.v2.service.vector.request.QueryResp

// Count without the entities in growing segments
QueryResp count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-next-line
        .outputFields(Collections.singletonList("count(*)"))
        .build());

// Count with the entities in growing segments
count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-start
        .outputFields(Collections.singletonList("count(*)"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        // highlight-end
        .build());

// Count the entities in a specific partition
countR = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-start
        .outputFields(Collections.singletonList("count(*)"))
        .partitionNames(Collections.singletonList("_default"))
        // highlight-end
        .build());

System.out.print(count.getQueryResults().get(0).getEntity().get("count(*)"));

// Output
// 20
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("test_collection").
    WithFilter("").
    WithOutputFields("count(*)").
    WithConsistencyLevel(entity.ClStrong))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("count: ", resultSet.GetColumn("count").FieldData().GetScalars())
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// Count with the entities in growing segments
let res = await client.query({
    collection_name: "test_collection",
    output_fields: ["count(*)"],
    consistency_level: 'Strong'
});

// Count the entities in a specific partition
res = await client.query({
    collection_name: "test_collection",
    output_fields: ["count(*)"],
    partition_names: ['_default']
});

// Get the entity count
console.log(res.data[0]['count(*)'])
// Output
// 20
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "test_collection",
    "filter": "",
    "outputFields": ["count(*)"]
}'
#{"code":0,"cost":0,"data":[{count: 20}]}
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

auto request = milvus::QueryRequest()
                       .WithCollectionName("test_collection")
                       .AddOutputField("count(*)");

milvus::QueryResponse response;
status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

request = milvus::QueryRequest()
                   .WithCollectionName("test_collection")
                   .AddOutputField("count(*)")
                   .WithConsistencyLevel(milvus::ConsistencyLevel::STRONG);

status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

request = milvus::QueryRequest()
                   .WithCollectionName("test_collection")
                   .AddOutputField("count(*)")
                   .AddPartitionName("_default");

status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << response.Results().GetRowCount() << std::endl;
```

</TabItem>
</Tabs>

## `get_collection_stats()` を使用\{#use-getcollectionstats}

前述のとおり、`get_collection_stats()` は collection 内の推定エンティティ数を返すため、実際のエンティティ数と異なる場合があります。collection をロードせずに参照値として利用できます。 

以下の例では、`test_collection` という名前の collection が存在することを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 2. Get the entity count of a collection
client.get_collection_stats(collection_name="test_collection") 

# Output
# 
# {
#     'row_count': 1000
# }

# 3. Get the entity count of a partition
client.get_partition_stats(
    collection_name="test_collection",
    partition_name="_default"
) 

# Output
# 
# {
#     'row_count': 1000
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetCollectionStatsReq;
import io.milvus.v2.service.collection.response.GetCollectionStatsResp;
import io.milvus.v2.service.partition.request.GetPartitionStatsReq;
import io.milvus.v2.service.partition.response.GetPartitionStatsResp;

// 1. Set up a milvus client
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

// 2. Get the entity count of a collection
GetCollectionStatsResp stats = client.getCollectionStats(GetCollectionStatsReq.builder()
        .collectionName("test_collection")
        .build());
System.out.print(stats.getNumOfEntities());

// 3. Get the entity count of a partition
GetPartitionStatsResp partitionStats = client.getPartitionStats(GetPartitionStatsReq.builder()
        .collectionName("test_collection")
        .partitionName("_default")
        .build());
System.out.print(partitionStats.getNumOfEntities());
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

// 1. Set up a milvus client
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN'
});

// 2. Get the entity count
milvusClient.getCollectionStats({
 collection_name: 'test_collection',
 partition_name: '_default'
});

// Output
//
// {
//      data: {'row_count': 1000 }
// }
```

</TabItem>

<TabItem value='bash'>

```bash
# curl
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

milvus::GetCollectionStatsResponse response;
status = client->GetCollectionStats(milvus::GetCollectionStatsRequest()
                                    .WithCollectionName("test_collection")
                                    , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->GetCollectionStats(milvus::GetCollectionStatsRequest()
                                    .WithCollectionName("test_collection")
                                    .WithPartitionName("_default")
                                    , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << response.Stats().RowCount() << std::endl;
```

</TabItem>
</Tabs>

## Zilliz Cloud コンソールでのエンティティ数\{#entity-counts-on-the-zilliz-cloud-console}

プログラムからエンティティをカウントする代わりに、Zilliz Cloud コンソールにアクセスして、以下のページで cluster、collection、または partition のエンティティ数を確認することもできます。

### Metrics\{#metrics}

cluster の **Metrics** タブでは、**Entity Count** と **Loaded Entities (Approx.)** を確認できます。どちらの値も推定値です。曲線上の値は、[`get_collection_stats()`](./count-entities#use-getcollectionstats)[ を使用して](./count-entities#use-getcollectionstats)取得されます。以後データの挿入や削除が行われなければ、**Entity Count** の曲線は最終的に現在の collection 内の実際のエンティティ数を反映します。

![ZVYcwdlqAhOUqDb4vC3c2Hf8n5e](https://zdoc-images.s3.us-west-2.amazonaws.com/ZVYcwdlqAhOUqDb4vC3c2Hf8n5e.png)

### Collection Details\{#collection-details}

collection の詳細タブでは、その collection の実際のエンティティ数を確認できます。この値は、[`count(*)`](./count-entities)[ を出力フィールドとする](./count-entities)[ query を使用して](./count-entities)取得されます。

![PfXfwGQoLhW0OBbVMMfccM0Qnaf](https://zdoc-images.s3.us-west-2.amazonaws.com/PfXfwGQoLhW0OBbVMMfccM0Qnaf.png)

### Partitions\{#partitions}

collection の **Partitions** タブを使用して、その子 partition にロードされているエンティティの推定数を確認することもできます。この値は `get_partition_stats()` を使用して取得されます。

![LKThwnS2fhTj8vbFJpEcjAMunwf](https://zdoc-images.s3.us-west-2.amazonaws.com/LKThwnS2fhTj8vbFJpEcjAMunwf.png)

## FAQ\{#faqs}

- **いくつかのエンティティを挿入した後でも、get_collection_stats() または get_partition_stats() を使用して取得したエンティティ数が、対象の collection または partition の実際のエンティティ数を反映しないのはなぜですか？** 

    これらのメソッドは内部トラッカーに記録されている内容のみを報告します。すべてのデータ操作は非同期であるため、実際のエンティティ数と異なる場合があります。

- **エンティティを挿入または削除しても、collection の Metrics タブにある Entity Count の曲線が変化しないのはなぜですか？**

    **Entity Count** の曲線上の値は、特定の時点における推定値です。すべてのデータ操作は非同期であるため、曲線に反映されるまでに遅延が生じる場合があります。

- **エンティティを挿入または削除しても、collection の Partitions タブにある Entity Count (Approx.) 列に表示される値が変化しないのはなぜですか？**

    一覧表示される partition の値はすべて推定値です。すべてのデータ操作は非同期であるため、曲線に反映されるまでに遅延が生じる場合があります。

- **collection の Overview タブに表示される Loaded Entities の値が、collection 内の実際のエンティティ数を反映しないのはなぜですか？**

    **Loaded Entities** に表示される値は正確です。この値と通常の query で取得したエンティティ数の間に差がある場合、collection 内の一部のエンティティが同一の主キーを持っている可能性があります。 

    `count(*)` を出力フィールドとする query は、同一の主キーを持つエンティティを別々のエンティティとして扱います。一方、その他の query では、最終結果を返す前に同じ主キーを持つエンティティが除外されます。

