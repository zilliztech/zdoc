---
title: "コスト最適化 | Cloud"
slug: /cost-optimization
sidebar_label: "コスト最適化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ量が増加し、クエリ量が上昇するにつれて、コスト管理は極めて重要になります。このガイドでは、Zilliz Cloud のコスト最適化戦略を、デプロイメント選択、インデックス調整、弾性スケーリング、割引、請求分析という 5 つの観点から体系的に説明します。 | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コスト最適化

データ量が増加し、クエリ量が上昇するにつれて、コスト管理は極めて重要になります。このガイドでは、Zilliz Cloud のコスト最適化戦略を、デプロイメント選択、インデックス調整、弾性スケーリング、割引、請求分析という 5 つの観点から体系的に説明します。

## 請求を理解する\{#understand-your-bill}

最適化を始める前に、コストの発生源を特定しましょう。Zilliz Cloud の料金は 5 つの要素で構成されています。

| 項目 | 説明 | 最適化可能か |
| --- | --- | --- |
| [Compute (CU)](./dedicated-cluster-cost) | Dedicated cluster に対する Compute Units ベースの時間課金。 | 選択 + スケーリング |
| [Read/Write Operations](./serverless-cluster-cost) | Serverless cluster に対する従量課金。 | クエリ最適化 |
| [Storage](./storage-cost) | データおよびバックアップのストレージ（cluster の状態に関係なく課金）。 | Build Level + データクリーンアップ |
| [Data Transfer](./data-transfer-cost) | 受信、送信、およびクロスリージョン転送。 | アーキテクチャ設計 |
| [Audit Logs](./audit-log-cost) | 監査ログ記録のためのリソース消費。 | 必要に応じて有効化 |

ほとんどのユーザーにとって、コストの 70% 以上は **Compute** に由来し、同時に最も最適化の余地が大きい項目です。

[料金計算ツール](https://zilliz.com/pricing#calculator)を使用すると、vector 次元数、データ量、QPS 要件に基づいて月額見積もりを取得できます。実際のコストは見積もりより低くなることが多く、これはビジネス負荷が常にピーク容量のまま続くことはまれだからです。

## 適切なデプロイメント方式を選ぶ\{#choose-the-right-deployment-method}

適切なデプロイメント方式を選ぶことは、最も影響の大きい判断です。誤った方式を選ぶと、小さな最適化では埋められないコスト差が生じる可能性があります。

### デプロイメント方式の概要\{#deployment-methods-at-a-glance}

| Type | Price Ref (768-dim) | Capacity/CU | Search QPS | Latency | Use Case |
| --- | --- | --- | --- | --- | --- |
| Free | 0 | 5 GB, ≤5 colls | — | — | 学習、プロトタイピング |
| Serverless | Pay-per-RU | Auto-scaling | Auto | Medium | トラフィックが不安定、Dev/Test |
| Dedicated (Performance-optimized) | &#126;&#36;65/M vectors/mo | 2M/CU | 500–1,500 | Low (&lt;10ms p99) | レイテンシ重視の本番環境 |
| Dedicated (Capacity-optimized) | &#126;&#36;20/M vectors/mo | 8M/CU | 100–300 | Medium | 大規模、コスト重視 |
| Dedicated (Tiered-storage) | &#126;&#36;7/M vectors/mo | 40M/CU (≥8 CU) | 100–150 (Hot) | Higher | 大規模データ、コールド/ホット分離 |
| BYOC | Custom | Custom | Custom | Custom | コンプライアンス、Cloud 割引の活用 |

### 選択の判断ツリー\{#selection-decision-tree}

- **データ < 1M vectors、QPS < 50?**<br/>
  → **Serverless** を使用してください。アイドルコストゼロで、操作に対してのみ課金されます。「将来的に必要かもしれない」トラフィックのために Dedicated リソースを事前確保しないでください。

- **データ 1M–50M vectors、安定した低レイテンシが必要?**<br/>
  → **Capacity-optimized** cluster が最も費用対効果の高いソリューションです。Performance-optimized オプションより 3 倍安価で、100 ミリ秒未満のレイテンシを提供します。これはほとんどの RAG やレコメンデーションのシナリオで十分以上です。**Performance-optimized** cluster を使うのは、極端な要件（例: &lt;10 ms p99 のリアルタイム検索）がある場合だけにしてください。

- **データ > 50M vectors、アクセス頻度が低い?**<br/>
  → **Tiered-storage** cluster を使用してください。Capacity-optimized オプションより 3 倍安価で、巨大なデータのうち一部のみが頻繁にクエリされるシナリオ（例: 履歴ログ分析）に最適です。

- **コンプライアンス要件または既存の Cloud Discounts (RI/SP) がある?**<br/>
  → **BYOC (Bring Your Own Cloud)**。cluster は自分の VPC 内で実行されるため、企業向け Cloud 割引を活用でき、データ主権要件も満たせます。

### 推奨: capacity-optimized—ほとんどのシナリオに最適\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

Capacity-optimized cluster は、単に「遅い」バージョンだと誤解されがちです。実際には、これは Zilliz Cloud の中で最もアーキテクチャ的に洗練された製品です。

従来の vector database では、すべてのインデックスと生データをメモリ上に保持し、コストと引き換えに速度を得ますが、capacity-optimized cluster では **tiered storage architecture** を採用しています。

- **レイヤードストレージ:** vector index は速度のためにメモリ上に保持され、一方 scalar データと raw vector は mmap によってディスクにマッピングされ、インテリジェントキャッシュが適用されます。これにより、performance-optimized  clusters と比べて CU あたり 3 倍のデータ密度を実現します。

- **DiskANN レベルの最適化:** IVF index はディスクフレンドリーなアクセス向けに調整されており、NVMe SSD でスループットを最大化しながら 10–50ms のレイテンシを維持します。これはほとんどの AI アプリケーションでは無視できるレベルです。

- **高いリソース使用率:** Performance-optimized cluster はしばしば 30% の余裕を確保しますが、capacity-optimized cluster は 90% 以上のデータ密度に到達できます。

**要約:** Performance-optimized オプションはハードウェアで速度を買い、capacity-optimized オプションは技術で効率を買います。

### プロジェクトプラン: Standard vs. Enterprise vs. Business Critical\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud は、機能とスケーリング上限に影響する複数のプランを提供しています。

| Feature | Standard | Enterprise | Business Critical |
| --- | --- | --- | --- |
| Max CU | 32 CU | 256 CU | 512 CU |
| Replica Limit | Query CU × Repl ≤ 32 | Query CU × Repl ≤ 256 | Query CU × Repl ≤ 512 |
| SLA | 0.999 | 0.9995 | 0.9999 |
| Multi-AZ | Single AZ | Optional | Enabled by Default |
| RBAC | Basic | Custom Roles + Audit | Full + SOC2/HIPAA |
| BYOC | Not Supported | Supported | Supported |
| Support | Ticket | SA + Slack | 24/7 + 15m Response |

詳細は、[プランの詳細比較](./select-zilliz-cloud-service-plans)を参照してください。

**アドバイス:** まずは **Standard** から始めてください。より高い SLA、Multi-AZ、またはより大規模なスケールが必要になった場合にのみ **Enterprise** にアップグレードしてください。アップグレードはシームレスで、データ移行は不要です。

### よくある落とし穴\{#common-pitfalls}

1. **Performance-optimized cluster をデフォルト選択してしまう:** 多くのユーザーは、PoC で使用した performance-optimized cluster を基準に予算を立てます。しかし、capacity-optimized は「性能を落とした」バージョンではなく、コスト効率のために設計された専用アーキテクチャです。ほとんどのシナリオで十分な QPS を提供しながら、コストは performance-optimized cluster のわずか 1/3 です。

1. **Tiered-storage オプションを見落とす:** Performance-optimized cluster の 1/9 のコストで、tiered-storage cluster は明確なホット/コールドアクセスパターンを持つデータに最適です。データのごく一部だけが低レイテンシを必要とする場合、tiered-storage オプションによってコストを 1 桁分削減できる可能性があります。

1. **小規模で Dedicated を使う:** 小規模データセットや不安定なトラフィックでは、Serverless（従量課金）の方が Dedicated よりはるかに費用対効果に優れています。「エンタープライズらしさ」のためだけにリソースを過剰プロビジョニングしないでください。

## インデックスとストレージの最適化\{#index-and-storage-optimization}

モードを選択したら、各 CU の有用性を最大化するようにパラメータを調整します。

### インデックス build level: 容量 vs. recall\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ parameter ](./tune-index-build-level)は、インデックス精度とストレージ密度を制御します。極端な recall を必要としないシナリオでは、これを下げることで各 CU の保存容量を大幅に増やせます。

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

**ケーススタディ:** 16 CU の capacity-optimized cluster は、デフォルトで 80M vectors を保持できます。`Capacity-first` に切り替えると 112M まで増加するか、同じ 80M vectors を 12 CU に収めることができ、**CU コストを 25% 節約**できます。

<Admonition type="info" icon="📘" title="**注記**">

`build_level` parameter は一度設定すると変更できません。変更するには、index を削除して再作成する必要があります。collection を作成する前に要件を評価することを推奨します。この parameter は浮動小数点 vector type（FLOAT_VECTOR、FLOAT16_VECTOR、BFLOAT16_VECTOR）のみをサポートします。

</Admonition>

### Search level: パフォーマンス vs. コスト\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ parameter](./tune-recall-rate)（1–10）は検索精度を制御します。 

- **Level 1–3:** ほとんどのシナリオに最適（90–95% recall）。

- **Level 4–7:** 高精度シナリオ向け。95–98% recall と引き換えに、レイテンシはおよそ 2–3 倍になります。

- **Level 8–10:** 医療や不正検知などの高リスクシナリオ向けの極高精度ですが、レイテンシと compute コストが大幅に増加します。

**アドバイス:** `enable_recall_calculation=true` を使って recall を測定し、ビジネス要件を満たす最小の level を見つけてください。level を 1 段階上げるごとに、検索で消費される計算リソースは増加します。Serverless cluster では、これは直接 Read vCU コストの上昇につながり、Dedicated cluster では、同じ CU 割り当てでサポート可能な QPS の低下を意味します。

### Mmap 設定: メモリとディスクのバランス\{#mmap-configuration-balancing-memory-and-disk}

[Memory Mapping (mmap)](./use-mmap) はデータをメモリからディスクへオフロードします。

| Cluster Type | Default MMAP Policy | Effect |
| --- | --- | --- |
| Dedicated (Performance-optimized) | Raw vector data のみが mmap を使用し、scalar data とすべての index はメモリ内に保持される | 低レイテンシを保証 |
| Dedicated (Capacity-optimized) | Scalar index + すべての raw data が mmap を使用し、vector index のみがメモリ内に保持される | 容量を最大化 |
| Free / Serverless | すべての field と index が mmap を使用 | システムキャッシュに依存 |

**最適化の推奨事項:**

- Performance-optimized cluster では、scalar filtering がボトルネックでない場合、scalar field で mmap を有効にして vector index 用のメモリを解放することを検討してください。

- Capacity-optimized cluster では、デフォルトポリシーがすでに storage-first であるため、通常は追加調整は不要です。

<Admonition type="info" icon="📘" title="**注記**">

mmap 設定を変更する前に Collection を release し、その後で再度 load する必要があります。設定ミスはパフォーマンス低下や OOM エラーを引き起こす可能性があるため、まずテスト環境で検証してください。

</Admonition>

## クエリ最適化\{#query-optimization}

効率的なクエリは、Serverless ユーザーの Read Unit (RU) コストを削減し、Dedicated CUs の QPS を向上させます。

### scalar field にインデックスを付ける\{#index-scalar-fields}

多くのユーザーは、[BITMAP](./bitmap-index-type) などの index type を使った scalar indexing を見落としがちです。これがない場合、フィルター（例: `category == "electronics"` や `timestamp > 1700000000`）は **collection 全体スキャン** を引き起こし、非常に高コストになります。頻繁にフィルタリングされる scalar field には index を作成できます。

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

- `filter` 式に現れるすべての scalar field に index を構築してください。Zilliz Cloud は適切な index type（文字列には inverted index、数値には sorted index など）を自動的に選択します。

- Scalar index のメモリオーバーヘッドは最小限ですが、フィルタリング性能を桁違いに改善し、フルテーブルスキャンを index lookup に変えます。

- **重要:** 特に capacity-optimized cluster におけるフィルター付き vector search では、scalar index の有無が、クエリレイテンシがミリ秒単位になるか秒単位になるかを直接左右します。

### 適切な TopK を選ぶ\{#select-appropriate-topk}

[TopK](./single-vector-search) は compute とネットワークのオーバーヘッドに直接影響します。 

| TopK | Relative Latency | Relative RU Cost (Serverless) | Typical Use Case |
| --- | --- | --- | --- |
| 1–10 | Baseline | 1x | RAG（通常 3–5 個のコンテキストチャンク） |
| 10–50 | 1.2–1.5x | 1.5–2x | レコメンデーションシステム、検索結果ページ |
| 50–200 | 1.5–3x | 2–4x | 候補集合生成、reranking 入力 |
| 200–1000 | 3–10x | 4–10x | バッチ分析、クラスタリング |

- **RAG:** TopK は 3–10 を使用してください。より多くのコンテキストが LLM の品質を改善することはまれで、token と RU の無駄になります。

- **レコメンデーション:** reranking model の上限（通常 20–50）を使用してください。

- **大きな TopK:** 1 回のリクエストで巨大な結果セットを返すのではなく、[pagination](./single-vector-search#use-limit-and-offset)（`offset` + `limit`）または [iterators](./with-iterators) を使用してください。

### 出力 field を絞り込む\{#refine-output-fields}

デフォルトでは、以下のように search はすべての scalar field を返します。

```python
results = collection.search(vectors, "embedding", search_params, limit=10)
```

しかし、毎回のクエリで大きなテキスト field（例: ドキュメント本文全体）を返すと、レイテンシと RU コストが増加します。そのため、必要な output field のみを指定できます。

```python
results = collection.search(
    vectors, "embedding", search_params, limit=10,
    output_fields=["id", "title", "category"]  # 不要返回 "content" 等大字段
)
```

詳細は、[Use Output Fields](./single-vector-search#use-output-fields)を参照してください。

**最適化の推奨事項:**

- 常に `output_fields` を明示的に指定し、ビジネスロジックに必要な field のみを返してください。

- RAG シナリオで元のテキストが必要な場合は、まず vector search で ID を取得し、その後 ID によって外部ストレージ（例: Redis、database）からソースコンテンツを取得することを検討してください。これにより vector search を高速に保ちながら、外部ストレージ側でキャッシュの恩恵を受けられます。

- Serverless モードでは、返されるデータ量が Read vCU 課金に直接影響します。不要な field を減らすことは、最も簡単なコスト削減方法です。

### partition key を活用する\{#utilize-partition-keys}

[Partition keys](./use-partition-key) は、scalar 値に基づいてデータを自動的に partition に分散し、検索時に無関係なデータをスキップできるようにします。

以下の例は、collection 作成時に partition key を指定する方法を示しています。

```python
schema.add_field("tenant_id", DataType.VARCHAR, max_length=128, is_partition_key=True)
```

**ユースケース:**

- **マルチテナント SaaS:** `tenant_id` を partition key として使用すると、各テナントのクエリは自分のデータ partition のみをスキャンするため、QPS とレイテンシの両方が大幅に改善されます。

- **カテゴリフィルタリング:** `category` を partition key として使用すると、特定カテゴリ内で検索する際にデータセット全体をスキャンする必要がなくなります。

**パフォーマンス向上:** データが均等に分散された 100 テナントを想定すると、partition key を使用することでクエリごとのスキャン量を約 99% 削減できます。分布が不均一な場合でも、通常は 50–90% のスキャン量削減が期待できます。

## 弾性スケーリング\{#elastic-scaling}

Dedicated cluster における最大のコストの落とし穴は、「ピーク負荷に合わせてプロビジョニングし、それを 24 時間 365 日動かし続けること」です。Zilliz Cloud は、このパターンを打破するために 3 つのスケーリング戦略を提供しています。

### Auto-scaling\{#auto-scaling}

最小および最大 CU 値を設定すると、システムはリアルタイム負荷に基づいて自動的にスケールします。

- Query CU は、CU Capacity メトリクスに基づいて自動スケーリングされます（データ量駆動）

- Replicas は、CU Computation メトリクスに基づいて自動スケーリングされます（QPS 駆動）

**典型的なシナリオ:** 日中ピーク時には 32 CU が必要だが、夜間は 8 CU で十分な e コマース検索サービス。auto-scaling 設定で min=8、max=32 を設定すると、オフピーク時間帯にシステムが自動的に 8 CU までスケールダウンします。1 日あたり 10 時間のオフピークを想定すると、月間 compute コストを約 30–40% 削減できます。

詳細は、[Auto-scaling](./auto-scaling)を参照してください。

### スケジュールスケーリング\{#scheduled-scaling}

予測可能なトラフィックパターンを持つワークロードに適しています。Basic モード（シンプルなセレクター）と Advanced モード（Unix cron 式）をサポートしています。

**一般的な構成:**

- 平日は 9:00 に 32 CU へスケールアップし、22:00 に 8 CU へスケールダウン

- 週末は終日 8 CU を維持

- 月末のプロモーション期間に向けて事前スケール

詳細については、[Scheduled Scaling](./scheduled-scaling) を参照してください。

### 手動スケーリング\{#manual-scaling}

最もシンプルな選択肢を見落とさないでください。ワークロードが閑散期に入ったとき（たとえば、プロジェクト間の期間やオフシーズン）、CU 構成を積極的に減らしてください。多くのユーザーは PoC の後にスケールダウンするのを忘れ、不要なキャパシティに対して数週間、場合によっては数か月分の料金を支払うことになります。

詳細については、[Manual Scaling](./manual-scaling) を参照してください。

### スケーリングの制約\{#scaling-constraints}

- Query CU × Replica ≤ 10,240

- Replica > 1 の場合、クラスターは 12 CU 未満にスケールダウンできません

- スケールダウン時、データ量は新しい CU キャパシティの 80% 未満である必要があります

- 12 CU 未満では Query CU のみ調整可能です。12 CU を超える場合は、Query CU と Replicas を独立して調整できます

**推奨:** 予測不能なトラフィックには dynamic scaling を、規則的なトラフィックパターンには scheduled scaling を使用してください。この 2 つは組み合わせて使用できます。

## より多くのクレジットと割引を得る\{#get-more-credits-and-discounts}

技術的な最適化に加えて、Zilliz のプロモーションプログラムを最大限活用することも同様に重要です。

### クレジット\{#credits}

| チャネル | クレジット | 有効期間 | 備考 |
| --- | --- | --- | --- |
| 新規ユーザー登録 | &#36;100 クレジット | 30 日 | すぐに利用可能、クレジットカード不要 |
| 支払い方法の追加 | — | 1 年に延長 | 未使用のクレジットは、支払い方法を追加すると自動的に延長されます |
| Recycle Bin | 無料 | — | 削除されたデータは Recycle Bin 内にある間は料金が発生しません |

**推奨:** 初回登録後できるだけ早く支払い方法を追加し、&#36;100 のクレジットの有効期間を 30 日から 1 年に延長してください。これにより、技術評価のための十分な時間を確保できます。

### 専用プログラム\{#dedicated-programs}

| プログラム | 対象者 | 申請方法 |
| --- | --- | --- |
| Zilliz AI Startup Program | アーリーステージのスタートアップ | [公式サイト](https://zilliz.com/zilliz-for-startups) から申請すると、追加クレジットと技術サポートを受けられます |
| AI Agent Program | AI Agent 開発者 | AI Agent アプリケーションを構築する開発者向けの専用クレジット。近日公開予定。 |

### エンタープライズ顧客\{#enterprise-customers}

- **カスタム見積もりについて営業に問い合わせる:** エンタープライズ顧客は年間サブスクリプションを通じて割引を受けられます。具体的な価格については [contact sales](https://zilliz.com/contact-sales) を参照してください。

- **Cloud Marketplace サブスクリプション:** [AWS](./subscribe-on-aws-marketplace)、[Google Cloud](./subscribe-on-gcp-marketplace)、[Azure](./subscribe-on-azure-marketplace) Marketplace 経由でサブスクライブすると、Zilliz Cloud の料金をクラウド請求にまとめ、既存のエンタープライズ割引を適用できます。

- **Advance pay:** [advance pay](./advance-pay) を通じてアカウントに資金を入金します。控除の優先順位は、credits > advance pay > cloud marketplace subscriptions/credit cards です。予算管理要件のある組織に適しています。

## 使用状況監視ページ\{#monitor-usage-page}

最適化は一度きりの作業ではありません。Zilliz Cloud は、多次元のコスト分析ツールを提供し、支出を継続的に追跡して最適化できるよう支援します。

### 可視化されたコスト分析\{#visualized-cost-analysis}

**Billing > Usage** ページでは、請求を 5 つの次元で内訳表示できます。

| **ディメンション** | **目的** |
| --- | --- |
| Project | 異なる事業ラインや部門間で使用状況を比較する |
| Cluster | どのクラスターが主要なコスト要因かを特定する |
| Time Period | 日単位のトレンドを確認し、異常な変動を検出する |
| Cost Type | 請求カテゴリごとに料金を内訳表示する |
| Cloud Region | マルチリージョン展開におけるリージョン間のコストを比較する |

複数の次元をフィルターとして組み合わせることができます。たとえば、特定のプロジェクトにおける過去 7 日間の CU コストを選択すると、その事業ラインのコンピュートコスト推移を正確に把握できます。

詳細については、[Analyze Cost](./analyze-cost) を参照してください。

### RESTful API\{#restful-api}

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API は、小数点以下最大 8 桁の精度で使用状況データを提供し、社内の FinOps ワークフローにプログラム的に統合して次のことを実現できます。

- コストレポートを自動生成する

- 社内の予算管理システムと統合する

- カスタムアラートルールを設定する

### 使用状況アラート\{#usage-alerts}

[cost metrics](./metrics-alerts-reference#organization-level-metrics) を監視し、異常な支出を早期に検知できるようアラートしきい値を設定することを推奨します。特に次のシナリオでは重要です。

- 新たに起動したクラスターで、実際のコストが想定どおりかを確認する

- dynamic scaling を構成した後、スケーリングが正しく機能していることを確認する

- 新しいチームメンバーが不要なリソースを作成している可能性がある場合

## コスト最適化チェックリスト\{#cost-optimization-checklist}

すぐに実行できるチェックリスト:

**選定フェーズ**

**インデックス構成**

**クエリ最適化**

**運用フェーズ**

**請求最適化**

## まとめ\{#summary}

Zilliz Cloud におけるコスト最適化は、単一のパラメータを調整することではありません。選定、構成、クエリ、運用、請求にまたがるシステム全体の取り組みです。最も効果の高い最適化は次のとおりです。

1. **まずキャパシティ最適化クラスターを選択する** — これは「ダウングレード」ではありません。コスト効率のために特別に設計された階層型ストレージアーキテクチャであり、performance-optimized clusters の 1/3 の単価で、90% を超える本番ユースケースをカバーします。

1. **クエリパターンを最適化する** — scalar fields にインデックスを作成し、TopK を制御し、返却フィールドを絞り、Partition Keys を使用してください。これらはいずれもクエリごとのコストを大きく削減します。

1. **elastic scaling を使用する** — アイドルリソースへの支払いをやめて、30～40% 節約できます。

1. **build level を調整する** — 同じ CU で 40% 多くのデータを保存できます。

適切に行えば、ほとんどのユーザーはビジネス要件を満たしながらコストを十分に妥当な範囲内に抑えられ、さらに Zilliz Cloud が提供するストレージ階層化、インデックス最適化、elastic scheduling の技術的利点も活用できます。
