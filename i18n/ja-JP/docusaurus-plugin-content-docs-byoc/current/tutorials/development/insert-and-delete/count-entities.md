---
title: "エンティティのカウント | BYOC"
slug: /count-entities
sidebar_label: "Count"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この記事では、collection 内のエンティティをカウントする方法と、エンティティ数が実際の値と異なる可能性がある理由について説明します。 | BYOC"
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

- **出力フィールドとして count(&ast;) を指定してクエリする**

    collection 内の正確なエンティティ数を取得するには、この方法を使用し、次のことを確認してください。

    - 対象の collection をロードしていること。

    - クエリリクエストで `consistency_level` を `Strong` に設定していること。

    - `output_field` を `['count(*)']` に設定していること。

    このようなクエリを受け取ると、Zilliz Cloud は query node にリクエストを送信し、すでにメモリにロードされているエンティティをカウントします。

    クエリで複数の partition 名を指定して、それらの partition に対応するエンティティ数を取得できます。詳細については、[出力フィールドとして count(*) を指定してクエリする](./count-entities) を参照してください。

- **get_collection_stats() を使用する**

    上記の方法を使用して collection の正確な数を取得できますが、これをあらゆる場面で使用することは推奨されません。この処理は基本的にクエリであり、頻繁に呼び出すとネットワークのジッターを引き起こしたり、ビジネスに関連する検索やクエリに影響したりする可能性があります。 

    精度が最優先でない場合は、代わりに `get_collection_stats()` と `get_partition_stats()` を使用してください。この呼び出しでは推定エンティティ数が提供されますが、実行のために対象の collection をロードする必要はなく、内部トラッカーが記録した内容を報告するだけなので、コストは無視できるほど小さいです。 

    参考までに、すべてのデータ操作は非同期であるため、内部トラッカーはエンティティ数をリアルタイムに反映できません。詳細については、[get_collection_stats() を使用する](./count-entities#use-getcollectionstats) を参照してください。

<Admonition type="info" icon="📘" title="注意">

上記の両方の方法では、同じ主キーを持つエンティティも別々のエンティティとしてカウントされます。 

</Admonition>

プログラムでエンティティ数を取得する代わりに、Zilliz Cloud コンソールで cluster、collection、または partition の値を確認することもできます。詳細については、[Zilliz Cloud コンソールでのエンティティ数](./count-entities) を参照してください。

## 出力フィールドとして `count(*)` を指定してクエリする\{#query-with-count-as-the-output-field}

正確なエンティティ数を取得するには、collection をロードし、出力フィールドとして `count(*)` を指定してクエリを実行し、そのクエリの整合性レベルを `Strong` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# growing segment 内のエンティティを含めずにカウント
res = client.query(
    collection_name="test_collection",
    # highlight-next-line
    output_fields=['count(*)']
)

# growing segment 内のエンティティを含めてカウント
res = client.query(
    collection_name="test_collection",
    # highlight-start
    output_fields=['count(*)'],
    consistency_level="Strong"
    # highlight-end
)

# 特定の partition 内のエンティティをカウント
res = client.query(
    collection_name="test_collection",
    # highlight-start
    output_fields=['count(*)'],
    partition_names=['_default']
    # highlight-end
)

# エンティティ数を取得
print(res[0]['count(*)'])
# Output
# 20
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq
import io.milvus.v2.service.vector.request.QueryResp

// growing segment 内のエンティティを含めずにカウント
QueryResp count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-next-line
        .outputFields(Collections.singletonList("count(*)"))
        .build());

// growing segment 内のエンティティを含めてカウント
count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-start
        .outputFields(Collections.singletonList("count(*)"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        // highlight-end
        .build());

// 特定の partition 内のエンティティをカウント
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

// growing segment 内のエンティティを含めてカウント
let res = await client.query({
    collection_name: "test_collection",
    output_fields: ["count(*)"],
    consistency_level: 'Strong'
});

// 特定の partition 内のエンティティをカウント
res = await client.query({
    collection_name: "test_collection",
    output_fields: ["count(*)"],
    partition_names: ['_default']
});

// エンティティ数を取得
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

## `get_collection_stats()` を使用する\{#use-getcollectionstats}

上で説明したように、`get_collection_stats()` は collection 内の推定エンティティ数を返すため、実際のエンティティ数とは異なる場合があります。これは collection をロードせずに参照値として使用できます。 

次の例では、`test_collection` という名前の collection が存在することを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# 1. milvus client をセットアップ
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 2. collection のエンティティ数を取得
client.get_collection_stats(collection_name="test_collection") 

# Output
# 
# {
#     'row_count': 1000
# }

# 3. partition のエンティティ数を取得
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

// 1. milvus client をセットアップ
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

// 2. collection のエンティティ数を取得
GetCollectionStatsResp stats = client.getCollectionStats(GetCollectionStatsReq.builder()
        .collectionName("test_collection")
        .build());
System.out.print(stats.getNumOfEntities());

// 3. partition のエンティティ数を取得
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

// 1. milvus client をセットアップ
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN'
});

// 2. エンティティ数を取得
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

プログラムでエンティティをカウントする代わりに、Zilliz Cloud コンソールにアクセスして、次のページで cluster、collection、または partition のエンティティ数を確認することもできます。

### Metrics\{#metrics}

cluster の **Metrics** タブでは、**Entity Count** と **Loaded Entities (Approx.)** を確認できます。どちらの値も推定値です。曲線上の値は、[`get_collection_stats()`](./count-entities#use-getcollectionstats)[ を使用して](./count-entities#use-getcollectionstats)取得されます。以後データの挿入や削除が行われなければ、**Entity Count** の曲線は最終的に現在の collection にある実際のエンティティ数を反映します。

![ZVYcwdlqAhOUqDb4vC3c2Hf8n5e](https://zdoc-images.s3.us-west-2.amazonaws.com/ZVYcwdlqAhOUqDb4vC3c2Hf8n5e.png)

### Collection Details\{#collection-details}

collection の詳細タブでは、その collection の実際のエンティティ数を確認できます。この値は、[出力フィールドとして ](./count-entities)[`count(*)`](./count-entities)[ を指定したクエリ](./count-entities)を使用して取得されます。

![PfXfwGQoLhW0OBbVMMfccM0Qnaf](https://zdoc-images.s3.us-west-2.amazonaws.com/PfXfwGQoLhW0OBbVMMfccM0Qnaf.png)

### Partitions\{#partitions}

collection の **Partitions** タブを使用して、その子 partition にロードされているエンティティの推定数を確認することもできます。この値は `get_partition_stats()` を使用して取得されます。

![LKThwnS2fhTj8vbFJpEcjAMunwf](https://zdoc-images.s3.us-west-2.amazonaws.com/LKThwnS2fhTj8vbFJpEcjAMunwf.png)

## FAQs\{#faqs}

- **エンティティをいくつか挿入した後でも、get_collection_stats() または get_partition_stats() を使用して取得したエンティティ数が対象の collection または partition の実際のエンティティ数を反映しないのはなぜですか。** 

    これらのメソッドは内部トラッカーが記録した内容のみを報告するためです。すべてのデータ操作は非同期であるため、実際のエンティティ数と異なる場合があります。

- **エンティティをいくつか挿入または削除した後でも、collection の Metrics タブにある Entity Count の曲線が変化しないのはなぜですか。**

    **Entity Count** の曲線内の値は、特定の時点での推定値です。すべてのデータ操作は非同期であるため、曲線に反映されるまでに遅延が生じる場合があります。

- **エンティティをいくつか挿入または削除した後でも、collection の Partitions タブにある Entity Count (Approx.) 列に表示される値が変化しないのはなぜですか。**

    一覧表示される partition の値はすべて推定値です。すべてのデータ操作は非同期であるため、曲線に反映されるまでに遅延が生じる場合があります。

- **collection の Overview タブに表示される Loaded Entities の値が、collection 内の実際のエンティティ数を反映していないのはなぜですか。**

    **Loaded Entities** に表示される値は正確です。この値と通常のクエリで取得したエンティティ数の間に差がある場合、collection 内の一部のエンティティが同一の主キーを持っている可能性があります。 

    `count(*)` を出力フィールドとして指定するクエリでは、同一の主キーを持つエンティティは別々のエンティティとして扱われます。一方、他のクエリでは、最終結果を返す前に同じ主キーを持つエンティティは除外されます。

