---
title: "コスト最適化 | Cloud"
slug: /cost-optimization
sidebar_label: "コスト最適化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データの規模とクエリ量が増加するにつれて、コスト管理が重要になります。このガイドでは、デプロイ方法の選択、インデックスのチューニング、柔軟なスケーリング、割引、請求分析という 5 つの側面から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。 | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コスト最適化

データの規模とクエリ量が増加するにつれて、コスト管理が重要になります。このガイドでは、デプロイ方法の選択、インデックスのチューニング、柔軟なスケーリング、割引、請求分析という 5 つの側面から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。

## 請求の内訳を確認する\{#understand-your-bill}

最適化を行う前に、コストがどこで発生しているかを特定します。Zilliz Cloud の料金は、次の 5 つの項目で構成されます。

| 項目 | 説明 | 最適化可能? |
| --- | --- | --- |
| [コンピューティング（CU）](./dedicated-cluster-cost) | コンピューティングユニットに基づく Dedicated クラスターの時間課金です。 | 選択 + スケーリング |
| [Read/Write 操作](./serverless-cluster-cost) | Serverless クラスターの従量課金です。 | クエリ最適化 |
| [ストレージ](./storage-cost) | データとバックアップのストレージです（クラスターの状態に関係なく請求されます）。 | ビルドレベル + データクリーンアップ |
| [データ転送](./data-transfer-cost) | イングレス、イグレス、リージョン間転送です。 | アーキテクチャ設計 |
| [監査ログ](./audit-log-cost) | 監査ログの記録に伴うリソース消費です。 | 必要に応じて有効化 |

ほとんどのユーザーでは、コストの 70% 以上が**コンピューティング**に起因しており、ここに最も大きな最適化の余地があります。

[料金計算ツール](https://zilliz.com/pricing#calculator)を使用すると、ベクトルの次元数、データ量、QPS 要件に基づいて月間の見積もりを取得できます。実際のコストは見積もりより低いことがよくあります。ビジネス負荷がピーク容量の状態で無期限に留まることはほとんどないためです。

## 適切なデプロイ方法を選択する\{#choose-the-right-deployment-method}

適切なデプロイ方法を選択することは、最も影響の大きい判断です。誤った方法を選択すると、小規模な最適化では埋め合わせられないコストが発生する可能性があります。

### デプロイ方法の概要\{#deployment-methods-at-a-glance}

| 種類 | 価格の目安（768 次元） | 容量/CU | 検索 QPS | レイテンシ | ユースケース |
| --- | --- | --- | --- | --- | --- |
| 無料 | 0 | 5 GB、コレクション 5 個以下 | — | — | 学習、プロトタイピング |
| Serverless | RU 従量課金 | 自動スケーリング | 自動 | 中 | 不安定なトラフィック、Dev/Test 環境 |
| Dedicated（パフォーマンス最適化） | &#126;&#36;65/M ベクトル/mo | 2M/CU | 500–1,500 | 低（&lt;10ms p99） | レイテンシが重要な本番環境 |
| Dedicated（容量最適化） | &#126;&#36;20/M ベクトル/mo | 8M/CU | 100–300 | 中 | 大規模でコストに敏感なワークロード |
| Dedicated（階層型ストレージ） | &#126;&#36;7/M vectors/mo | 40M/CU | 100–150（ホット） | 高め | 大規模データ、cold/hot 分離 |
| BYOC | カスタム | カスタム | カスタム | カスタム | コンプライアンス、クラウド割引 |

### 選択の判断ツリー\{#selection-decision-tree}

- **データが 100 万ベクトル未満、QPS が 50 未満?**<br/>
  → **Serverless** を使用します。操作に対してのみ料金を支払い、アイドル時のコストはゼロです。「潜在的な」トラフィックのために Dedicated リソースをプロビジョニングしないでください。

- **データが 100 万～5,000 万ベクトル、安定した低レイテンシが必要?**<br/>
  → **容量最適化**クラスターが最もコスト効率の高いソリューションです。パフォーマンス最適化オプションより 3 倍安く、100 ミリ秒未満のレイテンシを提供するため、ほとんどの RAG およびレコメンデーションシナリオに十分対応できます。極端な要件（例: &lt;10 ms p99 のリアルタイム検索）にのみ、**パフォーマンス最適化**クラスターを使用してください。

- **データが 5,000 万ベクトル超、アクセス頻度が低い?**<br/>
  → **階層型ストレージ**クラスターを使用します。容量最適化オプションより 3 倍安く、大規模データのうち一部のみが頻繁にクエリされるシナリオ（例: 過去ログの分析）に最適です。

- **コンプライアンスまたは既存のクラウド割引 (RI/SP) が必要?**<br/>
  → **BYOC（Bring Your Own Cloud）** です。クラスターは VPC 内で実行されるため、エンタープライズレベルのクラウド割引を活用し、データ主権の要件を満たすことができます。

### 推奨: 容量最適化はほとんどのシナリオに最適\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

容量最適化クラスターは、単なる「低速」バージョンと誤解されることがよくあります。実際には、Zilliz Cloud で最もアーキテクチャ的に洗練された製品です。

従来のベクトルデータベースは、コストと引き換えに速度を得るためにすべてのインデックスと生データをメモリに保持しますが、容量最適化クラスターは**階層型ストレージアーキテクチャ**を使用します。

- **階層型ストレージ:** ベクトルインデックスは速度のためにメモリに保持され、スカラーデータと生のベクトルはインテリジェントキャッシュを備えた mmap を介してディスクにマッピングされます。これにより、パフォーマンス最適化クラスターと比較して、CU あたり 3 倍のデータ密度を実現できます。

- **DiskANN レベルの最適化:** IVF インデックスはディスクに優しいアクセス向けに調整され、NVMe SSD でスループットを最大化しながら 10～50 ms のレイテンシを維持します。これはほとんどの AI アプリケーションにとって無視できる程度です。

- **高いリソース利用率:** パフォーマンス最適化クラスターは通常 30% の余裕を確保しますが、容量最適化クラスターは 90% 以上のデータ密度に達することができます。

**まとめ:** パフォーマンス最適化オプションはハードウェアで速度を買い、容量最適化オプションはテクノロジーで効率を買います。

### プロジェクトプラン: Standard、Enterprise、Business Critical の比較\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud は、機能とスケーリングの上限に影響する複数のプランを提供しています。

| 機能 | Standard | Enterprise | Business Critical |
| --- | --- | --- | --- |
| 最大 CU | 32 CU | 256 CU | 512 CU |
| レプリカの上限 | Query CU × Repl ≤ 32 | Query CU × Repl ≤ 256 | Query CU × Repl ≤ 512 |
| SLA | 0.999 | 0.9995 | 0.9999 |
| マルチ AZ | 単一 AZ | オプション | デフォルトで有効 |
| RBAC | 基本 | カスタムロール + 監査 | フル + SOC2/HIPAA |
| BYOC | サポート対象外 | サポート対象 | サポート対象 |
| サポート | チケット | SA + Slack | 24/7 + 15 分以内の応答 |

詳細は、[プランの詳細比較](./select-zilliz-cloud-service-plans)を参照してください。

**推奨:** まず **Standard** から開始します。より高い SLA、マルチ AZ、または大規模なスケールが必要な場合にのみ **Enterprise** にアップグレードしてください。アップグレードはシームレスで、データ移行は不要です。

### よくある落とし穴\{#common-pitfalls}

1. **パフォーマンス最適化クラスターをデフォルトにする:** 多くのユーザーは、PoC で使用したパフォーマンス最適化クラスターに基づいて予算を立てます。しかし、容量最適化は「ダウングレード」バージョンではなく、コスト効率のために特別に設計されたアーキテクチャです。パフォーマンス最適化クラスターのわずか 1/3 のコストで、ほとんどのシナリオに十分な QPS を提供します。

1. **階層型ストレージオプションを見落とす:** パフォーマンス最適化クラスターの 1/9 のコストで、階層型ストレージクラスターは hot/cold のアクセスパターンが明確なデータに最適です。データのごく一部のみが低レイテンシを必要とする場合、階層型ストレージオプションはコストを 1 桁削減できます。

1. **小規模なワークロードに Dedicated を使用する:** 小規模なデータセットや不安定なトラフィックには、Serverless（従量課金）の方が Dedicated よりはるかにコスト効率が高くなります。「エンタープライズ」らしさのためだけにリソースを過剰にプロビジョニングすることは避けてください。

## インデックスとストレージの最適化\{#index-and-storage-optimization}

モードを選択したら、各 CU の有用性を最大化するようにパラメーターを調整します。

### インデックスのビルドレベル: 容量と再現率の比較\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ パラメーター ](./tune-index-build-level)は、インデックスの精度とストレージ密度を制御します。これを下げると、極端な再現率を必要としないシナリオで、各 CU のストレージ容量を大幅に増やすことができます。

- **パフォーマンス最適化クラスター（768 次元、CU あたり）:**

    | ビルドレベル | 容量 | 増加率 | 再現率 | QPS |
    | --- | --- | --- | --- | --- |
    | 容量優先（0） | 2.1M | 0.4 | 90～95% | &#126;2,850 |
    | バランス（1）デフォルト | 1.5M | ベースライン | 91～97% | &#126;3,500 |
    | 精度優先（2） | 1.0M | -0.33 | 92～98% | &#126;3,000 |

- **容量最適化クラスター（768 次元、CU あたり）:**

    | ビルドレベル | 容量 | 増加率 | 再現率 | QPS |
    | --- | --- | --- | --- | --- |
    | 容量優先（0） | 7M | 0.4 | 89～97% | &#126;300 |
    | バランス（1）デフォルト | 5M | ベースライン | 93～98% | &#126;350 |
    | 精度優先（2） | 3M | -0.4 | 94～98% | &#126;345 |

**事例:** 16 CU の容量最適化クラスターは、デフォルトで 8,000 万ベクトルを保持できます。`Capacity-first` に切り替えると、これが 1 億 1,200 万ベクトルに増えるか、同じ 8,000 万ベクトルを 12 CU に収めることができ、**CU コストを 25% 節約できます**。

<Admonition type="info" title="Note">

`build_level` パラメーターは、一度設定すると変更できません。変更するには、インデックスを削除して再作成する必要があります。コレクションを作成する前に要件を評価することをお勧めします。このパラメーターは、浮動小数点ベクトル型（FLOAT_VECTOR、FLOAT16_VECTOR、BFLOAT16_VECTOR）のみをサポートします。

</Admonition>

### 検索レベル: パフォーマンスとコストの比較\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ パラメーター ](./tune-recall-rate)（1～10）は、検索の精度を制御します。

- **レベル 1～3:** ほとんどのシナリオに最適です（再現率 90～95%）。

- <strong>レベル 4～7:</strong> 高精度のシナリオ向けです。レイテンシが約 2～3 倍になる代わりに、再現率 95～98% を実現します。

- **レベル 8～10:** 重要なシナリオ（例: 医療、不正検出）向けの極めて高い精度ですが、レイテンシとコンピューティングコストが大幅に増加します。

**推奨:** `enable_recall_calculation=true` を使用して再現率を測定し、ビジネス要件を満たす最も低いレベルを見つけてください。レベルを 1 つ上げるごとに検索で消費するコンピューティングリソースが増加します。Serverless クラスターでは、これがそのまま読み取り vCU コストの増加につながり、Dedicated クラスターでは、同じ CU 割り当てでサポートできる QPS が低下することを意味します。

### Mmap 設定: メモリとディスクのバランス\{#mmap-configuration-balancing-memory-and-disk}

[メモリマッピング（mmap）](./use-mmap)は、データをメモリからディスクにオフロードします。

| クラスターの種類 | デフォルトの MMAP ポリシー | 効果 |
| --- | --- | --- |
| Dedicated（パフォーマンス最適化） | 生のベクトルデータのみが mmap を使用し、スカラーデータとすべてのインデックスはメモリに残ります | 低レイテンシを保証します |
| Dedicated（容量最適化） | スカラーインデックスとすべての生データが mmap を使用し、ベクトルインデックスのみがメモリに残ります | 容量を最大化します |
| 無料 / Serverless | すべてのフィールドとインデックスが mmap を使用します | システムキャッシュに依存します |

**最適化の推奨事項:**

- パフォーマンス最適化クラスターでは、スカラーフィルタリングがボトルネックでない場合、スカラーフィールドで mmap を有効にして、ベクトルインデックス用のメモリを解放することを検討してください。

- 容量最適化クラスターでは、デフォルトのポリシーがすでにストレージ優先であるため、通常、追加のチューニングは不要です。

<Admonition type="info" title="Note">

mmap 設定を変更する前にコレクションを解放し、変更後に再ロードする必要があります。設定を誤ると、パフォーマンスの低下や OOM エラーが発生する可能性があります。まずテスト環境で検証してください。

</Admonition>

## クエリの最適化\{#query-optimization}

効率的なクエリは、Serverless ユーザーの読み取りユニット（RU）コストを削減し、Dedicated CU の QPS を向上させます。

### スカラーフィールドにインデックスを作成する\{#index-scalar-fields}

多くのユーザーは、[BITMAP](./bitmap-index-type) などのインデックスタイプを使用したスカラーインデックスを怠っています。これがないと、フィルター（例: `category == "electronics"` や `timestamp > 1700000000`）が**コレクション全体のスキャン**を引き起こし、非常に高コストになります。頻繁にフィルタリングされるスカラーフィールドにはインデックスを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

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

**最適化の推奨事項:**

- `filter` 式に含まれるすべてのスカラーフィールドにインデックスを作成します。Zilliz Cloud は、適切なインデックスタイプ（文字列には転置インデックス、数値にはソート済みインデックスなど）を自動的に選択します。

- スカラーインデックスのメモリオーバーヘッドは最小限ですが、フィルタリングのパフォーマンスを桁違いに向上させ、テーブル全体のスキャンをインデックスルックアップに変えます。

- **重要:** 特に容量最適化クラスターでのフィルター付きベクトル検索では、スカラーインデックスの有無がクエリのレイテンシをミリ秒単位にするか秒単位にするかを直接左右します。

### 適切な TopK を選択する\{#select-appropriate-topk}

[TopK](./single-vector-search)は、コンピューティングとネットワークのオーバーヘッドに直接影響します。

| TopK | 相対レイテンシ | 相対 RU コスト（Serverless） | 一般的なユースケース |
| --- | --- | --- | --- |
| 1～10 | ベースライン | 1 倍 | RAG（通常 3～5 個のコンテキストチャンク） |
| 10～50 | 1.2～1.5 倍 | 1.5～2 倍 | レコメンデーションシステム、検索結果ページ |
| 50～200 | 1.5～3 倍 | 2～4 倍 | 候補セットの生成、再ランキングの入力 |
| 200～1000 | 3～10 倍 | 4～10 倍 | バッチ分析、クラスタリング |

- **RAG:** TopK 3～10 を使用します。コンテキストを増やしても LLM の品質が向上することはほとんどなく、トークンと RU を浪費します。

- **レコメンデーション:** 再ランキングモデルの上限（通常 20～50）を使用します。

- **大きな TopK:** 1 回のリクエストで大量の結果セットを返す代わりに、[ページネーション](./single-vector-search#use-limit-and-offset)（`offset` + `limit`）または[イテレーター](./with-iterators)を使用します。

### 出力フィールドを絞り込む\{#refine-output-fields}

デフォルトでは、以下に示すように、検索はすべてのスカラーフィールドを返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

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

ただし、大きなテキストフィールド（例: ドキュメントの全内容）を毎回のクエリで返すと、レイテンシと RU コストが増加します。そのため、必要な出力フィールドのみを指定できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

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

詳細は、[出力フィールドの使用](./single-vector-search#use-output-fields)を参照してください。

**最適化の推奨事項:**

- 常に `output_fields` を明示的に指定し、ビジネスロジックで必要なフィールドのみを返します。

- RAG シナリオで原文が必要な場合は、まずベクトル検索で ID を取得し、その後 ID を使用して外部ストレージ（例: Redis、データベース）からソースコンテンツを取得することを検討してください。これにより、ベクトル検索を高速に保ちながら、外部ストレージでキャッシュを活用できます。

- Serverless モードでは、返されるデータ量が読み取り vCU の請求に直接影響します。不要なフィールドを減らすことが、コストを削減する最も簡単な方法です。

### パーティションキーを活用する\{#utilize-partition-keys}

[パーティションキー](./use-partition-key)は、スカラー値に基づいてデータを自動的にパーティションに分散し、検索で無関係なデータをスキップできるようにします。

次の例は、コレクションを作成するときにパーティションキーを指定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

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

**ユースケース:**

- **マルチテナント SaaS:** `tenant_id` をパーティションキーとして使用すると、各テナントのクエリがそのテナント自身のデータパーティションのみをスキャンするようになり、QPS とレイテンシの両方が大幅に改善されます。

- **カテゴリフィルタリング:** `category` をパーティションキーとして使用すると、特定のカテゴリ内を検索するときにデータセット全体をスキャンする必要がなくなります。

**パフォーマンスの向上:** データが均等に分散された 100 テナントを想定した場合、パーティションキーを使用すると、クエリごとのスキャン量が約 99% 削減されます。分布が不均等な場合でも、スキャン量は通常 50～90% 削減されます。

## 柔軟なスケーリング\{#elastic-scaling}

Dedicated クラスターの最大のコストの罠は、「ピーク負荷に合わせてプロビジョニングし、24 時間稼働させる」ことです。Zilliz Cloud は、このパターンを打破する 3 つのスケーリング戦略を提供しています。

### オートスケーリング\{#auto-scaling}

CU の最小値と最大値を設定すると、システムはリアルタイムの負荷に基づいて自動的にスケーリングします。

- Query CU は、CU Capacity メトリクスに基づいて自動的にスケーリングします（データ量に基づく）

- レプリカは、CU Computation メトリクスに基づいて自動的にスケーリングします（QPS に基づく）

**一般的なシナリオ:** 日中ピーク時に 32 CU、夜間は 8 CU のみを必要とする e コマース検索サービスです。オートスケーリング設定で min=8、max=32 を設定すると、システムはオフピーク時間帯に自動的に 8 CU までスケールダウンします。1 日 10 時間のオフピーク時間を想定すると、月間のコンピューティングコストを約 30～40% 削減できます。

詳細は、[オートスケーリング](./auto-scaling)を参照してください。

### スケジュールされたスケーリング\{#scheduled-scaling}

トラフィックパターンが予測可能なワークロードに適しています。Basic モード（単純なセレクター）と Advanced モード（Unix cron 式）をサポートします。

**一般的な設定:**

- 平日の 9:00 に 32 CU までスケールアップし、22:00 に 8 CU までスケールダウンする

- 週末は終日 8 CU を維持する

- 月末のプロモーション期間に備えて事前にスケールする

詳細は、[スケジュールされたスケーリング](./scheduled-scaling)を参照してください。

### 手動スケーリング\{#manual-scaling}

最も単純なオプションを見落とさないでください。ワークロードが閑散期（例: プロジェクトの合間やオフシーズン）に入ったら、CU 構成を積極的に減らします。多くのユーザーは PoC 後にスケールダウンするのを忘れ、数週間から数か月分の不要な容量に対して支払いを続けてしまいます。

詳細は、[手動スケーリング](./manual-scaling)を参照してください。

### スケーリングの制約\{#scaling-constraints}

- Query CU × レプリカ ≤ 10,240

- レプリカが 1 より大きい場合、クラスターを 12 CU 未満にスケールダウンできません

- スケールダウンするとき、データ量は新しい CU 容量の 80% 未満である必要があります

- 12 CU 未満では Query CU のみを調整でき、12 CU 超では Query CU とレプリカを個別に調整できます

**推奨:** 予測できないトラフィックには動的スケーリングを使用し、規則的なトラフィックパターンにはスケジュールされたスケーリングを使用します。この 2 つは組み合わせることができます。

## クレジットと割引をさらに取得する\{#get-more-credits-and-discounts}

技術的な最適化に加えて、Zilliz のプロモーションプログラムを最大限に活用することも同様に重要です。

### クレジット\{#credits}

| チャネル | クレジット | 有効期間 | 注記 |
| --- | --- | --- | --- |
| 新規ユーザー登録 | &#36;100 クレジット | 30 日間 | すぐに使用可能で、クレジットカードは不要です |
| 支払い方法の追加 | — | 1 年間に延長 | 支払い方法を追加すると、未使用のクレジットは自動的に延長されます |
| ごみ箱 | 無料 | — | 削除されたデータはごみ箱にある間、料金が発生しません |

**推奨:** 初回登録後できるだけ早く支払い方法を追加して、&#36;100 クレジットの有効期間を 30 日間から 1 年間に延長してください。これにより、技術評価に十分な時間を確保できます。

### Dedicated プログラム\{#dedicated-programs}

| プログラム | 対象者 | 申請方法 |
| --- | --- | --- |
| Zilliz AI Startup Program | 初期段階のスタートアップ | [公式ウェブサイト](https://zilliz.com/zilliz-for-startups)から申請して、追加のクレジットとテクニカルサポートを受け取ります |
| AI Agent Program | AI Agent 開発者 | AI Agent アプリケーションを構築する開発者向けの専用クレジットです。近日公開予定です。 |

### エンタープライズのお客様\{#enterprise-customers}

- <strong>カスタム見積もりについて営業に問い合わせる:</strong> エンタープライズのお客様は年間サブスクリプションを通じて割引を受けられます。具体的な価格については、[営業にお問い合わせ](https://zilliz.com/contact-sales)ください。

- **クラウドマーケットプレイスのサブスクリプション:** [AWS](./subscribe-on-aws-marketplace)、[Google Cloud](./subscribe-on-gcp-marketplace)、[Azure](./subscribe-on-azure-marketplace) Marketplace を通じてサブスクライブすると、Zilliz Cloud の料金をクラウドの請求書にまとめ、既存のエンタープライズ割引を適用できます。

- **前払い:** [前払い](./advance-pay)を通じてアカウントに資金を入金します。控除の優先順位は、クレジット > 前払い > クラウドマーケットプレイスのサブスクリプション/credit card です。予算管理の要件がある組織に適しています。

## 使用状況ページを監視する\{#monitor-usage-page}

最適化は 1 回限りの取り組みではありません。Zilliz Cloud は、多次元のコスト分析ツールを提供し、支出を継続的に追跡および最適化できるようにします。

### 可視化されたコスト分析\{#visualized-cost-analysis}

**Billing > Usage** ページでは、次の 5 つの側面から請求を分類できます。

| **ディメンション** | **目的** |
| --- | --- |
| プロジェクト | 異なる事業部門や部門間の使用状況を比較します |
| クラスター | どのクラスターが主なコスト要因かを特定します |
| 期間 | 日単位の傾向を表示し、異常な変動を検出します |
| コストタイプ | 請求カテゴリ別に料金を分類します |
| クラウドリージョン | マルチリージョンデプロイのリージョン間でコストを比較します |

複数のディメンションをフィルターとして組み合わせることができます。たとえば、特定のプロジェクトの過去 7 日間の CU コストを選択すると、その事業部門のコンピューティングコストの傾向を正確に把握できます。

詳細は、[コストの分析](./analyze-cost)を参照してください。

### RESTful API\{#restful-api}

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API は、最大 8 桁の小数精度で使用状況データを提供し、内部の FinOps ワークフローにプログラムで統合して、次のことを行えます。

- コストレポートを自動生成する

- 内部の予算管理システムと統合する

- カスタムアラートルールを設定する

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

[コストメトリクス](./metrics-alerts-reference#organization-level-metrics)を監視し、アラートしきい値を設定して異常な支出を早期に検出することをお勧めします。特に次のシナリオでは重要です。

- 新しく起動したクラスターで、実際のコストが想定と一致することを確認する場合

- 動的スケーリングを設定した後、スケーリングが正しく機能していることを確認する場合

- 新しいチームメンバーが不要なリソースを作成した可能性がある場合

## コスト最適化チェックリスト\{#cost-optimization-checklist}

直接実行できるチェックリストです。

**選択フェーズ**

**インデックス構成**

**クエリ最適化**

**運用フェーズ**

**請求の最適化**

## まとめ\{#summary}

Zilliz Cloud のコスト最適化は、単一のパラメーターをチューニングすることではなく、選択、構成、クエリ、運用、請求にまたがるシステム全体の取り組みです。最も効果の高い最適化は次のとおりです。

1. **容量最適化クラスターを最初に選択する** — これは「ダウングレード」ではありません。コスト効率のために特別に設計された階層型ストレージアーキテクチャであり、単価はパフォーマンス最適化クラスターの 1/3 で、本番ユースケースの 90% 以上をカバーします。

1. **クエリパターンを最適化する** — スカラーフィールドにインデックスを作成し、TopK を制御し、返されるフィールドを絞り込み、パーティションキーを使用します。これらはそれぞれ、クエリごとのコストを有意義に削減します。

1. **柔軟なスケーリングを使用する** — アイドルリソースへの支払いを止め、30～40% を節約します。

1. **ビルドレベルをチューニングする** — 同じ CU で 40% 多くのデータを保存します。

適切に実施すれば、ほとんどのユーザーはビジネス要件を満たしながらコストを妥当な範囲に収め、ストレージの階層化、インデックス最適化、柔軟なスケジューリングにおいて Zilliz Cloud が提供する技術的利点を享受できます。
