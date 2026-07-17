---
title: "コスト最適化 | Cloud"
slug: /cost-optimization
sidebar_label: "コスト最適化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ規模の拡大とクエリ量の増加に伴い、コスト管理は重要になります。このガイドでは、デプロイメント選択、インデックス調整、弾力的スケーリング、割引、請求分析という5つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に解説します。 | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コスト最適化

データ規模が拡大し、クエリ量が増加するにつれて、コスト管理は極めて重要になります。このガイドでは、デプロイメント選択、インデックス調整、弾力的スケーリング、割引、請求分析という5つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に解説します。

## 請求内容を理解する\{#understand-your-bill}

最適化を始める前に、コストの発生源を特定しましょう。Zilliz Cloud の料金は5つの要素で構成されます。

| 項目 | 説明 | 最適化可能か |
| --- | --- | --- |
| [Compute (CU)](./dedicated-cluster-cost) | Dedicated cluster に対する Compute Units ベースの時間単位課金。 | 選択 + スケーリング |
| [Read/Write Operations](./serverless-cluster-cost) | Serverless cluster に対する従量課金。 | クエリ最適化 |
| [Storage](./storage-cost) | データおよびバックアップの保存容量（cluster の状態に関係なく課金）。 | Build Level + データクリーンアップ |
| [Data Transfer](./data-transfer-cost) | Ingress、egress、およびクロスリージョン転送。 | アーキテクチャ設計 |
| [Audit Logs](./audit-log-cost) | 監査ログ記録のためのリソース消費。 | 必要時のみ有効化 |

ほとんどのユーザーにとって、コストの 70% 以上は **Compute** が占めており、最も大きな最適化余地もここにあります。

[料金計算ツール](https://zilliz.com/pricing#calculator)を使用すると、vector 次元数、データ量、QPS 要件に基づいて月額見積もりを取得できます。実際のコストは見積もりより低くなることが多く、これは業務負荷が常にピーク状態にあるわけではないためです。

## 適切なデプロイメント方式を選ぶ\{#choose-the-right-deployment-method}

適切なデプロイメント方式の選択は、最も影響の大きい意思決定です。誤った方式を選ぶと、小さな最適化では埋められないほどのコスト差が生じる可能性があります。

### デプロイメント方式の概要\{#deployment-methods-at-a-glance}

| Type | 価格目安 (768-dim) | 容量/CU | 検索 QPS | レイテンシ | ユースケース |
| --- | --- | --- | --- | --- | --- |
| Free | 0 | 5 GB, ≤5 colls | — | — | 学習、プロトタイピング |
| Serverless | Pay-per-RU | Auto-scaling | Auto | 中 | トラフィックが不安定、Dev/Test |
| Dedicated (Performance-optimized) | &#126;&#36;65/M vectors/mo | 2M/CU | 500–1,500 | 低 (&lt;10ms p99) | レイテンシ重視の本番環境 |
| Dedicated (Capacity-optimized) | &#126;&#36;20/M vectors/mo | 8M/CU | 100–300 | 中 | 大規模、コスト重視 |
| Dedicated (Tiered-storage) | &#126;&#36;7/M vectors/mo | 40M/CU (≥8 CU) | 100–150 (Hot) | 高め | 大量データ、コールド/ホット分離 |
| BYOC | Custom | Custom | Custom | Custom | コンプライアンス、Cloud 割引活用 |

### 選択の判断ツリー\{#selection-decision-tree}

- **データ < 1M vectors、QPS < 50?**  
→ **Serverless** を使用します。アイドルコストゼロで、操作分だけ支払います。「将来の可能性がある」トラフィックのために Dedicated リソースを事前確保しないでください。

- **データ 1M–50M vectors、安定した低レイテンシが必要?**  
→ **Capacity-optimized** cluster が最も費用対効果の高い選択です。Performance-optimized より 3 倍安価で、100 ミリ秒未満のレイテンシを提供します。これは大半の RAG やレコメンドのシナリオで十分です。**Performance-optimized** cluster は、極端な要件（例: &lt;10 ms p99 のリアルタイム検索）がある場合にのみ使用してください。

- **データ > 50M vectors、アクセス頻度が低い?**  
→ **Tiered-storage** cluster を使用します。Capacity-optimized より 3 倍安価で、大規模データのうち一部のみが頻繁にクエリされるシナリオ（例: 過去ログ分析）に最適です。

- **コンプライアンス要件または既存の Cloud Discounts (RI/SP) がある?**  
→ **BYOC (Bring Your Own Cloud)**。cluster は VPC 内で稼働するため、エンタープライズ向けのクラウド割引を活用でき、データ主権要件にも対応できます。

### 推奨: capacity-optimized—ほとんどのシナリオに最適\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

Capacity-optimized cluster は、単なる「遅い版」だと誤解されがちです。実際には、Zilliz Cloud で最もアーキテクチャ的に洗練された製品です。

従来の vector database がすべての index と生データをメモリ内に保持し、コストを犠牲にして速度を得るのに対し、capacity-optimized cluster は **階層型ストレージアーキテクチャ** を採用しています。

- **Layered Storage:** vector index は速度のためにメモリに保持し、scalar データと raw vector は mmap によってディスクへマッピングしつつ、インテリジェントキャッシュを利用します。これにより、performance-optimized clusters と比べて CU あたり 3 倍のデータ密度を実現できます。

- **DiskANN-level Optimization:** IVF index はディスクフレンドリーなアクセス向けに調整されており、NVMe SSD でスループットを最大化しつつ、10–50ms のレイテンシを維持します。これはほとんどの AI アプリケーションでは無視できる差です。

- **High Resource Utilization:** performance-optimized clusters はしばしば 30% の余裕領域を確保しますが、capacity-optimized clusters は 90% 以上のデータ密度に達することができます。

**要約:** performance-optimized はハードウェアで速度を買う方式であり、capacity-optimized は技術で効率を買う方式です。

### Project plans: Standard vs. Enterprise vs. Business Critical\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud には、機能とスケーリング上限に影響する複数のプランがあります。

| 機能 | Standard | Enterprise | Business Critical |
| --- | --- | --- | --- |
| Max CU | 32 CU | 256 CU | 512 CU |
| Replica Limit | Query CU × Repl ≤ 32 | Query CU × Repl ≤ 256 | Query CU × Repl ≤ 512 |
| SLA | 0.999 | 0.9995 | 0.9999 |
| Multi-AZ | Single AZ | Optional | Enabled by Default |
| RBAC | Basic | Custom Roles + Audit | Full + SOC2/HIPAA |
| BYOC | Not Supported | Supported | Supported |
| Support | Ticket | SA + Slack | 24/7 + 15m Response |

詳細については、[Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

**アドバイス:** まずは **Standard** から始めてください。より高い SLA、Multi-AZ、または大規模運用が必要になったときにのみ **Enterprise** へアップグレードしましょう。アップグレードはシームレスで、データ移行は不要です。

### よくある落とし穴\{#common-pitfalls}

1. **Performance-optimized cluster をデフォルトで選ぶこと:** 多くのユーザーは、PoC で使用した performance-optimized cluster を基準に予算を見積もります。しかし、capacity-optimized は「性能を落とした版」ではなく、コスト効率のために設計された専用アーキテクチャです。ほとんどのシナリオで十分な QPS を提供しつつ、performance-optimized cluster の 1/3 のコストで済みます。

1. **Tiered-storage オプションを見落とすこと:** performance-optimized cluster の 1/9 のコストで、tiered-storage cluster は明確なホット/コールドアクセスパターンを持つデータに最適です。データのごく一部だけが低レイテンシを必要とする場合、tiered-storage はコストを桁違いに削減できます。

1. **小規模データで Dedicated を使うこと:** 小規模データセットや不安定なトラフィックでは、Serverless（従量課金）の方が Dedicated よりはるかに費用対効果に優れています。「エンタープライズらしさ」のためだけにリソースを過剰にプロビジョニングするのは避けてください。

## インデックスとストレージの最適化\{#index-and-storage-optimization}

方式を選択したら、各 CU の有効活用を最大化するためにパラメータを調整します。

### Index build level: 容量 vs. recall\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ parameter ](./tune-index-build-level)は、index の精度とストレージ密度を制御します。極端な recall を必要としないシナリオでは、これを下げることで各 CU の保存可能容量を大幅に増やせます。

- **Performance-optimized cluster (768-dim, per CU):**

    | Build Level | 容量 | 増減 | Recall | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 2.1M | 0.4 | 90–95% | &#126;2,850 |
    | Balanced (1) Default | 1.5M | Baseline | 91–97% | &#126;3,500 |
    | Precision-first (2) | 1.0M | -0.33 | 92–98% | &#126;3,000 |

- **Capacity-optimized cluster (768-dim, per CU):**

    | Build Level | 容量 | 増減 | Recall | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 7M | 0.4 | 89–97% | &#126;300 |
    | Balanced (1) Default | 5M | Baseline | 93–98% | &#126;350 |
    | Precision-first (2) | 3M | -0.4 | 94–98% | &#126;345 |

**ケーススタディ:** 16 CU の capacity-optimized cluster は、デフォルトで 80M vectors を保持できます。`Capacity-first` に切り替えると 112M まで増加し、または同じ 80M vectors を 12 CU に収めることができるため、**CU コストを 25% 削減**できます。

<Admonition type="info" icon="📘" title="**注**">

`build_level` parameter は、一度設定すると変更できません。変更するには index を削除して再作成する必要があります。collection を作成する前に要件を評価することを推奨します。この parameter は浮動小数点 vector 型（FLOAT_VECTOR、FLOAT16_VECTOR、BFLOAT16_VECTOR）のみをサポートします。

</Admonition>

### Search level: パフォーマンス vs. コスト\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ parameter](./tune-recall-rate) (1–10) は検索精度を制御します。 

- **Level 1–3:** ほとんどのシナリオに最適（90–95% recall）。

- **Level 4–7:** 高精度シナリオ向け。95–98% recall と引き換えに、おおよそ 2–3 倍のレイテンシになります。

- **Level 8–10:** 医療や不正検知などの高リスクシナリオ向けの極限精度ですが、レイテンシと計算コストが大幅に増加します。

**アドバイス:** `enable_recall_calculation=true` を使って recall を測定し、ビジネス要件を満たす最も低い level を見つけてください。level を 1 段階上げるごとに、検索で消費される計算リソースは増加します。Serverless cluster ではこれは Read vCU コストの増加に直結し、Dedicated cluster では同じ CU 割り当てで支えられる QPS が低下することを意味します。

### Mmap 設定: メモリとディスクのバランス\{#mmap-configuration-balancing-memory-and-disk}

[Memory Mapping (mmap)](./use-mmap) は、データをメモリからディスクへオフロードします。

| Cluster Type | デフォルトの MMAP ポリシー | 効果 |
| --- | --- | --- |
| Dedicated (Performance-optimized) | mmap を使用するのは raw vector データのみ。scalar データとすべての index はメモリに保持 | 低レイテンシを保証 |
| Dedicated (Capacity-optimized) | scalar index + すべての raw データが mmap を使用。vector index のみメモリに保持 | 容量を最大化 |
| Free / Serverless | すべてのフィールドと index が mmap を使用 | システムキャッシュに依存 |

**最適化の推奨事項:**

- Performance-optimized clusters では、scalar filtering がボトルネックでない場合、scalar fields に mmap を有効化して、vector index 用のメモリを確保することを検討してください。

- Capacity-optimized clusters では、デフォルトポリシーがすでにストレージ優先のため、通常は追加調整は不要です。

<Admonition type="info" icon="📘" title="**注**">

mmap 設定を変更する前に Collection を release し、その後に再度 load する必要があります。設定を誤るとパフォーマンス低下や OOM エラーの原因になる可能性があるため、まずはテスト環境で検証してください。

</Admonition>

## クエリ最適化\{#query-optimization}

効率的なクエリは、Serverless ユーザーの Read Unit (RU) コストを削減し、Dedicated CUs の QPS を向上させます。

### scalar fields に index を作成する\{#index-scalar-fields}

多くのユーザーは、[BITMAP](./bitmap-index-type) のような index types を使った scalar indexing を見落としています。これがないと、フィルタ（例: `category == "electronics"` または `timestamp > 1700000000`）は **collection 全体のスキャン** を引き起こし、非常に高コストになります。頻繁にフィルタされる scalar fields に対して index を作成できます。

```python
collection.create_index(
    field_name="category",
    index_name="idx_category"
)
collection.create_index(
    field_name="timestamp",
    index_name="idx_timestamp"
)
```

**最適化の推奨事項:**

- `filter` 式に現れるすべての scalar fields に index を構築してください。Zilliz Cloud は適切な index type（文字列には inverted index、数値には sorted index など）を自動選択します。

- Scalar index のメモリオーバーヘッドは最小限ですが、フィルタ性能を桁違いに向上させます。つまり、フルテーブルスキャンを index lookup に変えられます。

- **重要:** 特に capacity-optimized clusters におけるフィルタ付き vector 検索では、scalar index の有無が、クエリレイテンシがミリ秒単位になるか秒単位になるかを直接左右します。

### 適切な TopK を選ぶ\{#select-appropriate-topk}

[TopK](./single-vector-search) は計算およびネットワークのオーバーヘッドに直接影響します。 

| TopK | 相対レイテンシ | 相対 RU コスト (Serverless) | 一般的なユースケース |
| --- | --- | --- | --- |
| 1–10 | Baseline | 1x | RAG（通常 3–5 context chunks） |
| 10–50 | 1.2–1.5x | 1.5–2x | レコメンドシステム、検索結果ページ |
| 50–200 | 1.5–3x | 2–4x | 候補集合生成、reranking 入力 |
| 200–1000 | 3–10x | 4–10x | バッチ分析、クラスタリング |

- **RAG:** TopK は 3–10 を使ってください。より多くのコンテキストは LLM の品質改善につながることが少なく、token と RU を無駄にします。

- **Recommendations:** reranking model の上限（通常 20–50）を使用してください。

- **大きな TopK:** 巨大な結果セットを 1 回のリクエストで返すのではなく、[pagination](./single-vector-search#use-limit-and-offset)（`offset` + `limit`）または [iterators](./with-iterators) を使用してください。

### output fields を絞り込む\{#refine-output-fields}

デフォルトでは、検索は以下のようにすべての scalar fields を返します。

```python
results = collection.search(vectors, "embedding", search_params, limit=10)
```

しかし、毎回のクエリで大きなテキストフィールド（例: ドキュメント全文）を返すと、レイテンシと RU コストが増加します。そのため、必要な output fields のみを指定できます。

```python
results = collection.search(
    vectors, "embedding", search_params, limit=10,
    output_fields=["id", "title", "category"]  # 不要返回 "content" 等大字段
)
```

詳細については、[Use Output Fields](./single-vector-search#use-output-fields) を参照してください。

**最適化の推奨事項:**

- 常に `output_fields` を明示的に指定し、業務ロジックに必要な fields のみを返すようにしてください。

- RAG シナリオで元のテキストが必要な場合は、まず vector search で ID を取得し、その後 ID を使って外部ストレージ（例: Redis、database）から元コンテンツを取得する方法を検討してください。これにより vector search を高速に保ちつつ、外部ストレージ側でキャッシュの恩恵を受けられます。

- Serverless モードでは、返されるデータ量が Read vCU 課金に直接影響します。不要な fields を減らすことが、最も簡単なコスト削減方法です。

### partition keys を活用する\{#utilize-partition-keys}

[Partition keys](./use-partition-key) は、scalar 値に基づいてデータを partitions に自動分散し、検索時に無関係なデータをスキップできるようにします。

以下の例は、collection 作成時に partition key を指定する方法を示しています。

```python
schema.add_field("tenant_id", DataType.VARCHAR, max_length=128, is_partition_key=True)
```

**ユースケース:**

- **マルチテナント SaaS:** `tenant_id` を partition key として使用することで、各テナントのクエリは自分自身のデータ partition のみをスキャンし、QPS とレイテンシの両方を大幅に改善できます。

- **カテゴリフィルタリング:** `category` を partition key として使用すると、特定カテゴリ内を検索する際に、データセット全体をスキャンする必要がなくなります。

**性能向上:** 100 テナントにデータが均等分散されていると仮定すると、partition key を使うことで 1 クエリあたりのスキャン量を約 99% 削減できます。分布が不均一でも、通常は 50–90% の削減が見込めます。

## 弾力的スケーリング\{#elastic-scaling}

Dedicated clusters における最大のコストの落とし穴は、「ピーク負荷に合わせてプロビジョニングし、それを 24 時間動かし続ける」ことです。Zilliz Cloud は、このパターンを打破するための 3 つのスケーリング戦略を提供しています。

### Auto-scaling\{#auto-scaling}

最小 CU 値と最大 CU 値を設定すると、システムがリアルタイム負荷に基づいて自動的にスケーリングします。

- Query CU は CU Capacity メトリクスに基づいて自動スケーリングされます（データ量駆動）

- Replicas は CU Computation メトリクスに基づいて自動スケーリングされます（QPS 駆動）

**典型的なシナリオ:** 昼間のピーク時には 32 CU 必要だが、夜間は 8 CU で足りる E コマース検索サービス。Auto-scaling 設定で min=8、max=32 を設定すると、システムはオフピーク時間に自動で 8 CU までスケールダウンします。1 日あたり 10 時間がオフピークだと仮定すると、月間の compute コストを約 30–40% 削減できます。

詳細については、[Auto-scaling](./auto-scaling) を参照してください。

### Scheduled scaling\{#scheduled-scaling}

予測可能なトラフィックパターンを持つワークロードに適しています。Basic mode（シンプルなセレクター）と Advanced mode（Unix cron 式）をサポートしています。

**一般的な設定:**

- 平日は 9:00 に 32 CU までスケールアップし、22:00 に 8 CU までスケールダウン

- 週末は終日 8 CU を維持

- 月末のプロモーション期間に向けて事前にスケールアップ

詳細については、[Scheduled Scaling](./scheduled-scaling) を参照してください。

### Manual scaling\{#manual-scaling}

最もシンプルな選択肢を見落とさないでください。ワークロードが閑散期に入ったとき（たとえば、プロジェクトの合間やオフシーズン中）は、CU 構成を積極的に引き下げてください。多くのユーザーは PoC 後にスケールダウンを忘れ、不要なキャパシティに対して数週間、場合によっては数か月分の料金を支払うことになります。

詳細については、[Manual Scaling](./manual-scaling) を参照してください。

### Scaling constraints\{#scaling-constraints}

- Query CU × Replica ≤ 10,240

- Replica > 1 の場合、cluster は 12 CU 未満にスケールダウンできません

- スケールダウン時、データ量は新しい CU 容量の 80% 未満である必要があります

- 12 CU 未満では Query CU のみ調整可能です。12 CU を超える場合は、Query CU と Replicas を個別に調整できます

**推奨:** 予測不能なトラフィックには dynamic scaling を使用し、規則的なトラフィックパターンには scheduled scaling を使用してください。両者は組み合わせて利用できます。

## Get more credits and discounts\{#get-more-credits-and-discounts}

技術的な最適化に加えて、Zilliz のプロモーションプログラムを最大限活用することも同様に重要です。

### Credits\{#credits}

| Channel | Credits | Validity | Notes |
| --- | --- | --- | --- |
| 新規ユーザー登録 | &#36;100 クレジット | 30 日間 | すぐに利用可能、クレジットカード不要 |
| 支払い方法の追加 | — | 1 年に延長 | 未使用のクレジットは、支払い方法を追加すると自動的に延長されます |
| Recycle Bin | 無料 | — | 削除されたデータは Recycle Bin 内にある間は課金されません |

**推奨:** 初回登録後できるだけ早く支払い方法を追加し、&#36;100 クレジットの有効期間を 30 日から 1 年に延長してください。これにより、技術評価のための十分な時間を確保できます。

### Dedicated programs\{#dedicated-programs}

| Program | Target Audience | How to Apply |
| --- | --- | --- |
| Zilliz AI Startup Program | アーリーステージのスタートアップ | [公式サイト](https://zilliz.com/zilliz-for-startups) から申請して、追加クレジットと技術サポートを受け取る |
| AI Agent Program | AI Agent 開発者 | AI Agent アプリケーションを構築する開発者向けの専用クレジット。近日公開予定。 |

### Enterprise customers\{#enterprise-customers}

- **カスタム見積もりについて営業に問い合わせる:** Enterprise customers は年間サブスクリプションを通じて割引を受けられます。具体的な料金については [contact sales](https://zilliz.com/contact-sales) にお問い合わせください。

- **Cloud Marketplace サブスクリプション:** [AWS](./subscribe-on-aws-marketplace)、[Google Cloud](./subscribe-on-gcp-marketplace)、[Azure](./subscribe-on-azure-marketplace) Marketplace 経由でサブスクライブすると、Zilliz Cloud の料金をクラウド請求書に統合し、既存の Enterprise discount を適用できます。

- **Advance pay:** [advance pay](./advance-pay) を通じてアカウントに入金します。控除の優先順位は、credits > advance pay > cloud marketplace subscriptions/credit cards です。予算管理要件のある組織に適しています。

## Monitor usage page\{#monitor-usage-page}

最適化は一度きりの作業ではありません。Zilliz Cloud は多次元のコスト分析ツールを提供し、支出を継続的に追跡して最適化できるよう支援します。

### Visualized Cost Analysis\{#visualized-cost-analysis}

**Billing > Usage** ページでは、請求を 5 つのディメンションで内訳表示できます。

| **Dimension** | **Purpose** |
| --- | --- |
| Project | 異なる事業ラインや部門間で使用量を比較する |
| Cluster | どの cluster が主なコスト要因かを特定する |
| Time Period | 日次レベルの傾向を確認し、異常な変動を検出する |
| Cost Type | 課金カテゴリごとに料金を内訳表示する |
| Cloud Region | マルチリージョンデプロイメントにおいてリージョン間のコストを比較する |

複数のディメンションをフィルターとして組み合わせることもできます。たとえば、過去 7 日間の特定の project における CU コストを選択すると、その事業ラインのコンピュートコストの推移を正確に把握できます。

詳細については、[Analyze Cost](./analyze-cost) を参照してください。

### RESTful API\{#restful-api}

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API は、小数点以下最大 8 桁の精度で使用量データを提供し、内部の FinOps ワークフローにプログラム的に統合して以下を実現できます。

- コストレポートを自動生成する

- 内部予算管理システムと統合する

- カスタムアラートルールを設定する

### Usage alerts\{#usage-alerts}

[cost metrics](./metrics-alerts-reference#organization-level-metrics) を監視し、アラートしきい値を設定して異常な支出を早期に検知することを推奨します。特に次のようなシナリオでは重要です。

- 新たに起動した cluster で、実際のコストが想定どおりかを確認する場合

- dynamic scaling を設定した後、スケーリングが正しく機能していることを確認する場合

- 新しいチームメンバーが不要なリソースを作成した可能性がある場合

## Cost optimization checklist\{#cost-optimization-checklist}

そのまま実行に移せるチェックリストです。

**Selection Phase**

**Index Configuration**

**Query Optimization**

**Operations Phase**

**Billing Optimization**

## Summary\{#summary}

Zilliz Cloud におけるコスト最適化は、単一のパラメーターを調整することではありません。選定、設定、クエリ、運用、課金にまたがるシステム全体の取り組みです。最も効果の高い最適化は次のとおりです。

1. **まず capacity-optimized clusters を選択する** — これは「ダウングレード」ではありません。コスト効率のために特別に設計された階層型ストレージアーキテクチャであり、performance-optimized clusters の 1/3 の単価で、90% 以上の本番ユースケースをカバーします。

1. **クエリパターンを最適化する** — scalar fields に index を作成し、TopK を制御し、返却フィールドを絞り、Partition Keys を使用します。これらはいずれもクエリごとのコストを大幅に削減します。

1. **elastic scaling を使用する** — アイドル状態のリソースへの支払いを止め、30～40% を節約できます。

1. **build level を調整する** — 同じ CU に 40% 多くのデータを保存できます。

適切に実施すれば、ほとんどのユーザーはビジネス要件を満たしながら、コストを十分に妥当な範囲内に維持できます。さらに、ストレージ階層化、index 最適化、elastic scheduling において Zilliz Cloud が提供する技術的利点も活用できます。
