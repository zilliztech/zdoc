---
title: "コスト最適化 | Cloud"
slug: /cost-optimization
sidebar_label: "コスト最適化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ規模とクエリ量が増加するにつれて、コスト管理が重要になります。このガイドでは、デプロイ方式の選択、インデックスのチューニング、エラスティックスケーリング、割引、請求分析という 5 つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。 | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コスト最適化

データ規模とクエリ量が増加するにつれて、コスト管理が重要になります。このガイドでは、デプロイ方式の選択、インデックスのチューニング、エラスティックスケーリング、割引、請求分析という 5 つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。

## 請求内容を理解する\{#understand-your-bill}

最適化に取り組む前に、コストがどこで発生しているかを把握してください。Zilliz Cloud の料金は、次の 5 つの項目で構成されています。

| 項目 | 説明 | 最適化可能？ |
| --- | --- | --- |
| [コンピューティング（CU）](./dedicated-cluster-cost) | Compute Unit に基づく Dedicated クラスターの時間課金です。 | 選択 + スケーリング |
| [Read/Write Operations](./serverless-cluster-cost) | Serverless クラスターの従量課金です。 | クエリ最適化 |
| [ストレージ](./storage-cost) | データとバックアップのストレージです（クラスターの状態を問いません）。 | ビルドレベル + データクリーンアップ |
| [データ転送](./data-transfer-cost) | イングレス、エグレス、リージョン間転送です。 | アーキテクチャ設計 |
| [監査ログ](./audit-log-cost) | 監査ログのリソース消費です。 | 必要に応じて有効化 |

ほとんどのユーザーにとって、コストの 70% 以上は **コンピューティング** が占めており、ここが最適化の余地も最も大きい領域です。

[料金計算ツール](https://zilliz.com/pricing#calculator) を使用すると、ベクトルの次元数、データ量、QPS 要件に基づいて月額の見積もりを取得できます。実際のビジネス負荷がピーク容量のまま無期限に推移することはまれなため、実際のコストは見積もりを下回ることがよくあります。

## 適切なデプロイ方式を選択する\{#choose-the-right-deployment-method}

適切なデプロイ方式の選択は、最も影響の大きい判断です。誤った方式を選ぶと、小さな最適化では埋められないほどのコストにつながる可能性があります。

### デプロイ方式の概要\{#deployment-methods-at-a-glance}

| 種類 | 料金参考（768 次元） | 容量/CU | 検索 QPS | レイテンシー | ユースケース |
| --- | --- | --- | --- | --- | --- |
| Free | 0 | 5 GB、≤5 コレクション | — | — | 学習、プロトタイピング |
| Serverless | RU 従量課金 | 自動スケーリング | 自動 | 中 | 不安定なトラフィック、Dev/Test |
| Dedicated（パフォーマンス最適化） | &#126;&#36;65/M ベクトル/mo | 2M/CU | 500–1,500 | 低（&lt;10ms p99） | レイテンシー重視の本番環境 |
| Dedicated（キャパシティ最適化） | &#126;&#36;20/M ベクトル/mo | 8M/CU | 100–300 | 中 | 大規模、コスト重視 |
| Dedicated（階層型ストレージ） | &#126;&#36;7/M vectors/mo | 40M/CU | 100–150（ホット） | 高め | 大規模データ、cold/hot 分離 |
| BYOC | カスタム | カスタム | カスタム | カスタム | コンプライアンス、クラウド割引 |

### 選択の判断ツリー\{#selection-decision-tree}

- **データが 100 万ベクトル未満、QPS が 50 未満の場合**<br/>
  → **Serverless** を使用します。操作に対してのみ料金が発生し、アイドル時のコストはゼロです。「将来の」トラフィックを見込んで Dedicated リソースをプロビジョニングしないでください。

- **データが 100 万～5,000 万ベクトルで、安定した低レイテンシーが必要な場合**<br/>
  → **キャパシティ最適化** クラスターが最もコスト効率の高いソリューションです。パフォーマンス最適化オプションよりも 3 倍安く、100 ミリ秒未満のレイテンシーを提供するため、ほとんどの RAG およびレコメンデーションシナリオには十分です。**パフォーマンス最適化** クラスターは、極端な要件（例：&lt;10 ms p99 のリアルタイム検索）にのみ使用してください。

- **データが 5,000 万ベクトルを超え、アクセス頻度が低い場合**<br/>
  → **階層型ストレージ** クラスターを使用します。キャパシティ最適化オプションよりも 3 倍安く、大規模データのうち一部のみが頻繁にクエリされるシナリオ（例：履歴ログ分析）に最適です。

- **コンプライアンス要件、または既存のクラウド割引 (RI/SP) がある場合**<br/>
  → **BYOC（Bring Your Own Cloud）** です。クラスターは VPC 内で実行されるため、エンタープライズレベルのクラウド割引を活用しながら、データ主権の要件を満たすことができます。

### 推奨：キャパシティ最適化はほとんどのシナリオに最適\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

キャパシティ最適化クラスターは、単なる「低速版」と誤解されることがよくあります。実際には、Zilliz Cloud で最もアーキテクチャが洗練された製品です。

従来のベクトルデータベースは、コストと引き換えに速度を得るため、すべてのインデックスと生データをメモリに保持します。一方、キャパシティ最適化クラスターは **階層型ストレージアーキテクチャ** を採用しています。

- **階層型ストレージ：** ベクトルインデックスは速度のためにメモリに保持され、スカラーデータと生のベクトルはインテリジェントキャッシュを備えた mmap によってディスクにマッピングされます。これにより、パフォーマンス最適化クラスターと比較して、CU あたり 3 倍のデータ密度を実現できます。

- **DiskANN レベルの最適化：** IVF インデックスはディスクに適したアクセス向けに調整され、NVMe SSD によるスループットを最大化しながら 10–50ms のレイテンシーを維持します。これはほとんどの AI アプリケーションにとって無視できる程度です。

- **高いリソース使用率：** パフォーマンス最適化クラスターは多くの場合 30% の余裕を確保しますが、キャパシティ最適化クラスターは 90% 以上のデータ密度に達することができます。

**まとめ：** パフォーマンス最適化オプションはハードウェアで速度を買い、キャパシティ最適化オプションはテクノロジーで効率を買います。

### プロジェクトプラン：Standard、Enterprise、Business Critical の比較\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud では、機能とスケーリングの上限に影響する複数のプランを提供しています。

| 機能 | Standard | Enterprise | Business Critical |
| --- | --- | --- | --- |
| 最大 CU | 32 CU | 256 CU | 512 CU |
| レプリカ上限 | Query CU × Repl ≤ 32 | Query CU × Repl ≤ 256 | Query CU × Repl ≤ 512 |
| SLA | 0.999 | 0.9995 | 0.9999 |
| マルチ AZ | シングル AZ | オプション | デフォルトで有効 |
| RBAC | 基本 | カスタムロール + 監査 | フル + SOC2/HIPAA |
| BYOC | 非対応 | 対応 | 対応 |
| サポート | チケット | SA + Slack | 24/7 + 15 分以内の応答 |

詳細については、[プランの詳細比較](./select-zilliz-cloud-service-plans) を参照してください。

**アドバイス：** **Standard** から開始してください。より高い SLA、マルチ AZ、または大規模なスケールが必要な場合にのみ **Enterprise** にアップグレードします。アップグレードはシームレスで、データ移行は不要です。

### よくある落とし穴\{#common-pitfalls}

1. **デフォルトでパフォーマンス最適化クラスターを選ぶ：** 多くのユーザーは、PoC で使用したパフォーマンス最適化クラスターを基準に予算を立てます。しかし、キャパシティ最適化は「ダウングレード版」ではなく、コスト効率のために専用に設計されたアーキテクチャです。パフォーマンス最適化クラスターのわずか 1/3 のコストで、ほとんどのシナリオに十分な QPS を提供します。

1. **階層型ストレージオプションを見落とす：** パフォーマンス最適化クラスターの 1/9 のコストで利用できる階層型ストレージクラスターは、hot/cold のアクセスパターンが明確なデータに最適です。データのごく一部にのみ低レイテンシーが必要な場合は、階層型ストレージオプションによってコストを桁単位で削減できます。

1. **小規模な用途で Dedicated を使用する：** 小規模なデータセットや不安定なトラフィックには、Serverless（従量課金）の方が Dedicated よりもはるかにコスト効率が高くなります。「エンタープライズ」らしさだけを目的として、リソースを過剰にプロビジョニングしないでください。

## インデックスとストレージの最適化\{#index-and-storage-optimization}

モードを選択したら、各 CU の有用性を最大化するようにパラメーターをチューニングします。

### インデックスのビルドレベル：容量と再現率の比較\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ パラメーター ](./tune-index-build-level)は、インデックスの精度とストレージ密度を制御します。これを下げると、極端な再現率を必要としないシナリオでは、各 CU のストレージ容量を大幅に増やすことができます。

- **パフォーマンス最適化クラスター（768 次元、CU あたり）：**

    | ビルドレベル | 容量 | 増加 | 再現率 | QPS |
    | --- | --- | --- | --- | --- |
    | 容量優先（0） | 2.1M | 0.4 | 90–95% | &#126;2,850 |
    | バランス（1）デフォルト | 1.5M | ベースライン | 91–97% | &#126;3,500 |
    | 精度優先（2） | 1.0M | -0.33 | 92–98% | &#126;3,000 |

- **キャパシティ最適化クラスター（768 次元、CU あたり）：**

    | ビルドレベル | 容量 | 増加 | 再現率 | QPS |
    | --- | --- | --- | --- | --- |
    | 容量優先（0） | 7M | 0.4 | 89–97% | &#126;300 |
    | バランス（1）デフォルト | 5M | ベースライン | 93–98% | &#126;350 |
    | 精度優先（2） | 3M | -0.4 | 94–98% | &#126;345 |

**ケーススタディ：** 16 CU のキャパシティ最適化クラスターは、デフォルトで 8,000 万ベクトルを保持できます。`Capacity-first` に切り替えるとこれが 1 億 1,200 万ベクトルに増えるか、同じ 8,000 万ベクトルを 12 CU に収めることができ、**CU コストを 25% 削減** できます。

<Admonition type="info" title="Note">

`build_level` パラメーターは、一度設定すると変更できません。変更するには、インデックスを削除して再作成する必要があります。コレクションを作成する前に要件を評価することをお勧めします。このパラメーターは、浮動小数点ベクトル型（FLOAT_VECTOR、FLOAT16_VECTOR、BFLOAT16_VECTOR）のみをサポートします。

</Admonition>

### 検索レベル：パフォーマンスとコストの比較\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ パラメーター](./tune-recall-rate)（1–10）は、検索の精度を制御します。

- **レベル 1–3：** ほとんどのシナリオに最適です（再現率 90–95%）。

- <strong>レベル 4–7：</strong> 高精度のシナリオ向けです。レイテンシーを約 2–3 倍にしても、再現率 95–98% を得られます。

- **レベル 8–10：** 重要なシナリオ（例：医療、不正検出）向けの極めて高い精度を実現しますが、レイテンシーとコンピューティングコストが大幅に増加します。

**アドバイス：** `enable_recall_calculation=true` を使用して再現率を測定し、ビジネス要件を満たす最小のレベルを見つけてください。レベルを上げるたびに検索で消費される計算リソースが増加します。Serverless クラスターでは、これがそのまま読み取り vCU コストの増加につながり、Dedicated クラスターでは、同じ CU 割り当てでサポートできる QPS が低下することを意味します。

### mmap 設定：メモリとディスクのバランス\{#mmap-configuration-balancing-memory-and-disk}

[メモリマッピング（mmap）](./use-mmap) は、データをメモリからディスクにオフロードします。

| クラスターの種類 | デフォルトの mmap ポリシー | 効果 |
| --- | --- | --- |
| Dedicated（パフォーマンス最適化） | 生のベクトルデータのみが mmap を使用し、スカラーデータとすべてのインデックスはメモリに保持されます | 低レイテンシーを保証します |
| Dedicated（キャパシティ最適化） | スカラーインデックスとすべての生データが mmap を使用し、ベクトルインデックスのみがメモリに保持されます | 容量を最大化します |
| Free / Serverless | すべてのフィールドとインデックスが mmap を使用します | システムキャッシュに依存します |

**最適化の推奨事項：**

- パフォーマンス最適化クラスターでは、スカラーフィルタリングがボトルネックでない場合、スカラーフィールドで mmap を有効にして、ベクトルインデックス用のメモリを解放することを検討してください。

- キャパシティ最適化クラスターでは、デフォルトのポリシーがすでにストレージ優先であるため、通常は追加のチューニングは必要ありません。

<Admonition type="info" title="Note">

mmap 設定を変更する前にコレクションをリリースし、変更後に再ロードする必要があります。設定を誤ると、パフォーマンスの低下や OOM エラーが発生する可能性があります。まずテスト環境で検証してください。

</Admonition>

## クエリの最適化\{#query-optimization}

効率的なクエリは、Serverless ユーザーの Read Unit（RU）コストを削減し、Dedicated CU の QPS を向上させます。

### スカラーフィールドにインデックスを作成する\{#index-scalar-fields}

多くのユーザーは、[BITMAP](./bitmap-index-type) などのインデックスタイプを使用したスカラーインデックス作成を怠っています。スカラーインデックスがない場合、フィルター（例：`category == "electronics"` や `timestamp > 1700000000`）は **コレクション全体のスキャン** を引き起こし、非常に大きなコストがかかります。頻繁にフィルタリングされるスカラーフィールドにはインデックスを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="category",
    index_type="BITMAP",
    index_name="idx_category"
)

index_params.add_index(
    field_name="timestamp",
    index_type="BITMAP",
    index_name="idx_timestamp"
)

client.create_index(
    collection_name="my_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Arrays;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Collections;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

client.createIndex(CreateIndexReq.builder()
        .collectionName("my_collection")
        .indexParams(Arrays.asList(
                IndexParam.builder()
                        .fieldName("category")
                        .indexType(IndexParam.IndexType.BITMAP)
                        .indexName("idx_category")
                        .build(),
                IndexParam.builder()
                        .fieldName("timestamp")
                        .indexType(IndexParam.IndexType.BITMAP)
                        .indexName("idx_timestamp")
                        .build()))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
    "fmt"
    "github.com/milvus-io/milvus/client/v3/entity"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

_, err = client.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "category", index.NewBitmapIndex()).WithIndexName("idx_category"))
if err != nil {
    log.Fatal("failed to create index: ", err.Error())
}

_, err = client.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "timestamp", index.NewBitmapIndex()).WithIndexName("idx_timestamp"))
if err != nil {
    log.Fatal("failed to create index: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name("my_collection")
            .index_param(
                IndexParam::new()
                    .field_name("category")
                    .index_type(IndexType::Bitmap)
                    .index_name("idx_category"),
            )
            .build()?,
    )
    .await?;

client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name("my_collection")
            .index_param(
                IndexParam::new()
                    .field_name("timestamp")
                    .index_type(IndexType::Bitmap)
                    .index_name("idx_timestamp"),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"
#include <vector>

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateIndex(milvus::CreateIndexRequest().WithCollectionName("my_collection")
        .AddIndex(milvus::IndexDesc("category", "idx_category", milvus::IndexType::BITMAP, milvus::MetricType::L2))
        .AddIndex(milvus::IndexDesc("timestamp", "idx_timestamp", milvus::IndexType::BITMAP, milvus::MetricType::L2)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

await client.createIndex({
    collection_name: "my_collection",
    field_name: "category",
    index_type: "BITMAP",
    index_name: "idx_category",
});

await client.createIndex({
    collection_name: "my_collection",
    field_name: "timestamp",
    index_type: "BITMAP",
    index_name: "idx_timestamp",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

await client.CreateIndexAsync(new CreateIndexReq
{
    CollectionName = "my_collection",
    Indexes =
    [
        new IndexParam("category", "idx_category", IndexType.Bitmap),
        new IndexParam("timestamp", "idx_timestamp", IndexType.Bitmap)
    ]
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "indexParams": [
        {
            "fieldName": "category",
            "indexName": "idx_category",
            "indexType": "BITMAP"
        },
        {
            "fieldName": "timestamp",
            "indexName": "idx_timestamp",
            "indexType": "BITMAP"
        }
    ]
}'
```

</TabItem>
</Tabs>

**最適化の推奨事項：**

- `filter` 式に含まれるすべてのスカラーフィールドにインデックスを構築します。Zilliz Cloud は、適切なインデックスタイプ（文字列には転置インデックス、数値にはソート済みインデックスなど）を自動的に選択します。

- スカラーインデックスのメモリオーバーヘッドは最小限ですが、フィルタリングのパフォーマンスを桁違いに向上させ、テーブル全体のスキャンをインデックスルックアップに変えます。

- **重要：** 特にキャパシティ最適化クラスターでのフィルター付きベクトル検索では、スカラーインデックスの有無によって、クエリのレイテンシーがミリ秒単位になるか秒単位になるかが直接決まります。

### 適切な TopK を選択する\{#select-appropriate-topk}

[TopK](./single-vector-search) は、コンピューティングとネットワークのオーバーヘッドに直接影響します。

| TopK | 相対レイテンシー | 相対 RU コスト（Serverless） | 一般的なユースケース |
| --- | --- | --- | --- |
| 1–10 | ベースライン | 1x | RAG（通常 3–5 個のコンテキストチャンク） |
| 10–50 | 1.2–1.5x | 1.5–2x | レコメンデーションシステム、検索結果ページ |
| 50–200 | 1.5–3x | 2–4x | 候補セットの生成、再ランキングの入力 |
| 200–1000 | 3–10x | 4–10x | バッチ分析、クラスタリング |

- **RAG：** TopK 3–10 を使用します。コンテキストを増やしても LLM の品質が向上することはほとんどなく、トークンと RU を浪費します。

- **レコメンデーション：** 再ランキングモデルの上限（通常 20–50）を使用します。

- **大きな TopK：** 1 回のリクエストで大量の結果セットを返す代わりに、[ページネーション](https://zilliverse.feishu.cn/wiki/BaGlwzDmyiyVvVk6NurcFclInCd#K0GIdj7YKox4wzxZCTrcbtBgnyc)（`offset` + `limit`）または [イテレーター](./with-iterators) を使用します。

### 出力フィールドを絞り込む\{#refine-output-fields}

デフォルトでは、検索は以下に示すようにすべてのスカラーフィールドを返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

results = client.search(
    collection_name="my_collection",
    data=[query_vector],
    anns_field="embedding",
    search_params={"metric_type": "COSINE"},
    limit=10
)
```

</TabItem>

<TabItem value='java'>

```java
FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});

SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .annsField("embedding")
        .topK(10)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    10,              // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let results = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("embedding")
            .vectors(SearchVectors::Float(vec![vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]]))
            .limit(10)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> queryVector = {0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F};

auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("my_collection")
                         .WithAnnsField("embedding")
                         .WithLimit(10)
                         .WithMetricType(milvus::MetricType::COSINE)
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Failed to search: " << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

const results = await client.search({
    collection_name: "my_collection",
    data: query_vector,
    anns_field: "embedding",
    limit: 10,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

float[] queryVector = [0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f];

SearchResp results = await client.SearchAsync(new SearchReq
{
    CollectionName = "my_collection",
    VectorFieldName = "embedding",
    Vectors = [queryVector],
    Limit = 10
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "embedding",
    "limit": 10
}'
```

</TabItem>
</Tabs>

ただし、すべてのクエリで大きなテキストフィールド（例：ドキュメントの全文）を返すと、レイテンシーと RU コストが増加します。そのため、必要な出力フィールドのみを指定できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

results = client.search(
    collection_name="my_collection",
    data=[query_vector],
    anns_field="embedding",
    search_params={"metric_type": "COSINE"},
    limit=10,
    # Do not return large fields such as "content"
    output_fields=["id", "title", "category"]
)
```

</TabItem>

<TabItem value='java'>

```java
FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});

SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .annsField("embedding")
        .topK(10)
        // Do not return "content" and other large fields
        .outputFields(Arrays.asList("id", "title", "category"))
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    10,              // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").WithOutputFields("id", "title", "category")) // Do not return "content" and other large fields
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let results = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("embedding")
            .vectors(SearchVectors::Float(vec![vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]]))
            .limit(10)
            .output_fields(["id", "title", "category"]) // Do not return "content" and other large fields
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> queryVector = {0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F};

auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("my_collection")
                         .WithAnnsField("embedding")
                         .WithLimit(10)
                         .WithMetricType(milvus::MetricType::COSINE)
                         .WithOutputFields({"id", "title", "category"}) // Do not return "content" and other large fields
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Failed to search: " << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

const results = await client.search({
    collection_name: "my_collection",
    data: query_vector,
    anns_field: "embedding",
    limit: 10,
    // Do not return "content" and other large fields
    output_fields: ["id", "title", "category"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

float[] queryVector = [0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f];

SearchResp results = await client.SearchAsync(new SearchReq
{
    CollectionName = "my_collection",
    VectorFieldName = "embedding",
    Vectors = [queryVector],
    Limit = 10,
    Parameters = new SearchParameters
    {
        // Do not return large fields such as "content"
        OutputFields = { "id", "title", "category" }
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "embedding",
    "limit": 10,
    "outputFields": ["id", "title", "category"]
}'
```

</TabItem>
</Tabs>

詳細については、[出力フィールドの使用](https://zilliverse.feishu.cn/wiki/BaGlwzDmyiyVvVk6NurcFclInCd#Sm86dgCilopuURxM8pgcok8In5f) を参照してください。

**最適化の推奨事項：**

- 常に `output_fields` を明示的に指定し、ビジネスロジックで必要なフィールドのみを返します。

- RAG シナリオで元のテキストが必要な場合は、まずベクトル検索で ID を取得し、次にその ID によって外部ストレージ（例：Redis、データベース）からソースコンテンツを取得することを検討してください。これによりベクトル検索を高速に保ちながら、外部ストレージのキャッシュの利点を活用できます。

- Serverless モードでは、返されるデータ量が Read vCU の課金に直接影響します。不要なフィールドを減らすことが、コストを削減する最も簡単な方法です。

### パーティションキーを活用する\{#utilize-partition-keys}

[パーティションキー](./use-partition-key) は、スカラー値に基づいてデータを自動的にパーティションに分散し、検索が無関係なデータをスキップできるようにします。

次の例は、コレクションを作成するときにパーティションキーを指定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema = client.create_schema()

schema.add_field(field_name="id",
    datatype=DataType.INT64,
    is_primary=True)

schema.add_field(field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=5)

# Add the partition key
schema.add_field(
    field_name="tenant_id",
    datatype=DataType.VARCHAR,
    max_length=128,
    is_partition_key=True,
)
```

</TabItem>

<TabItem value='java'>

```java
// Create schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

// Add the partition key
schema.addField(AddFieldReq.builder()
        .fieldName("tenant_id")
        .dataType(DataType.VarChar)
        .maxLength(128)
        .isPartitionKey(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
schema := entity.NewSchema().WithDynamicFieldEnabled(false)
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
).WithField(entity.NewField().
    WithName("tenant_id").
    WithDataType(entity.FieldTypeVarChar).
    WithIsPartitionKey(true).
    WithMaxLength(128),
)
```

</TabItem>

<TabItem value='rust'>

```rust
let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let schema = CollectionSchema::new()
    .add_field(
        FieldSchema::new()
            .name("id")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    .add_field(
        FieldSchema::new()
            .name("embedding")
            .data_type(DataType::FloatVector)
            .dimension(5),
    )
    .add_field(
        FieldSchema::new()
            .name("tenant_id")
            .data_type(DataType::VarChar)
            .max_length(128)
            .partition_key(true), // Add the partition key
    );
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
schema->AddField(milvus::FieldSchema("tenant_id", milvus::DataType::VARCHAR).WithPartitionKey(true).WithMaxLength(128));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Define fields
const fields = [
    {
        name: "id",
        data_type: DataType.Int64,
        is_primary_key: true,
    },
    {
        name: "embedding",
        data_type: DataType.FloatVector,
        dim: 5,
    },
    {
        name: "tenant_id",
        data_type: DataType.VarChar,
        max_length: 128,
        // Add the partition key
        is_partition_key: true,
    },
];
```

</TabItem>

<TabItem value='csharp'>

```csharp
CollectionSchema schema = new()
{
    Fields =
    {
        new FieldSchema("id", DataType.Int64, isPrimaryKey: true),
        new FieldSchema("embedding", DataType.FloatVector) { Dimension = 5 },
        // Add the partition key
        FieldSchema.CreateVarchar("tenant_id", 128, isPartitionKey: true)
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
    "autoId": false,
    "enabledDynamicField": false,
    "fields": [
        {
            "fieldName": "id",
            "dataType": "Int64",
            "isPrimary": true
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "elementTypeParams": {
                "dim": "5"
            }
        },
        {
            "fieldName": "tenant_id",
            "dataType": "VarChar",
            "isPartitionKey": true,
            "elementTypeParams": {
                "max_length": 128
            }
        }
    ]
}'
```

</TabItem>
</Tabs>

**ユースケース：**

- **マルチテナント SaaS：** `tenant_id` をパーティションキーとして使用すると、各テナントのクエリがそのテナント自身のデータパーティションのみをスキャンするようになり、QPS とレイテンシーの両方が大幅に改善されます。

- **カテゴリフィルタリング：** `category` をパーティションキーとして使用すると、特定のカテゴリ内で検索するときにデータセット全体をスキャンする必要がなくなります。

**パフォーマンスの向上：** データが均等に分散された 100 テナントを想定した場合、パーティションキーを使用するとクエリあたりのスキャン量が約 99% 削減されます。分散が不均等な場合でも、通常はスキャン量が 50–90% 削減されます。

## エラスティックスケーリング\{#elastic-scaling}

Dedicated クラスターの最大のコストの落とし穴は、「ピーク負荷に合わせてプロビジョニングし、24 時間稼働し続けること」です。Zilliz Cloud は、このパターンを打破する 3 つのスケーリング戦略を提供しています。

### 自動スケーリング\{#auto-scaling}

CU の最小値と最大値を設定すると、システムはリアルタイムの負荷に基づいて自動的にスケーリングします。

- Query CU は CU Capacity メトリクスに基づいて自動的にスケーリングします（データ量に基づく）

- レプリカは CU Computation メトリクスに基づいて自動的にスケーリングします（QPS に基づく）

**一般的なシナリオ：** 日中ピーク時に 32 CU を必要とし、夜間は 8 CU のみで足りる e コマース検索サービスを考えます。自動スケーリング設定で min=8、max=32 を設定すると、システムはオフピーク時間帯に自動的に 8 CU までスケールダウンします。1 日あたり 10 時間のオフピーク時間を想定すると、月間のコンピューティングコストを約 30–40% 削減できます。

詳細については、[自動スケーリング](./auto-scaling) を参照してください。

### スケジュールスケーリング\{#scheduled-scaling}

トラフィックパターンが予測可能なワークロードに適しています。Basic モード（シンプルなセレクター）と Advanced モード（Unix cron 式）をサポートします。

**一般的な構成：**

- 平日の 9:00 に 32 CU までスケールアップし、22:00 に 8 CU までスケールダウンします

- 週末は終日 8 CU を維持します

- 月末のプロモーション期間に備えて事前にスケールします

詳細については、[スケジュールスケーリング](./scheduled-scaling) を参照してください。

### 手動スケーリング\{#manual-scaling}

最もシンプルな選択肢を見落とさないでください。ワークロードが静かな期間（例：プロジェクト間やオフシーズン）に入ったら、CU 構成を積極的に減らします。多くのユーザーは PoC 後にスケールダウンするのを忘れ、数週間から数か月にわたって不要な容量の料金を支払い続けています。

詳細については、[手動スケーリング](./manual-scaling) を参照してください。

### スケーリングの制約\{#scaling-constraints}

- Query CU × Replica ≤ 10,240

- Replica > 1 の場合、クラスターを 12 CU 未満にスケールダウンすることはできません

- スケールダウンする場合、データ量は新しい CU 容量の 80% 未満である必要があります

- 12 CU 未満では Query CU のみを調整できます。12 CU を超える場合は、Query CU と Replica を個別に調整できます

**推奨：** 予測できないトラフィックには動的スケーリングを使用し、規則的なトラフィックパターンにはスケジュールスケーリングを使用します。この 2 つは組み合わせることができます。

## クレジットと割引をさらに取得する\{#get-more-credits-and-discounts}

技術的な最適化に加えて、Zilliz のプロモーションプログラムを最大限に活用することも同様に重要です。

### クレジット\{#credits}

| チャネル | クレジット | 有効期間 | 備考 |
| --- | --- | --- | --- |
| 新規ユーザー登録 | &#36;100 クレジット | 30 日間 | すぐに利用可能。クレジットカードは不要です |
| 支払い方法の追加 | — | 1 年間に延長 | 未使用のクレジットは、支払い方法の追加時に自動的に延長されます |
| ごみ箱 | 無料 | — | ごみ箱にある削除済みデータには料金が発生しません |

**推奨：** 初回登録後、できるだけ早く支払い方法を追加して、&#36;100 クレジットの有効期間を 30 日間から 1 年間に延長してください。これにより、技術評価に十分な時間を確保できます。

### Dedicated プログラム\{#dedicated-programs}

| プログラム | 対象者 | 申請方法 |
| --- | --- | --- |
| Zilliz AI Startup Program | 初期段階のスタートアップ | [公式 Web サイト](https://zilliz.com/zilliz-for-startups) から申請すると、追加のクレジットと技術サポートを受けられます |
| AI Agent Program | AI Agent 開発者 | AI Agent アプリケーションを構築する開発者向けの限定クレジットです。近日提供予定です。 |

### エンタープライズ顧客\{#enterprise-customers}

- <strong>カスタム見積もりについては営業担当者に問い合わせてください：</strong> エンタープライズ顧客は年間サブスクリプションを通じて割引を受けられます。具体的な料金については [営業担当者に問い合わせてください](https://zilliz.com/contact-sales)。

- **クラウドマーケットプレイスのサブスクリプション：** [AWS](./subscribe-on-aws-marketplace)、[Google Cloud](./subscribe-on-gcp-marketplace)、[Azure](./subscribe-on-azure-marketplace) のマーケットプレイスを通じてサブスクライブすると、Zilliz Cloud の料金をクラウドの請求書にまとめ、既存のエンタープライズ割引を適用できます。

- **前払い：** [前払い](./advance-pay) を通じてアカウントに資金を入金します。控除の優先順位は、クレジット > 前払い > cloud marketplace subscriptions/credit cards です。予算管理の要件がある組織に適しています。

## 使用状況ページを監視する\{#monitor-usage-page}

最適化は一度きりの取り組みではありません。Zilliz Cloud は多次元のコスト分析ツールを提供し、支出を継続的に追跡して最適化できるようにします。

### 可視化されたコスト分析\{#visualized-cost-analysis}

**Billing > Usage** ページでは、請求内容を次の 5 つの観点で分類できます。

| **観点** | **目的** |
| --- | --- |
| プロジェクト | 異なる事業部門や部署間の使用状況を比較します |
| クラスター | どのクラスターが主なコスト要因であるかを特定します |
| 期間 | 日単位の傾向を表示し、異常な変動を検出します |
| コストタイプ | 請求カテゴリ別に料金を分類します |
| クラウドリージョン | マルチリージョン展開のリージョン間でコストを比較します |

複数の観点をフィルターとして組み合わせることができます。たとえば、特定のプロジェクトの過去 7 日間の CU コストを選択すると、その事業部門のコンピューティングコストの傾向を正確に把握できます。

詳細については、[コストを分析する](./analyze-cost) を参照してください。

### RESTful API\{#restful-api}

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API は、最大 8 桁の小数精度で使用状況データを提供し、内部の FinOps ワークフローにプログラムで統合して、次のことを行えます。

- コストレポートを自動的に生成する

- 内部の予算管理システムと統合する

- カスタムのアラートルールを設定する

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${BASE_URL}/v2/usage/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json" \
-d '{
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-02-01T00:00:00Z"
}'
```

### 使用状況アラート\{#usage-alerts}

[コストメトリクス](./metrics-alerts-reference#organization-level-metrics) を監視し、アラートしきい値を設定して異常な支出を早期に検出することをお勧めします。特に次のシナリオでは重要です。

- 新しく起動したクラスターで、実際のコストが想定と一致していることを確認する場合

- 動的スケーリングを設定した後、スケーリングが正しく機能していることを確認する場合

- 新しいチームメンバーが不要なリソースを作成した可能性がある場合

## コスト最適化チェックリスト\{#cost-optimization-checklist}

すぐに実行できるチェックリストは次のとおりです。

**選択フェーズ**

**インデックス構成**

**クエリ最適化**

**運用フェーズ**

**請求の最適化**

## まとめ\{#summary}

Zilliz Cloud のコスト最適化は、単一のパラメーターを調整することではなく、選択、構成、クエリ、運用、請求にまたがるシステム全体の取り組みです。最も効果の高い最適化は次のとおりです。

1. **まずキャパシティ最適化クラスターを選択する** — これは「ダウングレード」ではありません。コスト効率のために特別に設計された階層型ストレージアーキテクチャであり、単価はパフォーマンス最適化クラスターの 1/3 で、本番ユースケースの 90% 以上をカバーします。

1. **クエリパターンを最適化する** — スカラーフィールドにインデックスを作成し、TopK を制御し、返されるフィールドを絞り込み、パーティションキーを使用します。これらはそれぞれ、クエリごとのコストを有意義に削減します。

1. **エラスティックスケーリングを使用する** — アイドル状態のリソースへの支払いをやめ、30–40% を節約します。

1. **ビルドレベルをチューニングする** — 同じ CU で 40% 多くのデータを保存します。

適切に実行すれば、ほとんどのユーザーはビジネス要件を満たしながらコストを十分に妥当な範囲内に抑え、ストレージの階層化、インデックス最適化、エラスティックスケジューリングで Zilliz Cloud が提供する技術的利点を活用できます。
