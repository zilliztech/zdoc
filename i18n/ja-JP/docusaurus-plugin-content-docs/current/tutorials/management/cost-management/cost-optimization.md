---
title: "コスト最適化 | Cloud"
slug: /cost-optimization
sidebar_label: "コスト最適化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ規模の拡大とクエリ量の増加に伴い、コスト管理が重要になります。本ガイドでは、デプロイ方法の選択、インデックスのチューニング、エラスティックスケーリング、割引、請求分析という 5 つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。 | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コスト最適化

データ規模の拡大とクエリ量の増加に伴い、コスト管理が重要になります。本ガイドでは、デプロイ方法の選択、インデックスのチューニング、エラスティックスケーリング、割引、請求分析という 5 つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。

## 請求内容を理解する\{#understand-your-bill}

最適化を行う前に、コストがどこで発生しているかを特定します。Zilliz Cloud の料金は 5 つの要素で構成されます。

| 項目 | 説明 | 最適化可否 |
| --- | --- | --- |
| [コンピューティング（CU）](./dedicated-cluster-cost) | Compute Unit に基づく Dedicated クラスターの時間単位の課金です。 | 選択 + スケーリング |
| [Read/Write オペレーション](./serverless-cluster-cost) | Serverless クラスター向けの従量課金です。 | クエリの最適化 |
| [ストレージ](./storage-cost) | データおよびバックアップのストレージです（クラスターの状態を問いません）。 | ビルドレベル + データクリーンアップ |
| [データ転送](./data-transfer-cost) | イングレス、エグレス、リージョン間転送です。 | アーキテクチャ設計 |
| [監査ログ](./audit-log-cost) | 監査ログ記録のためのリソース消費です。 | 必要に応じて有効化 |

ほとんどのユーザーにとって、コストの 70% 超は **コンピューティング** に起因し、ここに最大の最適化余地があります。

[料金計算ツール](https://zilliz.com/pricing#calculator) を使用すると、ベクトル次元、データ量、QPS 要件に基づく月額の見積もりを取得できます。実際のコストは見積もりより低いことが多いです。ビジネス負荷が常にピーク容量のまま推移することはほとんどないためです。

## 適切なデプロイ方法を選択する\{#choose-the-right-deployment-method}

適切なデプロイ方法を選択することが、最も影響の大きい判断です。誤った方法を選択すると、軽微な最適化では埋め合わせられないコストにつながる可能性があります。

### デプロイ方法の一覧\{#deployment-methods-at-a-glance}

| タイプ | 料金の目安（768 次元） | 容量/CU | 検索 QPS | レイテンシ | ユースケース |
| --- | --- | --- | --- | --- | --- |
| Free | 0 | 5 GB、コレクション 5 個以下 | — | — | 学習、プロトタイピング |
| Serverless | RU 従量課金 | 自動スケーリング | 自動 | 中 | 不安定なトラフィック、Dev/Test |
| Dedicated (Performance-optimized) | &#126;&#36;65/M ベクトル/mo | 2M/CU | 500–1,500 | 低（&lt;10ms p99） | レイテンシ重視の本番環境 |
| Dedicated (Capacity-optimized) | &#126;&#36;20/M ベクトル/mo | 8M/CU | 100–300 | 中 | 大規模、コスト重視 |
| Dedicated (Tiered-storage) | &#126;&#36;7/M ベクトル/mo | 40M/CU（≥8 CU） | 100–150（Hot） | 高め | 大規模データ、cold/hot 分離 |
| BYOC | カスタム | カスタム | カスタム | カスタム | コンプライアンス、クラウド割引 |

### 選択のデシジョンツリー\{#selection-decision-tree}

- **データ < 1M ベクトル、QPS < 50 の場合**<br/>
  → **Serverless** を使用します。オペレーションに対してのみ支払い、アイドル時のコストはゼロです。「将来の」トラフィックのために Dedicated リソースをプロビジョニングしないでください。

- **データ 1M–50M ベクトル、安定した低レイテンシが必要な場合**<br/>
  → **Capacity-optimized** クラスターが最もコスト効率の高いソリューションです。performance-optimized オプションより 3 倍安価で、100 ミリ秒未満のレイテンシを提供し、ほとんどの RAG およびレコメンデーションシナリオに十分です。**performance-optimized** クラスターは、極端な要件（例: &lt;10 ms p99 のリアルタイム検索）にのみ使用してください。

- **データ > 50M ベクトル、アクセス頻度が低い場合**<br/>
  → **Tiered-storage** クラスターを使用します。capacity-optimized オプションより 3 倍安価で、大容量データのうち一部のみが頻繁にクエリされるシナリオ（例: 過去ログの分析）に最適です。

- **コンプライアンス、または既存のクラウド割引 (RI/SP) がある場合**<br/>
  → **BYOC (Bring Your Own Cloud)** です。クラスターは VPC 内で実行されるため、エンタープライズレベルのクラウド割引を活用でき、データ主権の要件を満たせます。

### 推奨: capacity-optimized — ほとんどのシナリオに最適\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

capacity-optimized クラスターは、「低速な」バージョンにすぎないと誤解されることがよくあります。実際には、Zilliz Cloud で最もアーキテクチャ的に洗練された製品です。

従来のベクトルデータベースはすべてのインデックスと生データをメモリに保持し、速度と引き換えにコストを犠牲にしますが、capacity-optimized クラスターは **階層型ストレージアーキテクチャ** を採用しています。

- **階層型ストレージ:** ベクトルインデックスは速度のためにメモリに保持され、スカラーデータと生ベクトルは、インテリジェントキャッシュを備えた mmap を介してディスクにマッピングされます。これにより、performance-optimized クラスターと比較して CU あたり 3 倍のデータ密度を実現できます。

- **DiskANN レベルの最適化:** IVF インデックスはディスクに適したアクセスにチューニングされ、NVMe SSD でスループットを最大化し、10–50ms のレイテンシを維持します。これはほとんどの AI アプリケーションにとって無視できるものです。

- **高いリソース利用率:** performance-optimized クラスターはしばしば 30% のヘッドルームを確保しますが、capacity-optimized クラスターは 90% 以上のデータ密度に達することができます。

**まとめ:** performance-optimized オプションはハードウェアで速度を買い、capacity-optimized オプションはテクノロジーで効率を買います。

### プロジェクトプラン: Standard、Enterprise、Business Critical\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud は、機能とスケーリングの上限に影響するいくつかのプランを提供しています。

| 機能 | Standard | Enterprise | Business Critical |
| --- | --- | --- | --- |
| 最大 CU | 32 CU | 256 CU | 512 CU |
| レプリカ上限 | Query CU × Repl ≤ 32 | Query CU × Repl ≤ 256 | Query CU × Repl ≤ 512 |
| SLA | 0.999 | 0.9995 | 0.9999 |
| マルチ AZ | シングル AZ | 任意 | デフォルトで有効 |
| RBAC | 基本 | カスタムロール + 監査 | フル + SOC2/HIPAA |
| BYOC | 未対応 | 対応 | 対応 |
| サポート | チケット | SA + Slack | 24/7 + 15 分以内の応答 |

詳細は、[プラン詳細比較](./select-zilliz-cloud-service-plans) を参照してください。

**推奨:** **Standard** から始めてください。より高い SLA、マルチ AZ、またはより大規模なスケールが必要な場合にのみ **Enterprise** にアップグレードしてください。アップグレードはシームレスで、データ移行は不要です。

### よくある落とし穴\{#common-pitfalls}

1. **performance-optimized クラスターをデフォルトにする:** 多くのユーザーは、PoC 中に使用した performance-optimized クラスターを基準に予算を組みます。しかし、capacity-optimized は「ダウングレード」版ではなく、コスト効率のために専用に設計されたアーキテクチャです。performance-optimized クラスターのわずか 1/3 のコストで、ほとんどのシナリオに十分な QPS を提供します。

1. **Tiered-storage オプションを見落とす:** performance-optimized クラスターの 1/9 のコストで、tiered-storage クラスターは hot/cold のアクセスパターンが明確なデータに最適です。データのごく一部のみが低レイテンシを必要とする場合、tiered-storage オプションはコストを桁単位で削減できます。

1. **小規模な用途に Dedicated を使用する:** 小規模なデータセットや不安定なトラフィックには、Serverless（従量課金）の方が Dedicated よりはるかにコスト効率が高いです。「エンタープライズ」という見栄えのためだけにリソースを過剰にプロビジョニングすることは避けてください。

## インデックスとストレージの最適化\{#index-and-storage-optimization}

モードを選択したら、各 CU の有用性を最大化するようにパラメーターをチューニングします。

### インデックスのビルドレベル: 容量と再現率\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ パラメーター ](./tune-index-build-level)は、インデックスの精度とストレージ密度を制御します。これを下げると、極端な再現率を必要としないシナリオで各 CU のストレージ容量を大幅に増やすことができます。

- **performance-optimized クラスター（768 次元、CU あたり）:**

    | ビルドレベル | 容量 | 増加 | 再現率 | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 2.1M | 0.4 | 90–95% | &#126;2,850 |
    | Balanced (1) Default | 1.5M | Baseline | 91–97% | &#126;3,500 |
    | Precision-first (2) | 1.0M | -0.33 | 92–98% | &#126;3,000 |

- **capacity-optimized クラスター（768 次元、CU あたり）:**

    | ビルドレベル | 容量 | 増加 | 再現率 | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 7M | 0.4 | 89–97% | &#126;300 |
    | Balanced (1) Default | 5M | Baseline | 93–98% | &#126;350 |
    | Precision-first (2) | 3M | -0.4 | 94–98% | &#126;345 |

**ケーススタディ:** 16 CU の capacity-optimized クラスターは、デフォルトで 80M ベクトルを保持します。`Capacity-first` に切り替えるとこれが 112M に増加し、同じ 80M ベクトルを 12 CU に収めることもできます — **CU コストを 25% 削減**します。

<Admonition type="info" title="Note">

`build_level` パラメーターは一度設定すると変更できません。変更するにはインデックスを削除して再作成する必要があります。コレクションを作成する前に要件を評価することをお勧めします。このパラメーターは浮動小数点ベクトル型（FLOAT_VECTOR、FLOAT16_VECTOR、BFLOAT16_VECTOR）のみをサポートします。

</Admonition>

### 検索レベル: パフォーマンスとコスト\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ パラメーター](./tune-recall-rate)（1–10）は検索精度を制御します。

- **レベル 1–3:** ほとんどのシナリオ（再現率 90–95%）に最適です。

- <strong>レベル 4–7:</strong> 高精度のシナリオです。約 2–3 倍のレイテンシと引き換えに、再現率 95–98% を得られます。

- **レベル 8–10:** 重要なシナリオ（例: 医療、不正検知）向けの極めて高い精度ですが、レイテンシとコンピューティングコストが大幅に増加します。

**推奨:** `enable_recall_calculation=true` を使用して再現率を測定し、ビジネス要件を満たす最も低いレベルを見つけてください。レベルを 1 つ上げるごとに、検索で消費される計算リソースが増加します — Serverless クラスターでは、これは読み取り vCU コストの増加に直結し、Dedicated クラスターでは、同じ CU 割り当てでサポートできる QPS の低下を意味します。

### Mmap 構成: メモリとディスクのバランス\{#mmap-configuration-balancing-memory-and-disk}

[メモリマッピング（mmap）](./use-mmap) はデータをメモリからディスクにオフロードします。

| クラスタータイプ | デフォルトの MMAP ポリシー | 効果 |
| --- | --- | --- |
| Dedicated (Performance-optimized) | 生ベクトルデータのみが mmap を使用し、スカラーデータとすべてのインデックスはメモリに保持されます | 低レイテンシを保証 |
| Dedicated (Capacity-optimized) | スカラーインデックス + すべての生データが mmap を使用し、ベクトルインデックスのみがメモリに保持されます | 容量を最大化 |
| Free / Serverless | すべてのフィールドとインデックスが mmap を使用します | システムキャッシュに依存 |

**最適化の推奨事項:**

- performance-optimized クラスターでは、スカラーフィルタリングがボトルネックでない場合、スカラーフィールドで mmap を有効にしてベクトルインデックス用のメモリを解放することを検討してください。

- capacity-optimized クラスターでは、デフォルトのポリシーがすでにストレージ優先であるため、通常は追加のチューニングは不要です。

<Admonition type="info" title="Note">

mmap 設定を変更する前にコレクションをリリースし、その後で再ロードする必要があります。誤った構成はパフォーマンスの低下や OOM エラーを引き起こす可能性があります — まずテスト環境で検証してください。

</Admonition>

## クエリの最適化\{#query-optimization}

効率的なクエリは、Serverless ユーザーの読み取りユニット（RU）コストを削減し、Dedicated CU の QPS を向上させます。

### スカラーフィールドのインデックス作成\{#index-scalar-fields}

多くのユーザーは、[BITMAP](./bitmap-index-type) などのインデックスタイプを使ったスカラーインデックスの作成を怠っています。これがないと、フィルター（例: `category == "electronics"` や `timestamp > 1700000000`）が **コレクション全体のスキャン** を引き起こし、極めて高コストになります。頻繁にフィルタリングされるスカラーフィールドにはインデックスを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

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
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "category", index.NewBitmapIndex()).WithIndexName("idx_category"))
if err != nil {
    log.Fatal("failed to create index: ", err.Error())
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "timestamp", index.NewBitmapIndex()).WithIndexName("idx_timestamp"))
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

**最適化の推奨事項:**

- `filter` 式に現れるすべてのスカラーフィールドにインデックスを構築します。Zilliz Cloud は適切なインデックスタイプを自動的に選択します（文字列には転置インデックス、数値にはソート済みインデックスなど）。

- スカラーインデックスのメモリオーバーヘッドは最小限ですが、フィルタリングパフォーマンスを桁違いに向上させ、テーブル全体のスキャンをインデックス検索に変えます。

- **重要:** 特に capacity-optimized クラスターでのフィルター付きベクトル検索では、スカラーインデックスの有無が、クエリレイテンシがミリ秒単位で測定されるか秒単位で測定されるかを直接左右します。

### 適切な TopK の選択\{#select-appropriate-topk}

[TopK](./single-vector-search) はコンピューティングとネットワークのオーバーヘッドに直接影響します。

| TopK | 相対レイテンシ | 相対 RU コスト（Serverless） | 一般的なユースケース |
| --- | --- | --- | --- |
| 1–10 | ベースライン | 1x | RAG（通常 3–5 個のコンテキストチャンク） |
| 10–50 | 1.2–1.5x | 1.5–2x | レコメンデーションシステム、検索結果ページ |
| 50–200 | 1.5–3x | 2–4x | 候補セットの生成、リランキングの入力 |
| 200–1000 | 3–10x | 4–10x | バッチ分析、クラスタリング |

- **RAG:** TopK 3–10 を使用します。コンテキストを増やしても LLM の品質が向上することはほとんどなく、トークンと RU を浪費します。

- **レコメンデーション:** リランキングモデルの上限（通常 20–50）を使用します。

- **大きな TopK:** 大量の結果セットを 1 回のリクエストで返す代わりに、[ページネーション](./single-vector-search#use-limit-and-offset)（`offset` + `limit`）または [イテレーター](./with-iterators) を使用します。

### 出力フィールドの絞り込み\{#refine-output-fields}

デフォルトでは、以下に示すように、検索はすべてのスカラーフィールドを返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Collections;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

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
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

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
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

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
#include <iostream>
#include <vector>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cerr << "Failed to connect: " << status.Message() << std::endl;
    return;
}

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
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

const results = await client.search({
    collection_name: "my_collection",
    data: query_vector,
    anns_field: "embedding",
    limit: 10,
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

ただし、すべてのクエリで大きなテキストフィールド（例: ドキュメントの全文）を返すと、レイテンシと RU コストが増加します。そのため、必要な出力フィールドのみを指定できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

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
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

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
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

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
#include <iostream>
#include <vector>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cerr << "Failed to connect: " << status.Message() << std::endl;
    return;
}

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
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

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

詳細は、[出力フィールドの使用方法](./single-vector-search#use-output-fields) を参照してください。

**最適化の推奨事項:**

- `output_fields` を常に明示的に指定し、ビジネスロジックで必要なフィールドのみを返します。

- RAG シナリオでは、原文が必要な場合、まずベクトル検索で ID を取得し、その ID を使って外部ストレージ（例: Redis、データベース）からソースコンテンツを取得することを検討してください。これによりベクトル検索を高速に保ちつつ、外部ストレージがキャッシュの恩恵を受けられます。

- Serverless モードでは、返されるデータ量が読み取り vCU の課金に直接影響します — 不要なフィールドを減らすことが最も簡単なコスト削減方法です。

### パーティションキーの活用\{#utilize-partition-keys}

[パーティションキー](./use-partition-key) は、スカラー値に基づいてデータをパーティションに自動的に分散し、検索が無関係なデータをスキップできるようにします。

次の例は、コレクションを作成するときにパーティションキーを指定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

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
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

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
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

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
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
schema->AddField(milvus::FieldSchema("tenant_id", milvus::DataType::VARCHAR).WithPartitionKey(true).WithMaxLength(128));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

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

**ユースケース:**

- **マルチテナント SaaS:** `tenant_id` をパーティションキーとして使用すると、各テナントのクエリが自分のデータパーティションのみをスキャンするようになり、QPS とレイテンシの両方が大幅に向上します。

- **カテゴリのフィルタリング:** `category` をパーティションキーとして使用すると、特定のカテゴリ内を検索するときにデータセット全体をスキャンする必要がなくなります。

**パフォーマンスの向上:** データが均等に分散した 100 のテナントを想定した場合、パーティションキーを使用するとクエリあたりのスキャン量が約 99% 削減されます。分散が不均等な場合でも、スキャン量は通常 50–90% 削減されます。

## エラスティックスケーリング\{#elastic-scaling}

Dedicated クラスターの最大のコストの罠は、「ピーク負荷に合わせてプロビジョニングし、24 時間稼働させる」ことです。Zilliz Cloud はこのパターンを打破する 3 つのスケーリング戦略を提供しています。

### オートスケーリング\{#auto-scaling}

最小と最大の CU 値を設定すると、システムがリアルタイムの負荷に基づいて自動的にスケーリングします。

- Query CU は CU Capacity メトリクス（データ量主導）に基づいて自動的にスケーリングします

- レプリカは CU Computation メトリクス（QPS 主導）に基づいて自動的にスケーリングします

**典型的なシナリオ:** 昼間のピーク時に 32 CU を必要とし、夜間は 8 CU しか必要としない e コマース検索サービス。オートスケーリング構成で min=8、max=32 を設定すると、オフピーク時間帯にはシステムが自動的に 8 CU までスケールダウンします。1 日あたり 10 時間のオフピーク時間を想定すると、月間のコンピューティングコストを約 30–40% 削減できます。

詳細は、[オートスケーリング](./auto-scaling) を参照してください。

### スケジュールスケーリング\{#scheduled-scaling}

トラフィックパターンが予測可能なワークロードに適しています。Basic モード（単純なセレクター）と Advanced モード（Unix cron 式）をサポートします。

**典型的な構成:**

- 平日の 9:00 に 32 CU までスケールアップし、22:00 に 8 CU までスケールダウン

- 週末は終日 8 CU を維持

- 月末のプロモーション期間に向けて事前にスケールアップ

詳細は、[スケジュールスケーリング](./scheduled-scaling) を参照してください。

### 手動スケーリング\{#manual-scaling}

最も単純なオプションを見落とさないでください — ワークロードが静かな期間（例: プロジェクト間やオフシーズン）に入ったら、CU 構成を積極的に減らしてください。多くのユーザーは PoC の後にスケールダウンを忘れ、数週間あるいは数か月分の不要な容量に支払い続けてしまいます。

詳細は、[手動スケーリング](./manual-scaling) を参照してください。

### スケーリングの制約\{#scaling-constraints}

- Query CU × Replica ≤ 10,240

- Replica > 1 の場合、クラスターを 12 CU 未満にスケールダウンできません

- スケールダウンする場合、データ量は新しい CU 容量の 80% 未満である必要があります

- 12 CU 未満では Query CU のみを調整でき、12 CU 超では Query CU とレプリカを独立して調整できます

**推奨:** 予測できないトラフィックには動的スケーリングを、規則的なトラフィックパターンにはスケジュールスケーリングを使用します。両者は組み合わせることができます。

## クレジットと割引をさらに取得する\{#get-more-credits-and-discounts}

技術的な最適化に加えて、Zilliz のプロモーションプログラムを最大限に活用することも同様に重要です。

### クレジット\{#credits}

| チャネル | クレジット | 有効期間 | 備考 |
| --- | --- | --- | --- |
| 新規ユーザー登録 | &#36;100 クレジット | 30 日間 | すぐに利用でき、クレジットカードは不要です |
| 支払い方法の追加 | — | 1 年間に延長 | 未使用のクレジットは、支払い方法を追加すると自動的に延長されます |
| Recycle Bin | 無料 | — | 削除されたデータは、Recycle Bin にある間は料金が発生しません |

**推奨:** 初回登録後できるだけ早く支払い方法を追加して、&#36;100 クレジットの有効期間を 30 日間から 1 年間に延長してください。技術評価に十分な時間を確保できます。

### Dedicated プログラム\{#dedicated-programs}

| プログラム | 対象 | 申請方法 |
| --- | --- | --- |
| Zilliz AI Startup Program | アーリーステージのスタートアップ | [公式サイト](https://zilliz.com/zilliz-for-startups) から申請して、追加のクレジットと技術サポートを受け取ります |
| AI Agent Program | AI Agent 開発者 | AI Agent アプリケーションを構築する開発者向けの専用クレジットです。近日公開予定です。 |

### エンタープライズ顧客\{#enterprise-customers}

- <strong>カスタム見積もりについては営業チームにお問い合わせください:</strong> エンタープライズ顧客は年間サブスクリプションを通じて割引を受けられます。具体的な料金については [営業チームにお問い合わせください](https://zilliz.com/contact-sales)。

- **クラウドマーケットプレイスのサブスクリプション:** [AWS](./subscribe-on-aws-marketplace)、[Google Cloud](./subscribe-on-gcp-marketplace)、[Azure](./subscribe-on-azure-marketplace) マーケットプレイスを通じてサブスクライブすると、Zilliz Cloud の料金をクラウドの請求に統合し、既存のエンタープライズ割引を適用できます。

- **前払い:** [前払い](./advance-pay) でアカウントに資金を入金します。控除の優先順位は、クレジット > 前払い > クラウドマーケットプレイスのサブスクリプション/credit カードです。予算管理の要件がある組織に適しています。

## 使用状況ページの監視\{#monitor-usage-page}

最適化は一度きりの取り組みではありません。Zilliz Cloud は多次元のコスト分析ツールを提供し、支出を継続的に追跡・最適化できるようにします。

### 可視化されたコスト分析\{#visualized-cost-analysis}

**Billing > Usage** ページでは、請求を 5 つの観点で分類して確認できます。

| **観点** | **目的** |
| --- | --- |
| プロジェクト | 異なるビジネスラインや部門間で使用状況を比較 |
| クラスター | 主なコスト要因となっているクラスターを特定 |
| 期間 | 日単位の傾向を確認し、異常な変動を検出 |
| コストタイプ | 請求カテゴリ別に料金を内訳表示 |
| クラウドリージョン | マルチリージョンデプロイでリージョン間のコストを比較 |

複数の観点はフィルターとして組み合わせることができます。たとえば、特定のプロジェクトの過去 7 日間の CU コストを選択すると、そのビジネスラインのコンピューティングコストの傾向を正確に把握できます。

詳細は、[コストの分析](./analyze-cost) を参照してください。

### RESTful API\{#restful-api}

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API は、小数点以下最大 8 桁の精度の使用状況データを提供し、社内の FinOps ワークフローにプログラムから統合できます。用途は次のとおりです。

- コストレポートを自動生成する

- 社内の予算管理システムと統合する

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

[cost metrics](./metrics-alerts-reference#organization-level-metrics) を監視し、アラートしきい値を構成して異常な支出を早期に検出することをお勧めします — 特に次のシナリオで有効です。

- 新しく起動したクラスターで、実際のコストが想定と一致することを確認する

- 動的スケーリングを構成した後、スケーリングが正しく機能していることを確認する

- 新しいチームメンバーが不要なリソースを作成した可能性がある場合

## コスト最適化チェックリスト\{#cost-optimization-checklist}

すぐに実行できるチェックリストです。

**選択フェーズ**

**インデックス構成**

**クエリの最適化**

**運用フェーズ**

**請求の最適化**

## まとめ\{#summary}

Zilliz Cloud のコスト最適化は、単一のパラメーターを調整することではなく、選択、構成、クエリ、運用、請求にまたがるシステム全体の取り組みです。最も効果の高い最適化は次のとおりです。

1. **まず capacity-optimized クラスターを選択する** — これは「ダウングレード」ではありません。コスト効率のために特別に設計された階層型ストレージアーキテクチャであり、単価は performance-optimized クラスターの 1/3 で、本番ユースケースの 90% 以上をカバーします。

1. **クエリパターンを最適化する** — スカラーフィールドにインデックスを作成し、TopK を制御し、返すフィールドを絞り、パーティションキーを使用します。これらはそれぞれクエリあたりのコストを大幅に削減します。

1. **エラスティックスケーリングを使用する** — アイドル状態のリソースへの支払いをやめ、30–40% を節約します。

1. **ビルドレベルをチューニングする** — 同じ CU に 40% 多くのデータを保存します。

うまく行えば、ほとんどのユーザーはビジネス要件を満たしながらコストを妥当な範囲に抑えることができ、Zilliz Cloud がストレージ階層化、インデックス最適化、エラスティックスケジューリングで提供する技術的優位性を享受できます。
