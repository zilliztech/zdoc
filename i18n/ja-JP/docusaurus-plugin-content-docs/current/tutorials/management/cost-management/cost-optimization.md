---
title: "コスト最適化 | Cloud"
slug: /cost-optimization
sidebar_label: "コスト最適化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ規模が拡大し、クエリ量が増加するにつれて、コスト管理は重要になります。このガイドでは、デプロイメント選択、インデックス調整、弾力的スケーリング、割引、請求分析という5つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に解説します。 | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コスト最適化

データ規模が拡大し、クエリ量が増加するにつれて、コスト管理は重要になります。このガイドでは、Zilliz Cloud のコスト最適化戦略を、デプロイメント選択、インデックス調整、弾力的スケーリング、割引、請求分析という5つの観点から体系的に解説します。

## 請求内容を理解する\{#understand-your-bill}

最適化を始める前に、コストがどこから発生しているのかを特定しましょう。Zilliz Cloud の料金は5つの要素で構成されています。

| 項目 | 説明 | 最適化可能か |
| --- | --- | --- |
| [Compute (CU)](./dedicated-cluster-cost) | Dedicated cluster に対する Compute Units ベースの時間課金。 | 選択 + スケーリング |
| [Read/Write Operations](./serverless-cluster-cost) | Serverless cluster に対する従量課金。 | クエリ最適化 |
| [Storage](./storage-cost) | データおよびバックアップの保存容量（cluster の状態に関係なく課金）。 | build level + データクリーンアップ |
| [Data Transfer](./data-transfer-cost) | 取り込み、送信、およびクロスリージョン転送。 | アーキテクチャ設計 |
| [Audit Logs](./audit-log-cost) | 監査ログ記録のためのリソース消費。 | 必要に応じて有効化 |

ほとんどのユーザーにとって、コストの70%以上は **Compute** に由来し、ここに最大の最適化余地があります。

[料金計算ツール](https://zilliz.com/pricing#calculator)を使うと、vector 次元数、データ量、QPS 要件に基づいて月額見積もりを取得できます。実際のコストは見積もりより低くなることが多く、これは業務負荷が常にピーク容量のまま推移することはほとんどないためです。

## 適切なデプロイメント方式を選ぶ\{#choose-the-right-deployment-method}

適切なデプロイメント方式を選ぶことは、最も影響の大きい判断です。誤った方式を選ぶと、小さな最適化では埋められないコスト差が生じる可能性があります。

### デプロイメント方式の一覧\{#deployment-methods-at-a-glance}

| タイプ | 価格目安 (768-dim) | Capacity/CU | Search QPS | レイテンシ | ユースケース |
| --- | --- | --- | --- | --- | --- |
| Free | 0 | 5 GB, ≤5 colls | — | — | 学習、プロトタイピング |
| Serverless | 従量課金（Pay-per-RU） | Auto-scaling | Auto | 中 | トラフィックが不安定、開発/テスト |
| Dedicated (Performance-optimized) | &#126;&#36;65/M vectors/mo | 2M/CU | 500–1,500 | 低 (&lt;10ms p99) | レイテンシ重視の本番環境 |
| Dedicated (Capacity-optimized) | &#126;&#36;20/M vectors/mo | 8M/CU | 100–300 | 中 | 大規模、コスト重視 |
| Dedicated (Tiered-storage) | &#126;&#36;7/M vectors/mo | 40M/CU (≥8 CU) | 100–150 (Hot) | 高め | 超大規模データ、コールド/ホット分離 |
| BYOC | Custom | Custom | Custom | Custom | コンプライアンス、Cloud 割引活用 |

### 選択の判断フロー\{#selection-decision-tree}

- **データ < 1M vectors、QPS < 50?**
→ **Serverless** を使用してください。アイドルコストゼロで、操作した分だけ課金されます。「将来の」トラフィックのために Dedicated リソースを事前確保しないでください。

- **データ 1M–50M vectors、安定した低レイテンシが必要?**
→ **Capacity-optimized** cluster が最もコスト効率の高い選択です。Performance-optimized オプションより3倍安価で、100ミリ秒未満のレイテンシを提供し、ほとんどの RAG やレコメンデーションのシナリオには十分です。**Performance-optimized** cluster は、極端な要件（例: &lt;10 ms p99 のリアルタイム検索）にのみ使用してください。

- **データ > 50M vectors、アクセス頻度が低い?**
→ **Tiered-storage** cluster を使用してください。Capacity-optimized オプションより3倍安価で、膨大なデータのうち頻繁にクエリされるのが一部だけというシナリオ（例: 過去ログ分析）に最適です。

- **コンプライアンス要件または既存の Cloud Discounts (RI/SP) がある?**
→ **BYOC (Bring Your Own Cloud)**。cluster は VPC 内で実行されるため、エンタープライズ向け Cloud 割引を活用でき、データ主権要件も満たせます。

### 推奨: capacity-optimized — ほとんどのシナリオに最適\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

Capacity-optimized cluster は、単なる「遅い」バージョンと誤解されがちです。しかし実際には、これは Zilliz Cloud で最もアーキテクチャ的に洗練された製品です。

従来の vector database はすべてのインデックスと生データをメモリ上に保持し、速度と引き換えにコストを増やします。一方、capacity-optimized cluster は **階層型ストレージアーキテクチャ** を採用しています。

- **階層化ストレージ:** vector index は高速性のためメモリ上に保持され、scalar データと生 vector は mmap とインテリジェントキャッシュによりディスクへマップされます。これにより、performance-optimized clusters と比べて CU あたり3倍のデータ密度を実現します。

- **DiskANN レベルの最適化:** IVF indexes はディスクフレンドリーなアクセス向けに調整されており、NVMe SSD でスループットを最大化しつつ、10–50ms のレイテンシを維持します。これはほとんどの AI アプリケーションでは無視できる水準です。

- **高いリソース利用率:** Performance-optimized clusters はしばしば30%の余裕を持たせますが、capacity-optimized clusters は90%以上のデータ密度に到達できます。

**要約:** Performance-optimized オプションはハードウェアで速度を買うのに対し、capacity-optimized オプションは技術で効率を買います。

### Project プラン: Standard vs. Enterprise vs. Business Critical\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud には、機能やスケーリング上限に影響する複数のプランがあります。

| 機能 | Standard | Enterprise | Business Critical |
| --- | --- | --- | --- |
| Max CU | 32 CU | 256 CU | 512 CU |
| Replica Limit | Query CU × Repl ≤ 32 | Query CU × Repl ≤ 256 | Query CU × Repl ≤ 512 |
| SLA | 0.999 | 0.9995 | 0.9999 |
| Multi-AZ | Single AZ | Optional | Enabled by Default |
| RBAC | Basic | Custom Roles + Audit | Full + SOC2/HIPAA |
| BYOC | Not Supported | Supported | Supported |
| Support | Ticket | SA + Slack | 24/7 + 15m Response |

詳細は [Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

**アドバイス:** まずは **Standard** から始めてください。より高い SLA、Multi-AZ、またはより大きなスケールが必要になった場合にのみ **Enterprise** へアップグレードしましょう。アップグレードはシームレスで、データ移行は不要です。

### よくある落とし穴\{#common-pitfalls}

1. **Performance-optimized cluster をデフォルトで選んでしまうこと:** 多くのユーザーは PoC で使った performance-optimized clusters を基準に予算を組みます。しかし、capacity-optimized は「劣化版」ではなく、コスト効率のために設計された専用アーキテクチャです。ほとんどのシナリオに十分な QPS を、performance-optimized cluster の 1/3 のコストで提供します。

1. **Tiered-storage オプションを見落とすこと:** Performance-optimized cluster の 1/9 のコストで、tiered-storage cluster は明確なホット/コールドアクセスパターンを持つデータに理想的です。データのうちごく一部だけが低レイテンシを必要とする場合、tiered-storage オプションによってコストを桁違いに削減できます。

1. **小規模用途で Dedicated を使うこと:** 小規模データセットや不安定なトラフィックでは、Serverless（従量課金）の方が Dedicated よりはるかにコスト効率に優れています。「エンタープライズらしさ」のためだけにリソースを過剰プロビジョニングしないでください。

## Index と storage の最適化\{#index-and-storage-optimization}

モードを選択したら、各 CU の有効活用を最大化するためにパラメータを調整しましょう。

### Index build level: capacity vs. recall\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ parameter ](./tune-index-build-level)は、index の精度と storage 密度を制御します。極端な recall を必要としないシナリオでは、これを下げることで各 CU の保存容量を大幅に増やせます。

- **Performance-optimized cluster (768-dim, per CU):**

    | Build Level | Capacity | Increase | Recall | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 2.1M | 0.4 | 90–95% | &#126;2,850 |
    | Balanced (1) Default | 1.5M | Baseline | 91–97% | &#126;3,500 |
    | Precision-first (2) | 1.0M | -0.33 | 92–98% | &#126;3,000 |

- **Capacity-optimized cluster (768-dim, per CU):**

    | Build Level | Capacity | Increase | Recall | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 7M | 0.4 | 89–97% | &#126;300 |
    | Balanced (1) Default | 5M | Baseline | 93–98% | &#126;350 |
    | Precision-first (2) | 3M | -0.4 | 94–98% | &#126;345 |

**ケーススタディ:** 16 CU の capacity-optimized cluster では、デフォルトで 80M vectors を保持できます。`Capacity-first` に切り替えると、これが 112M に増加するか、あるいは同じ 80M vectors を 12 CU に収められるようになり、**CU コストを25%節約**できます。

<Admonition type="info" icon="📘" title="**注**">

`build_level` parameter は一度設定すると変更できません。変更するには index を削除して再作成する必要があります。collection を作成する前に要件を評価することを推奨します。この parameter は浮動小数点 vector 型（FLOAT_VECTOR、FLOAT16_VECTOR、BFLOAT16_VECTOR）のみをサポートします。

</Admonition>

### Search level: performance vs. cost\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ parameter](./tune-recall-rate)（1–10）は検索精度を制御します。 

- **Level 1–3:** ほとんどのシナリオに最適（90–95% recall）。

- **Level 4–7:** 高精度シナリオ向け。95–98% recall のために、およそ 2–3 倍のレイテンシを受け入れます。

- **Level 8–10:** 医療や不正検知などの高リスクシナリオ向けの極限精度ですが、レイテンシと compute コストが大きく増加します。

**アドバイス:** `enable_recall_calculation=true` を使って recall を測定し、業務要件を満たす最も低い level を見つけてください。level が1段階上がるごとに検索で消費される計算リソースが増加します。Serverless cluster ではこれは Read vCU コストの上昇に直結し、Dedicated cluster では同じ CU 割り当てで支えられる QPS の低下を意味します。

### Mmap 設定: メモリとディスクのバランス\{#mmap-configuration-balancing-memory-and-disk}

[Memory Mapping (mmap)](./use-mmap) はデータをメモリからディスクへオフロードします。

| Cluster Type | デフォルトの MMAP ポリシー | 効果 |
| --- | --- | --- |
| Dedicated (Performance-optimized) | 生 vector データのみが mmap を使用し、scalar データとすべての indexes はメモリ上に保持 | 低レイテンシを保証 |
| Dedicated (Capacity-optimized) | Scalar indexes + すべての生データが mmap を使用し、vector indexes のみメモリ上に保持 | 容量を最大化 |
| Free / Serverless | すべての fields と indexes が mmap を使用 | システムキャッシュに依存 |

**最適化の推奨事項:**

- Performance-optimized clusters では、scalar filtering がボトルネックでない場合、scalar fields で mmap を有効化して、vector indexes 用のメモリを確保することを検討してください。

- Capacity-optimized clusters では、デフォルトポリシーがすでに storage 優先であるため、通常は追加の調整は不要です。

<Admonition type="info" icon="📘" title="**注**">

mmap 設定を変更する前に Collection を release し、その後再度 load する必要があります。設定ミスにより性能低下や OOM エラーが発生する可能性があるため、まずテスト環境で検証してください。

</Admonition>

## クエリ最適化\{#query-optimization}

効率的なクエリは、Serverless ユーザーの Read Unit (RU) コストを削減し、Dedicated CU の QPS を向上させます。

### Scalar fields に index を作成する\{#index-scalar-fields}

多くのユーザーは、[BITMAP](./bitmap-index-type) などの index type を使った scalar indexing を見落としています。これがないと、フィルター（例: `category == "electronics"` や `timestamp > 1700000000`）は **collection 全体のスキャン** を引き起こし、非常に高コストです。頻繁にフィルタリングする scalar fields には index を作成できます。

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

- `filter` 式に現れるすべての scalar fields に index を作成してください。Zilliz Cloud は適切な index type（文字列には inverted index、数値には sorted index など）を自動選択します。

- Scalar indexes のメモリオーバーヘッドは最小限ですが、フィルタリング性能を桁違いに改善し、フルテーブルスキャンを index lookup に変えます。

- **重要:** 特に capacity-optimized clusters におけるフィルター付き vector 検索では、scalar index の有無が、クエリレイテンシがミリ秒になるか秒になるかを直接左右します。

### 適切な TopK を選ぶ\{#select-appropriate-topk}

[TopK](./single-vector-search) は compute とネットワークのオーバーヘッドに直接影響します。 

| TopK | 相対レイテンシ | 相対 RU コスト (Serverless) | 典型的なユースケース |
| --- | --- | --- | --- |
| 1–10 | Baseline | 1x | RAG（通常 3–5 context chunks） |
| 10–50 | 1.2–1.5x | 1.5–2x | レコメンデーションシステム、検索結果ページ |
| 50–200 | 1.5–3x | 2–4x | 候補集合生成、reranking 入力 |
| 200–1000 | 3–10x | 4–10x | バッチ分析、クラスタリング |

- **RAG:** TopK 3–10 を使用してください。より多くのコンテキストが LLM 品質を改善することはまれで、token と RU を浪費します。

- **レコメンデーション:** reranking model の上限（通常 20–50）を使用してください。

- **大きな TopK:** 一度のリクエストで大量の結果セットを返す代わりに、[pagination](./single-vector-search#use-limit-and-offset)（`offset` + `limit`）または [iterators](./with-iterators) を使用してください。

### 出力 fields を絞り込む\{#refine-output-fields}

デフォルトでは、検索は以下のようにすべての scalar fields を返します。

```python
results = collection.search(vectors, "embedding", search_params, limit=10)
```

しかし、毎回のクエリで大きなテキスト fields（例: 文書全文）を返すと、レイテンシと RU コストが増加します。そのため、必要な output fields のみを指定できます。

```python
results = collection.search(
    vectors, "embedding", search_params, limit=10,
    output_fields=["id", "title", "category"]  # 不要返回 "content" 等大字段
)
```

詳細は [Use Output Fields](./single-vector-search#use-output-fields) を参照してください。

**最適化の推奨事項:**

- 常に `output_fields` を明示的に指定し、業務ロジックに必要な fields のみを返すようにしてください。

- RAG シナリオで元のテキストが必要な場合は、まず vector search で ID を取得し、その後 ID を使って外部ストレージ（例: Redis、database）から元コンテンツを取得することを検討してください。これにより vector search を高速に保ちながら、外部ストレージ側でキャッシュの恩恵を受けられます。

- Serverless モードでは、返されるデータ量が Read vCU 課金に直接影響します。不要な fields を減らすことは、最も簡単なコスト削減方法です。

### Partition Keys を活用する\{#utilize-partition-keys}

[Partition keys](./use-partition-key) は scalar 値に基づいてデータを自動的に partitions に分散し、検索時に無関係なデータをスキップできるようにします。

次の例は、collection 作成時に partition key を指定する方法を示しています。

```python
schema.add_field("tenant_id", DataType.VARCHAR, max_length=128, is_partition_key=True)
```

**ユースケース:**

- **マルチテナント SaaS:** `tenant_id` を partition key として使用すると、各テナントのクエリが自分のデータ partition のみをスキャンするようになり、QPS とレイテンシの両方が大幅に改善します。

- **カテゴリフィルタリング:** `category` を partition key として使用すると、特定カテゴリ内の検索時にデータセット全体をスキャンする必要がなくなります。

**性能向上:** データが均等に分布する100テナントを想定すると、partition key を使うことでクエリごとのスキャン量を約99%削減できます。分布が不均一な場合でも、通常は50–90%削減されます。

## 弾力的スケーリング\{#elastic-scaling}

Dedicated clusters における最大のコストの罠は、「ピーク負荷に合わせてプロビジョニングし、24時間そのまま動かし続けること」です。Zilliz Cloud はこのパターンを打破するために3つのスケーリング戦略を提供しています。

### Auto-scaling\{#auto-scaling}

最小 CU 値と最大 CU 値を設定すると、システムがリアルタイム負荷に基づいて自動スケーリングします。

- Query CU は CU Capacity メトリクスに基づいて自動スケールします（データ量駆動）

- Replicas は CU Computation メトリクスに基づいて自動スケールします（QPS 駆動）

**典型的なシナリオ:** 日中ピーク時には 32 CU が必要だが、夜間は 8 CU で足りる eコマース検索サービス。Auto-scaling 設定で min=8、max=32 を設定すると、オフピーク時間には自動的に 8 CU までスケールダウンします。1日10時間のオフピークを想定すると、月間 compute コストを約30–40%削減できます。

詳細は [Auto-scaling](./auto-scaling) を参照してください。

### Scheduled scaling\{#scheduled-scaling}

予測可能なトラフィックパターンを持つワークロードに適しています。Basic mode（単純セレクター）と Advanced mode（Unix cron 式）をサポートします。

**典型的な設定:**

- 平日 9:00 に 32 CU へスケールアップし、22:00 に 8 CU へスケールダウン

- 週末は終日 8 CU を維持

- 月末の販促期間に向けて事前スケール

詳細は [Scheduled Scaling](./scheduled-scaling) を参照してください。

### Manual scaling\{#manual-scaling}

最もシンプルな選択肢を見落とさないでください。ワークロードが閑散期に入ったとき（例: プロジェクトの合間やオフシーズン）には、積極的に CU 構成を下げましょう。多くのユーザーは PoC 後にスケールダウンを忘れ、何週間、場合によっては何か月も不要な capacity に対して支払い続けています。

詳細は [Manual Scaling](./manual-scaling) を参照してください。

### スケーリング制約\{#scaling-constraints}

- Query CU × Replica ≤ 10,240

- Replica > 1 の場合、cluster は 12 CU 未満にスケールできません

- スケールダウン時には、データ量が新しい CU capacity の 80% 未満である必要があります

- 12 CU 未満では Query CU のみ調整可能で、12 CU 以上では Query CU と Replicas を独立して調整できます

**推奨:** トラフィックが予測できない場合は dynamic scaling を使い、規則的なトラフィックパターンには scheduled scaling を使ってください。この2つは組み合わせ可能です。

## クレジットと割引をさらに活用する\{#get-more-credits-and-discounts}

技術的な最適化に加えて、Zilliz のプロモーションプログラムを最大限活用することも同じくらい重要です。

### クレジット\{#credits}

| チャネル | クレジット | 有効期間 | 備考 |
| --- | --- | --- | --- |
| 新規ユーザー登録 | &#36;100 credits | 30日 | すぐに利用可能、クレジットカード不要 |
| 支払い方法を追加 | — | 1年に延長 | 未使用の credits は支払い方法追加時に自動延長されます |
| Recycle Bin | 無料 | — | Recycle Bin 内の削除データには課金されません |

**推奨:** 初回登録後できるだけ早く支払い方法を追加し、&#36;100 credits の有効期間を30日から1年に延長してください。これにより、技術評価に十分な時間を確保できます。

### Dedicated 向けプログラム\{#dedicated-programs}

| プログラム | 対象 | 申請方法 |
| --- | --- | --- |
| Zilliz AI Startup Program | アーリーステージのスタートアップ | [公式サイト](https://zilliz.com/zilliz-for-startups) から申し込み、追加クレジットと技術サポートを受ける |
| AI Agent Program | AI Agent 開発者 | AI Agent アプリケーションを構築する開発者向けの専用クレジット。近日公開予定。 |

### エンタープライズ顧客\{#enterprise-customers}

- **営業に連絡してカスタム見積もりを取得:** エンタープライズ顧客は年間契約による割引を受けられます。具体的な価格については [contact sales](https://zilliz.com/contact-sales) してください。

- **Cloud Marketplace サブスクリプション:** [AWS](./subscribe-on-aws-marketplace)、[Google Cloud](./subscribe-on-gcp-marketplace)、[Azure](./subscribe-on-azure-marketplace) Marketplace 経由で申し込むと、Zilliz Cloud の請求をクラウド請求に統合し、既存のエンタープライズ割引を適用できます。

- **Advance pay:** [advance pay](./advance-pay) を使ってアカウントに資金を入金します。差し引き優先順位は、credits > advance pay > cloud marketplace subscriptions/credit cards です。予算管理要件のある組織に適しています。

## Usage ページを監視する\{#monitor-usage-page}

最適化は一度きりの作業ではありません。Zilliz Cloud は、多次元のコスト分析ツールを提供し、継続的な支出の追跡と最適化を支援します。

### 可視化されたコスト分析\{#visualized-cost-analysis}

**Billing > Usage** ページでは、請求を5つの観点で分解できます。

| **観点** | **目的** |
| --- | --- |
| Project | 異なる事業部門や部署間で使用量を比較 |
| Cluster | どの cluster が主要なコスト要因かを特定 |
| Time Period | 日単位の傾向を確認し、異常な変動を検知 |
| Cost Type | 請求カテゴリごとに料金を内訳表示 |
| Cloud Region | マルチリージョン構成におけるリージョン間コストを比較 |

複数の観点をフィルターとして組み合わせることもできます。たとえば、特定の project における直近7日間の CU コストを選択すると、その事業ラインの compute コスト推移を正確に把握できます。

詳細は [Analyze Cost](./analyze-cost) を参照してください。

### RESTful API\{#restful-api}

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API は、小数点以下最大8桁の精度で usage データを提供し、社内の FinOps ワークフローにプログラム的に統合して以下を実現できます。

- コストレポートを自動生成

- 社内予算システムと統合

- カスタムアラートルールを設定

### Usage alerts\{#usage-alerts}

[cost metrics](./metrics-alerts-reference#organization-level-metrics) を監視し、アラートしきい値を設定して、異常な支出を早期に検知することを推奨します。特に以下のシナリオでは重要です。

- 新しく起動した clusters で、実際のコストが想定どおりかを確認する

- Dynamic scaling の設定後、スケーリングが正しく機能していることを確認する

- 新しいチームメンバーが不要なリソースを作成した可能性がある場合

## コスト最適化チェックリスト\{#cost-optimization-checklist}

すぐに実行できるチェックリスト:

**選定フェーズ**

**Index 設定**

**クエリ最適化**

**運用フェーズ**

**請求最適化**

## まとめ\{#summary}

Zilliz Cloud におけるコスト最適化は、単一のパラメータ調整ではありません。選定、設定、クエリ、運用、請求にまたがるシステム全体の取り組みです。最も効果の高い最適化は次のとおりです。

1. **まず capacity-optimized clusters を選ぶ** — これは「ダウングレード」ではありません。コスト効率のために特別に設計された階層型ストレージアーキテクチャであり、performance-optimized clusters の 1/3 の単価で、本番ユースケースの 90% 以上をカバーします。

1. **クエリパターンを最適化する** — scalar fields に index を作成し、TopK を制御し、返す fields を絞り、Partition Keys を使ってください。これらはそれぞれ、クエリごとのコストを意味のある形で削減します。

1. **Elastic scaling を使う** — アイドルリソースへの支払いをやめ、30–40% を節約します。

1. **build level を調整する** — 同じ CU で 40% 多くのデータを保存できます。

これらをうまく実施すれば、ほとんどのユーザーは業務要件を満たしながらコストを十分に妥当な範囲に抑えることができ、さらに Zilliz Cloud が提供する storage tiering、index 最適化、elastic scheduling の技術的利点も活用できます。
