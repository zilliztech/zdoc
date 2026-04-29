---
title: "エンティティ数のカウント | Cloud"
slug: /count-entities
sidebar_key: count-entities
sidebar_label: "カウント"
beta: FALSE
notebook: FALSE
description: "この記事では、コレクション内のエンティティ数をカウントする方法と、エンティティ数が実際の数値と異なる可能性がある理由について説明します。| Cloud"
type: origin
token: OfUIwNWVuimZgFk3gBVc61GnnKW
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - upsert
  - update
  - count

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エンティティ数のカウント

この記事では、コレクション内のエンティティ数をカウントする方法と、エンティティ数が実際の値と異なる可能性がある理由について説明します。

## 概要\{#overview}

Zilliz Cloud では、コレクション内のエンティティ数をカウントする方法が2つ提供されています。

- **`count(*)` を出力フィールドとして使用したクエリ**

    コレクション内の正確なエンティティ数を取得するには、この方法を使用し、以下の条件を満たす必要があります。

    - 対象のコレクションがロード済みであること。
    - クエリリクエストで `consistency_level` を `Strong` に設定すること。
    - `output_field` を `['count(*)']` に設定すること。

    このようなクエリを受信すると、Zilliz Cloud はクエリノードにリクエストを送信し、メモリにすでにロードされているエンティティをカウントします。

    複数のパーティション名をクエリ内で指定することで、それらのパーティションごとのエンティティ数を取得できます。詳細については、「[Query with count(*) as the output field](./count-entities)」を参照してください。

- **`get_collection_stats()` の使用**

    上記の方法でコレクションの正確なエンティティ数を取得できますが、すべての場面でこの方法を使用することは推奨されません。この処理は基本的にクエリであり、頻繁に呼び出すとネットワークの不安定化や、ビジネスに関連する検索・クエリへの影響を引き起こす可能性があります。

    精度が最重要でない場合は、代わりに `get_collection_stats()` および `get_partition_stats()` を使用することを推奨します。この呼び出しは推定されたエンティティ数を提供しますが、対象のコレクションをロードする必要がなく、内部トラッカーが記録している情報を報告するだけなので、コストは非常に小さく無視できるほどです。

    なお、すべてのデータ操作は非同期で実行されるため、内部トラッカーがエンティティ数をリアルタイムで反映できない点にご注意ください。詳細については、「[Use get_collection_stats()](./count-entities#use-getcollectionstats)」を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>上記のどちらの方法も、同じプライマリキーを持つエンティティを別々のエンティティとしてカウントします。</p>

</Admonition>

プログラムによるエンティティ数の取得に加えて、Zilliz Cloud コンソール上でクラスター、コレクション、またはパーティションごとのエンティティ数を確認することもできます。詳細については、「[Entity counts on the Zilliz Cloud console](./count-entities)」をご覧ください。

## `count(*)` を出力フィールドとして使用したクエリ\{#query-with-count-as-the-output-field}

正確なエンティティ数を取得するには、コレクションをロードし、`count(*)` を出力フィールドとして指定してクエリを実行し、そのクエリの整合性レベル（consistency level）を `Strong` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

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

<TabItem value='java'>

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

<TabItem value='java'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "test_collection",
    "filter": "",
    "outputFields": ["count(*)"]
}'
#{"code":0,"cost":0,"data":[{count: 20}]}
```

</TabItem>
</Tabs>

## `get_collection_stats()` の使用\{#use-getcollectionstats}

前述のとおり、`get_collection_stats()` はコレクション内のエンティティ数の推定値を返します。この値は実際のエンティティ数と異なる場合があります。このメソッドはコレクションをロードせずに参照として使用できます。

以下の例では、`test_collection` という名前のコレクションがすでに存在しているものと仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```bash
# curl
```

</TabItem>
</Tabs>

## Zilliz Cloud コンソールでのエンティティ数\{#entity-counts-on-the-zilliz-cloud-console}

プログラムでエンティティをカウントする代わりに、Zilliz Cloud コンソールにアクセスして、以下のページでクラスター、コレクション、またはパーティションのエンティティ数を確認できます。

### メトリクス\{#metrics}

クラスターの**メトリクス**タブで、**エンティティ数**と**ロードされたエンティティ（概算）**を確認できます。どちらの値も推定値です。曲線の値は、[`get_collection_stats()`](./count-entities#use-getcollectionstats) [を使用して取得されます](./count-entities#use-getcollectionstats)。データの挿入や削除がこれ以上行われない場合、**エンティティ数**の曲線は最終的に現在のコレクション内の実際のエンティティ数を反映します。

![ZVYcwdlqAhOUqDb4vC3c2Hf8n5e](https://zdoc-images.s3.us-west-2.amazonaws.com/ZVYcwdlqAhOUqDb4vC3c2Hf8n5e.png)

### コレクションの詳細\{#collection-details}

コレクションの詳細タブで、コレクションの実際のエンティティ数を確認できます。この値は、出力フィールドとして [`count(*)`](./count-entities) [を使用するクエリ](./count-entities) によって取得されます。

![PfXfwGQoLhW0OBbVMMfccM0Qnaf](https://zdoc-images.s3.us-west-2.amazonaws.com/PfXfwGQoLhW0OBbVMMfccM0Qnaf.png)

### パーティション\{#partitions}

コレクションの**パーティション**タブを使用して、子パーティション内にロードされたエンティティの推定数を確認することもできます。この値は `get_partition_stats()` を使用して取得されます。

![LKThwnS2fhTj8vbFJpEcjAMunwf](https://zdoc-images.s3.us-west-2.amazonaws.com/LKThwnS2fhTj8vbFJpEcjAMunwf.png)

## よくある質問\{#faqs}

- **get_collection_stats() または get_partition_stats() を使用して取得したエンティティ数が、エンティティを挿入した後でも、対象のコレクションまたはパーティション内の実際のエンティティ数を反映しないのはなぜですか？**

    これらのメソッドは内部トラッカーが記録している内容のみを報告するため、すべてのデータ操作が非同期であることから、実際のエンティティ数と異なる場合があります。

- **コレクションのメトリクスタブにあるエンティティ数の曲線が、エンティティを挿入または削除しても変化しないのはなぜですか？**

    **エンティティ数**の曲線の値は特定の時点で推定されたものです。すべてのデータ操作が非同期であるため、曲線に反映されるまでに遅延が生じる可能性があります。

- **コレクションのパーティションタブにあるエンティティ数（概算）列に表示される値が、エンティティを挿入または削除しても変化しないのはなぜですか？**

    リストされたパーティションに表示される値はすべて推定値です。すべてのデータ操作が非同期であるため、曲線に反映されるまでに遅延が生じる可能性があります。

- **コレクションの概要タブに表示されるロードされたエンティティの値が、コレクション内の実際のエンティティ数を反映しないのはなぜですか？**

    **ロードされたエンティティ**に表示される値は正確です。この値と通常のクエリで取得したエンティティ数との間に差がある場合、コレクション内の一部のエンティティが同一のプライマリキーを持っている可能性があります。

    出力フィールドとして `count(*)` を使用するクエリは、同一のプライマリキーを持つエンティティを別々のエンティティとして扱いますが、他のクエリは最終結果を返す前に同一のプライマリキーを持つエンティティを除外します。

