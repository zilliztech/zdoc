---
title: "エンティティ数のカウント | BYOC"
slug: /count-entities
sidebar_label: "エンティティ数のカウント"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この記事では、コレクション内のエンティティ数をカウントする方法を紹介し、エンティティ数が実際の数と異なる理由を説明します。 | BYOC"
type: origin
token: OfUIwNWVuimZgFk3gBVc61GnnKW
sidebar_position: 3
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - アップサート
  - 更新
  - カウント
  - ベクトル類似検索
  - 近似最近傍検索
  - DiskANN
  - スパースベクトル

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エンティティ数のカウント

この記事では、コレクション内のエンティティ数をカウントする方法を紹介し、エンティティ数が実際の数と異なる理由を説明します。

## 概要\{#overview}

Zilliz Cloud では、コレクション内のエンティティ数をカウントする方法が2つ用意されています。

- **出力フィールドとして count(*) を使用したクエリ**

    コレクション内の正確なエンティティ数を取得するには、この方法を使用し、以下を確実にしてください：

    - 対象となるコレクションをロードしている。

    - クエリ要求で `consistency_level` を `Strong` に設定する。

    - `output_field` を `['count(*)']` に設定する。

    このようなクエリを受信した際、Zilliz Cloud はクエリノードにリクエストを送信し、既にメモリにロードされているエンティティをカウントします。

    クエリで複数のパーティション名を指定することで、これらのパーティション内の対応するエンティティ数を取得できます。詳細については[出力フィールドとして count(*) を使用したクエリ](./count-entities)を参照してください。

- **get_collection_stats() の使用**

    上記の方法でコレクションの正確な数を取得できますが、この方法を常に使用することは推奨されません。このプロセスは基本的にクエリであり、頻繁に呼び出すと、ネットワークのジッターが発生したり、業務関連の検索やクエリに影響を与える可能性があります。

    精度が主な関心事でない場合は、代わりに `get_collection_stats()` 及び `get_partition_stats()` を使用してください。この呼び出しはエンティティ数の推定値を提供しますが、対象コレクションをロードする必要がなく、内部トラッカーが記録した内容を報告するだけであるため、コストは無視できる程度です。

    ご参考までに、すべてのデータ操作は非同期的に行われるため、内部トラッカーがエンティティ数をリアルタイムに反映できないのです。詳細については[get_collection_stats() の使用](./count-entities#use-getcollectionstats)を参照してください。

<Admonition type="info" icon="📘" title="注釈">

<p>上述の両方の方法では、同じ主キーを持つエンティティを別々のエンティティとしてカウントします。</p>

</Admonition>

エンティティ数をプログラムで取得する代わりに、Zilliz Cloud コンソール上でクラスタ、コレクション、またはパーティションの数値を確認することもできます。詳細は[Zilliz Cloud コンソールでのエンティティ数](./count-entities)をご覧ください。

## 出力フィールドとして `count(*)` を使用したクエリ\{#query-with-count-as-the-output-field}

正確なエンティティ数を取得するには、コレクションをロードし、出力フィールドとして `count(*)` を使用してクエリを実行し、クエリの整合性レベルを `Strong` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 増分セグメントのエンティティをカウントしない
res = client.query(
    collection_name="test_collection",
    # highlight-next-line
    output_fields=['count(*)']
)

# 増分セグメントのエンティティを含めてカウント
res = client.query(
    collection_name="test_collection",
    # highlight-start
    output_fields=['count(*)'],
    consistency_level="Strong"
    # highlight-end
)

# 特定のパーティションのエンティティをカウント
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

// 増分セグメントのエンティティをカウントしない
QueryResp count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-next-line
        .outputFields(Collections.singletonList("count(*)"))
        .build());

// 増分セグメントのエンティティを含めてカウント
count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-start
        .outputFields(Collections.singletonList("count(*)"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        // highlight-end
        .build());

// 特定のパーティションのエンティティをカウント
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
    // エラー処理
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

// 増分セグメントのエンティティを含めてカウント
let res = await client.query({
    collection_name: "test_collection",
    output_fields: ["count(*)"],
    consistency_level: 'Strong'
});

// 特定のパーティションのエンティティをカウント
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

## `get_collection_stats()` の使用\{#use-getcollectionstats}

上記のように、`get_collection_stats()` は、コレクション内のエンティティ数の推定値を返します。これは実際のエンティティ数と異なる場合があります。コレクションをロードせずに参考として使用できます。

以下の例では、`test_collection` という名前のコレクションが存在すると仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# 1. Milvusクライアントの設定
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

// 1. Milvusクライアントの設定
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

// 1. Milvusクライアントの設定
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

## Zilliz Cloud コンソールでのエンティティ数\{#entity-counts-on-the-zilliz-cloud-console}

エンティティをプログラムでカウントする代わりに、Zilliz Cloud コンソールにアクセスして、以下のページでクラスタ、コレクション、またはパーティションのエンティティ数を確認することもできます。

### メトリクス\{#metrics}

**Metrics** タブでクラスタの **エンティティ数** と **ロードされたエンティティ（推定）** を確認できます。どちらの値も推定値です。グラフの値は[get_collection_stats() を使用して](./count-entities#use-getcollectionstats)[取得されます](./count-entities#use-getcollectionstats)。これ以上のデータ挿入と削除がない場合、最終的に **エンティティ数** グラフは現在のコレクション内の実際のエンティティ数を反映します。

![UGT3bXxnjordXpxhTZUcMYK6nQg](/img/UGT3bXxnjordXpxhTZUcMYK6nQg.png)

### コレクションの詳細\{#collection-details}

詳細タブでコレクションの実際のエンティティ数を確認できます。この値は[出力フィールドとして ](./count-entities)[`count(*)`](./count-entities)[ を使用したクエリ](./count-entities)を使用して取得されます。

![L8ImbqFLIonMTxx47WBcF5IbnTf](/img/L8ImbqFLIonMTxx47WBcF5IbnTf.png)

### パーティション\{#partitions}

コレクションの **パーティション** タブを使用して、その子パーティションにロードされたエンティティ数の推定値を確認することもできます。この値は `get_partition_stats()` を使用して取得されます。

![Y4Etb0AITotVQNxvzs4cZCHsn9d](/img/Y4Etb0AITotVQNxvzs4cZCHsn9d.png)

## よくある質問\{#faqs}

- **いくつかのエンティティを挿入した後に get_collection_stats() または get_partition_stats() を使用して取得したエンティティ数が、対象のコレクションまたはパーティション内の実際のエンティティ数を反映していないのはなぜですか？**

    これらの方法では、内部トラッカーが記録した内容のみを報告します。すべてのデータ操作が非同期であるため、実際のエンティティ数とは異なる場合があります。

- **いくつかのエンティティを挿入または削除した後に、コレクションの Metrics タブのエンティティ数グラフが変化しないのはなぜですか？**

    **エンティティ数** グラフの値は特定の時間点で推定されます。すべてのデータ操作が非同期であるため、グラフに反映されるまでに遅延が発生する場合があります。

- **いくつかのエンティティを挿入または削除した後に、コレクションの Partitions タブの Loaded Entity Count (Approx.) 列に表示される値が変化しないのはなぜですか？**

    一覧表示されているパーティションの値はすべて推定値です。すべてのデータ操作が非同期であるため、グラフに反映されるまでに遅延が発生する場合があります。

- **コレクションの Overview タブの Loaded Entities に表示される値が、コレクション内の実際のエンティティ数を反映していないのはなぜですか？**

    **Loaded Entities** に表示される値は正確です。通常のクエリで得られるエンティティ数と差がある場合、コレクション内にあるいくつかのエンティティが同じ主キーを持っている可能性があります。

    `count(*)` を出力フィールドとして使用したクエリでは、同じ主キーを持つエンティティを別のエンティティとして扱いますが、他のクエリでは同じ主キーを持つエンティティは最後の結果を返す前に省略されることに注意してください。