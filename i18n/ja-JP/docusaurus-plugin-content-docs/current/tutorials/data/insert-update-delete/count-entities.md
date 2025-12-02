---
title: "エンティティ数のカウント | Cloud"
slug: /count-entities
sidebar_label: "エンティティ数のカウント"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この記事では、コレクション内のエンティティをカウントする方法を紹介し、エンティティ数が実際の数字と異なる理由を説明します。 | Cloud"
type: origin
token: OfUIwNWVuimZgFk3gBVc61GnnKW
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - upsert
  - update
  - count
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エンティティ数のカウント

この記事では、コレクション内のエンティティをカウントする方法を紹介し、エンティティ数が実際の数字と異なる理由を説明します。

## 概要\{#overview}

Zilliz Cloudは、コレクション内のエンティティをカウントするための2つの方法を提供しています。

- **出力フィールドとしてcount(*)を使用したクエリ**

    コレクション内の正確なエンティティ数を取得するには、この方法を使用し、以下のことを確認してください。

    - ターゲットコレクションがロードされている。

    - クエリリクエストで`consistency_level`が`Strong`に設定されている。

    - `output_field`が`['count(*)']`に設定されている。

    そのようなクエリを受信した際、Zilliz Cloudはクエリノードにリクエストを送信し、メモリに既にロードされているエンティティをカウントします。

    クエリで複数のパーティション名を指定することで、これらのパーティション内の対応するエンティティ数を取得できます。詳細については、[出力フィールドとしてcount(*)を使用したクエリ](./count-entities)を参照してください。

- **get_collection_stats()の使用**

    上記の方法を使用することでコレクションの正確なカウントを取得できますが、どこでも使用することは推奨されません。プロセスは基本的にはクエリであり、頻繁な呼び出しはネットワークのジッターを引き起こしたり、ビジネスに関連する検索やクエリに影響を与える可能性があります。

    精度が主な関心事でない場合は、代わりに`get_collection_stats()`と`get_partition_stats()`を使用してください。この呼び出しは推定エンティティ数を提供しますが、ターゲットコレクションをロードする必要はなく、内部トラッカーが記録した内容を報告するだけなので、コストは無視できるほど小さいです。

    ご参考までに、すべてのデータ操作は非同期であるため、内部トラッカーはエンティティ数をリアルタイムで反映できません。詳細については、[get_collection_stats()の使用](./count-entities#use-getcollectionstats)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>上記で言及された両方の方法は、同じ主キーを持つエンティティを個別のエンティティとしてカウントします。</p>

</Admonition>

エンティティ数をプログラムで取得する代わりに、Zilliz Cloudコンソールでクラスター、コレクション、またはパーティションの数値にアクセスすることもできます。詳細については、[Zilliz Cloudコンソールでのエンティティ数](./count-entities)を参照してください。

## `count(*)`を出力フィールドとして使用したクエリ\{#query-with-count-as-the-output-field}

正確なエンティティ数を取得するには、コレクションをロードし、出力フィールドとして`count(*)`を使用したクエリを実行し、クエリの一貫性レベルを`Strong`に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 増分セグメント内のエンティティをカウントしない
res = client.query(
    collection_name="test_collection",
    # highlight-next-line
    output_fields=['count(*)']
)

# 増分セグメント内のエンティティを含めてカウント
res = client.query(
    collection_name="test_collection",
    # highlight-start
    output_fields=['count(*)'],
    consistency_level="Strong"
    # highlight-end
)

# 特定のパーティション内のエンティティをカウント
res = client.query(
    collection_name="test_collection",
    # highlight-start
    output_fields=['count(*)'],
    partition_names=['default']
    # highlight-end
)

# エンティティ数を取得
print(res[0]['count(*)'])
# 出力
# 20
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq
import io.milvus.v2.service.vector.request.QueryResp

// 増分セグメント内のエンティティをカウントしない
QueryResp count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-next-line
        .outputFields(Collections.singletonList("count(*)"))
        .build());

// 増分セグメント内のエンティティを含めてカウント
count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-start
        .outputFields(Collections.singletonList("count(*)"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        // highlight-end
        .build());

// 特定のパーティション内のエンティティをカウント
countR = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-start
        .outputFields(Collections.singletonList("count(*)"))
        .partitionNames(Collections.singletonList("default"))
        // highlight-end
        .build());

System.out.print(count.getQueryResults().get(0).getEntity().get("count(*)"));

// 出力
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

// 増分セグメント内のエンティティを含めてカウント
let res = await client.query({
    collection_name: "test_collection",
    output_fields: ["count(*)"],
    consistency_level: 'Strong'
});

// 特定のパーティション内のエンティティをカウント
res = await client.query({
    collection_name: "test_collection",
    output_fields: ["count(*)"],
    partition_names: ['default']
});

// エンティティ数を取得
console.log(res.data[0]['count(*)'])
// 出力
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
-d '{
    "collectionName": "test_collection",
    "filter": "",
    "outputFields": ["count(*)"]
}'
#{"code":0,"cost":0,"data":[{count: 20}]}
```

</TabItem>
</Tabs>

## `get_collection_stats()`の使用\{#use-getcollectionstats}

上記で説明したように、`get_collection_stats()`はコレクション内のエンティティの推定数を返しますが、これは実際のエンティティ数と異なる場合があります。コレクションをロードすることなく参考にすることができます。

次の例では、`test_collection`という名前のコレクションが存在すると仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# 1. milvusクライアントをセットアップ
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 2. コレクションのエンティティ数を取得
client.get_collection_stats(collection_name="test_collection")

# 出力
#
# {
#     'row_count': 1000
# }

# 3. パーティションのエンティティ数を取得
client.get_partition_stats(
    collection_name="test_collection",
    partition_name="_default"
)

# 出力
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

// 1. milvusクライアントをセットアップ
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

// 2. コレクションのエンティティ数を取得
GetCollectionStatsResp stats = client.getCollectionStats(GetCollectionStatsReq.builder()
        .collectionName("test_collection")
        .build());
System.out.print(stats.getNumOfEntities());

// 3. パーティションのエンティティ数を取得
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

// 1. milvusクライアントをセットアップ
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN'
});

// 2. エンティティ数を取得
milvusClient.getCollectionStats({
 collection_name: 'test_collection',
 partition_name: '_default'
});

// 出力
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
</Tabs>

## Zilliz Cloudコンソールでのエンティティ数\{#entity-counts-on-the-zilliz-cloud-console}

プログラムでエンティティをカウントする代わりに、Zilliz Cloudコンソールにアクセスして、以下のページでクラスター、コレクション、またはパーティションのエンティティ数を確認することもできます。

### メトリクス\{#metrics}

クラスターの**メトリクス**タブで、**エンティティ数**と**ロードされたエンティティ (推定)** を見つけることができます。これらの値は両方とも推定値です。曲線内の値は、[get_collection_stats()を使用](./count-entities#use-getcollectionstats)して取得されます。追加のデータ挿入や削除がない場合、**エンティティ数**の曲線は最終的に現在のコレクション内のエンティティの実際の数を反映します。

![UGT3bXxnjordXpxhTZUcMYK6nQg](/img/UGT3bXxnjordXpxhTZUcMYK6nQg.png)

### コレクションの詳細\{#collection-details}

コレクションの詳細タブで、コレクションの実際のエンティティ数を見つけることができます。この値は、[出力フィールドとしてcount(*)を使用](./count-entities)したクエリを使用して取得されます。

![L8ImbqFLIonMTxx47WBcF5IbnTf](/img/L8ImbqFLIonMTxx47WBcF5IbnTf.png)

### パーティション\{#partitions}

コレクションの**パーティション**タブを使用して、子パーティション内のロードされたエンティティの推定数を見つけることもできます。この値は`get_partition_stats()`を使用して取得されます。

![Y4Etb0AITotVQNxvzs4cZCHsn9d](/img/Y4Etb0AITotVQNxvzs4cZCHsn9d.png)

## FAQ\{#faqs}

- **いくつかのエンティティを挿入した後、get_collection_stats()またはget_partition_stats()を使用して取得したエンティティ数がターゲットコレクションまたはパーティション内の実際のエンティティ数を反映しないのはなぜですか？**

    これらの方法は、内部トラッカーが記録した内容のみを報告します。すべてのデータ操作が非同期であるため、実際のエンティティ数とは異なる場合があります。

- **いくつかのエンティティを挿入または削除した後、コレクションのメトリクスタブのエンティティ数曲線が変化しないのはなぜですか？**

    **エンティティ数**曲線の値は特定の時点での推定値です。すべてのデータ操作が非同期であるため、曲線に反映されるまでに遅延が生じる場合があります。

- **いくつかのエンティティを挿入または削除した後、コレクションのパーティションタブのエンティティ数 (推定) 列に表示される値が変化しないのはなぜですか？**

    一覧表示されるパーティションの値はすべて推定値です。すべてのデータ操作が非同期であるため、曲線に反映されるまでに遅延が生じる場合があります。

- **コレクションの概要タブに表示されるロードされたエンティティの値がコレクション内の実際のエンティティ数を反映しないのはなぜですか？**

    **ロードされたエンティティ**に表示される値は正確です。通常のクエリで取得した数とこの値に差がある場合、コレクション内の一部のエンティティが同じ主キーを持つ可能性があります。

    `count(*)`を出力フィールドとして使用するクエリでは、同じ主キーを持つエンティティを個別のエンティティとして扱いますが、他のクエリでは最終結果を返す前に同じ主キーを持つエンティティを省略することに注意してください。