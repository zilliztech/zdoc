---
title: "コスト最適化 | Cloud"
slug: /cost-optimization
sidebar_label: "コスト最適化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ規模の拡大とクエリ量の増加に伴い、コスト管理は極めて重要になります。このガイドでは、デプロイメント選択、インデックス調整、弾性スケーリング、割引、請求分析という5つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。 | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コスト最適化

データ規模の拡大とクエリ量の増加に伴い、コスト管理は極めて重要になります。このガイドでは、デプロイメント選択、インデックス調整、弾性スケーリング、割引、請求分析という5つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。

## 請求内容を理解する\{#understand-your-bill}

最適化を始める前に、コストの発生源を特定しましょう。Zilliz Cloud の料金は、5つの要素で構成されています。

| 項目 | 説明 | 最適化可能? |
| --- | --- | --- |
| [Compute (CU)](./dedicated-cluster-cost) | Dedicated cluster に対する Compute Units ベースの時間課金。 | 選択 + スケーリング |
| [Read/Write Operations](./serverless-cluster-cost) | Serverless cluster に対する従量課金。 | クエリ最適化 |
| [Storage](./storage-cost) | データおよびバックアップの保存容量（cluster の状態に関係なく課金）。 | build level + データクリーンアップ |
| [Data Transfer](./data-transfer-cost) | 受信、送信、およびリージョン間転送。 | アーキテクチャ計画 |
| [Audit Logs](./audit-log-cost) | 監査ログ記録のためのリソース消費。 | 必要に応じて有効化 |

ほとんどのユーザーにおいて、コストの70%以上は **Compute** に由来し、ここが最も最適化の余地が大きい領域でもあります。

[pricing calculator](https://zilliz.com/pricing#calculator) を使用すると、vector 次元数、データ量、QPS 要件に基づいて月額見積もりを確認できます。実際のコストは見積もりより低くなることが多く、これは業務負荷が常にピーク容量に張り付くことはほとんどないためです。

## 適切なデプロイ方式を選ぶ\{#choose-the-right-deployment-method}

適切なデプロイ方式の選択は、最も影響の大きい意思決定です。誤った方式を選ぶと、小さな最適化では埋められないほどのコスト差が生じる可能性があります。

### デプロイ方式の一覧\{#deployment-methods-at-a-glance}

| Type | 価格目安 (768-dim) | 容量/CU | Search QPS | レイテンシ | ユースケース |
| --- | --- | --- | --- | --- | --- |
| Free | 0 | 5 GB, ≤5 colls | — | — | 学習、プロトタイピング |
| Serverless | Pay-per-RU | Auto-scaling | Auto | Medium | 不安定なトラフィック、Dev/Test |
| Dedicated (Performance-optimized) | &#126;&#36;65/M vectors/mo | 2M/CU | 500–1,500 | Low (&lt;10ms p99) | レイテンシ重視の本番環境 |
| Dedicated (Capacity-optimized) | &#126;&#36;20/M vectors/mo | 8M/CU | 100–300 | Medium | 大規模、コスト重視 |
| Dedicated (Tiered-storage) | &#126;&#36;7/M vectors/mo | 40M/CU (≥8 CU) | 100–150 (Hot) | Higher | 大量データ、コールド/ホット分離 |
| BYOC | Custom | Custom | Custom | Custom | コンプライアンス、Cloud 割引 |

### 選択の意思決定ツリー\{#selection-decision-tree}

- **データ < 1M vectors、QPS < 50?**<br/>
  → **Serverless** を使用します。アイドルコストゼロで、操作分だけ課金されます。「将来的な」トラフィックのために Dedicated リソースをプロビジョニングしないでください。

- **データ 1M–50M vectors、安定した低レイテンシが必要?**<br/>
  → **Capacity-optimized** cluster が最も費用対効果の高いソリューションです。performance-optimized オプションより 3 倍安く、100 ミリ秒未満のレイテンシを提供します。これはほとんどの RAG やレコメンデーションのシナリオには十分すぎる性能です。**performance-optimized** cluster は、極端な要件（例: &lt;10 ms p99 のリアルタイム検索）がある場合にのみ使用してください。

- **データ > 50M vectors、アクセス頻度が低い?**<br/>
  → **Tiered-storage** cluster を使用します。capacity-optimized オプションより 3 倍安く、頻繁にクエリされるのが一部のデータだけという大量データのシナリオ（例: 履歴ログ分析）に最適です。

- **コンプライアンス要件または既存の Cloud Discounts (RI/SP) がある?**<br/>
  → **BYOC (Bring Your Own Cloud)**。cluster はお客様の VPC 内で実行されるため、エンタープライズ向け cloud 割引を活用しつつ、データ主権要件にも対応できます。

### 推奨: capacity-optimized—ほとんどのシナリオに最適\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

Capacity-optimized cluster は、単なる「遅い」バージョンだと誤解されがちです。しかし実際には、これは Zilliz Cloud で最もアーキテクチャ的に洗練された製品です。

従来の vector database がすべてのインデックスと生データをメモリ内に保持し、速度のためにコストを犠牲にしているのに対し、capacity-optimized clusters は **tiered storage architecture** を採用しています。

- **階層型ストレージ:** vector index は速度のためにメモリ内に保持される一方、scalar データと raw vector は mmap とインテリジェントキャッシュを通じてディスクにマップされます。これにより、performance-optimized clusters と比較して、CU あたり 3 倍のデータ密度を実現できます。

- **DiskANN レベルの最適化:** IVF index はディスクフレンドリーなアクセス向けに調整されており、NVMe SSD でスループットを最大化しながら 10–50ms のレイテンシを維持します。これはほとんどの AI アプリケーションにとって無視できるレベルです。

- **高いリソース使用率:** Performance-optimized clusters はしばしば 30% のヘッドルームを残しますが、capacity-optimized clusters は 90% 以上のデータ密度に到達できます。

**要約:** Performance-optimized オプションはハードウェアで速度を買い、capacity-optimized オプションは技術で効率を買います。

### Project plan: Standard vs. Enterprise vs. Business Critical\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud では、機能やスケーリング上限に影響する複数の plan を提供しています。

| Feature | Standard | Enterprise | Business Critical |
| --- | --- | --- | --- |
| Max CU | 32 CU | 256 CU | 512 CU |
| Replica Limit | Query CU × Repl ≤ 32 | Query CU × Repl ≤ 256 | Query CU × Repl ≤ 512 |
| SLA | 0.999 | 0.9995 | 0.9999 |
| Multi-AZ | 単一 AZ | オプション | デフォルトで有効 |
| RBAC | 基本 | カスタムロール + Audit | フル + SOC2/HIPAA |
| BYOC | 非対応 | 対応 | 対応 |
| Support | チケット | SA + Slack | 24/7 + 15分応答 |

詳細については、[Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

**アドバイス:** まずは **Standard** から始めてください。より高い SLA、Multi-AZ、またはより大きなスケールが必要になった場合にのみ **Enterprise** にアップグレードします。アップグレードはシームレスで、データ移行は不要です。

### よくある落とし穴\{#common-pitfalls}

1. **performance-optimized cluster をデフォルトにしてしまう:** 多くのユーザーは、PoC で使用した performance-optimized clusters を基準に予算を立てます。しかし、capacity-optimized は「性能を落とした」バージョンではなく、コスト効率のために設計された専用アーキテクチャです。ほとんどのシナリオで十分な QPS を提供しながら、コストは performance-optimized cluster のわずか 1/3 です。

1. **Tiered-storage オプションを見落とす:** performance-optimized cluster の 1/9 のコストで、tiered-storage cluster はホット/コールドのアクセスパターンが明確なデータに最適です。低レイテンシを必要とするのがデータのごく一部だけであれば、tiered-storage オプションによりコストを桁違いに削減できます。

1. **小規模なのに Dedicated を使う:** 小規模データセットや不安定なトラフィックには、Dedicated よりも Serverless（従量課金）の方がはるかに費用対効果が高くなります。「エンタープライズらしさ」を理由に、リソースを過剰プロビジョニングしないでください。

## インデックスとストレージの最適化\{#index-and-storage-optimization}

モードを選択したら、各 CU の価値を最大化するためにパラメータを調整します。

### Index build level: 容量 vs. recall\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ parameter ](./tune-index-build-level)は、index の精度とストレージ密度を制御します。極端な recall を必要としないシナリオでは、これを下げることで各 CU の保存可能容量を大幅に増やせます。

- **Performance-optimized cluster (768-dim, per CU):**

    | Build Level | 容量 | 増加率 | Recall | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 2.1M | 0.4 | 90–95% | &#126;2,850 |
    | Balanced (1) Default | 1.5M | Baseline | 91–97% | &#126;3,500 |
    | Precision-first (2) | 1.0M | -0.33 | 92–98% | &#126;3,000 |

- **Capacity-optimized cluster (768-dim, per CU):**

    | Build Level | 容量 | 増加率 | Recall | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 7M | 0.4 | 89–97% | &#126;300 |
    | Balanced (1) Default | 5M | Baseline | 93–98% | &#126;350 |
    | Precision-first (2) | 3M | -0.4 | 94–98% | &#126;345 |

**ケーススタディ:** 16 CU の capacity-optimized cluster は、デフォルトで 80M vectors を格納できます。`Capacity-first` に切り替えると、これが 112M に増加し、あるいは同じ 80M vectors を 12 CU に収められるため、**CU コストを 25% 削減**できます。

<Admonition type="info" icon="📘" title="**Note**">

`build_level` parameter は、一度設定すると変更できません。変更するには index を削除して再作成する必要があります。collection を作成する前に要件を評価することを推奨します。この parameter は浮動小数点 vector 型（FLOAT_VECTOR、FLOAT16_VECTOR、BFLOAT16_VECTOR）のみをサポートします。

</Admonition>

### Search level: パフォーマンス vs. コスト\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ parameter](./tune-recall-rate) (1–10) は、検索精度を制御します。 

- **Level 1–3:** ほとんどのシナリオに最適（90–95% recall）。

- **Level 4–7:** 高精度シナリオ向け。95–98% recall と引き換えに、レイテンシが約 2–3 倍になります。

- **Level 8–10:** 高リスクシナリオ（例: 医療、不正検知）向けの極限精度ですが、レイテンシと compute コストが大幅に増加します。

**アドバイス:** `enable_recall_calculation=true` を使って recall を測定し、ビジネス要件を満たす最小の level を見つけてください。level が 1 段階上がるごとに、検索が消費する計算リソースも増加します。Serverless cluster では、これは直接 Read vCU コストの増加につながり、Dedicated cluster では、同じ CU 割り当てでサポートできる QPS が低下することを意味します。

### Mmap 設定: メモリとディスクのバランス\{#mmap-configuration-balancing-memory-and-disk}

[Memory Mapping (mmap)](./use-mmap) は、データをメモリからディスクへオフロードします。

| Cluster Type | デフォルトの MMAP ポリシー | 効果 |
| --- | --- | --- |
| Dedicated (Performance-optimized) | raw vector データのみが mmap を使用し、scalar データとすべての indexes はメモリ内に保持される | 低レイテンシを保証 |
| Dedicated (Capacity-optimized) | scalar indexes + すべての raw data が mmap を使用し、vector indexes のみがメモリ内に保持される | 容量を最大化 |
| Free / Serverless | すべての field と indexes が mmap を使用 | システムキャッシュに依存 |

**最適化の推奨事項:**

- performance-optimized clusters では、scalar filtering がボトルネックでない場合、scalar fields で mmap を有効にして、vector indexes 用のメモリを解放することを検討してください。

- capacity-optimized clusters では、デフォルトポリシーがすでにストレージ優先であるため、通常は追加の調整は不要です。

<Admonition type="info" icon="📘" title="**Note**">

mmap 設定を変更する前に Collection を release し、その後で再度 load する必要があります。設定ミスはパフォーマンス低下や OOM エラーを引き起こす可能性があるため、まずテスト環境で検証してください。

</Admonition>

## クエリ最適化\{#query-optimization}

効率的なクエリは、Serverless ユーザーの Read Unit (RU) コストを削減し、Dedicated CU の QPS を向上させます。

### scalar fields に index を作成する\{#index-scalar-fields}

多くのユーザーは、[BITMAP](./bitmap-index-type) のような index type を使った scalar indexing を見落としています。これがないと、filter（例: `category == "electronics"` や `timestamp > 1700000000`）が **collection 全体のスキャン** を引き起こし、非常に高コストになります。頻繁に filter する scalar fields には indexes を作成できます。

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

- `filter` 式に現れるすべての scalar fields に indexes を作成してください。Zilliz Cloud は適切な index type（文字列には inverted index、数値には sorted index など）を自動的に選択します。

- scalar indexes のメモリオーバーヘッドは最小限ですが、filtering 性能を桁違いに向上させ、フルテーブルスキャンを index lookup に変えます。

- **重要:** 特に capacity-optimized clusters における filtered vector search では、scalar index の有無が、クエリレイテンシがミリ秒単位になるか秒単位になるかを直接左右します。

### 適切な TopK を選択する\{#select-appropriate-topk}

[TopK](./single-vector-search) は、compute とネットワークのオーバーヘッドに直接影響します。 

| TopK | 相対レイテンシ | 相対 RU コスト (Serverless) | 一般的なユースケース |
| --- | --- | --- | --- |
| 1–10 | Baseline | 1x | RAG（通常 3–5 個のコンテキストチャンク） |
| 10–50 | 1.2–1.5x | 1.5–2x | レコメンデーションシステム、検索結果ページ |
| 50–200 | 1.5–3x | 2–4x | 候補集合生成、reranking 入力 |
| 200–1000 | 3–10x | 4–10x | バッチ分析、クラスタリング |

- **RAG:** TopK 3–10 を使用してください。コンテキストを増やしても LLM の品質が改善することはまれで、token と RU を無駄にします。

- **レコメンデーション:** reranking model の上限（通常 20–50）を使ってください。

- **大きな TopK:** 1 回のリクエストで巨大な結果セットを返すのではなく、[pagination](./single-vector-search#use-limit-and-offset)（`offset` + `limit`）または [iterators](./with-iterators) を使用してください。

### 出力 field を絞り込む\{#refine-output-fields}

デフォルトでは、検索は以下のようにすべての scalar fields を返します。

```python
results = collection.search(vectors, "embedding", search_params, limit=10)
```

ただし、各クエリで大きなテキスト field（例: ドキュメント本文全体）を返すと、レイテンシと RU コストが増加します。そのため、必要な出力 field のみを指定できます。

```python
results = collection.search(
    vectors, "embedding", search_params, limit=10,
    output_fields=["id", "title", "category"]  # 不要返回 "content" 等大字段
)
```

詳細については、[Use Output Fields](./single-vector-search#use-output-fields) を参照してください。

**最適化の推奨事項:**

- 常に `output_fields` を明示的に指定し、ビジネスロジックに必要な fields のみを返してください。

- RAG シナリオで元のテキストが必要な場合は、まず vector search で ID を取得し、その後 ID を使って外部ストレージ（例: Redis、database）からソースコンテンツを取得することを検討してください。これにより vector search を高速に保ちながら、外部ストレージ側でキャッシュの恩恵を受けられます。

- Serverless mode では、返されるデータ量が Read vCU 課金に直接影響します。不要な fields を減らすことが、コスト削減の最も簡単な方法です。

### partition key を活用する\{#utilize-partition-keys}

[Partition keys](./use-partition-key) は、scalar 値に基づいてデータを自動的に partitions に分散し、検索時に無関係なデータをスキップできるようにします。

次の例は、collection 作成時に partition key を指定する方法を示しています。

```python
schema.add_field("tenant_id", DataType.VARCHAR, max_length=128, is_partition_key=True)
```

**ユースケース:**

- **マルチテナント SaaS:** `tenant_id` を partition key として使用すると、各テナントのクエリが自分のデータ partition のみをスキャンするようになり、QPS とレイテンシの両方が大幅に改善されます。

- **カテゴリフィルタリング:** `category` を partition key として使用すると、特定カテゴリ内で検索する際にデータセット全体をスキャンする必要がなくなります。

**性能向上:** データが均等に分散された 100 テナントを想定すると、partition key を使用することでクエリあたりのスキャン量を約 99% 削減できます。分布が均等でない場合でも、通常は 50–90% の削減が見込めます。

## 弾性スケーリング\{#elastic-scaling}

Dedicated clusters における最大のコストの罠は、「ピーク負荷に合わせてプロビジョニングし、そのまま 24 時間稼働させること」です。Zilliz Cloud には、このパターンを打破するための 3 つのスケーリング戦略があります。

### Auto-scaling\{#auto-scaling}

最小 CU 値と最大 CU 値を設定すると、システムがリアルタイム負荷に基づいて自動的にスケールします。

- Query CU は CU Capacity メトリクスに基づいて自動スケールします（データ量駆動）

- Replicas は CU Computation メトリクスに基づいて自動スケールします（QPS 駆動）

**典型的なシナリオ:** 昼間のピーク時には 32 CU が必要だが、夜間は 8 CU で足りる e コマース検索サービスを考えます。auto-scaling 設定で min=8、max=32 を設定しておけば、オフピーク時間帯にはシステムが自動的に 8 CU までスケールダウンします。1 日あたり 10 時間がオフピークだとすると、月間の compute コストを約 30–40% 削減できます。

詳細については、[Auto-scaling](./auto-scaling) を参照してください。

### スケジュールスケーリング\{#scheduled-scaling}

予測可能なトラフィックパターンを持つワークロードに適しています。Basic モード（シンプルなセレクター）と Advanced モード（Unix cron 式）をサポートします。

**一般的な構成:**

- 平日は 9:00 に 32 CU へスケールアップし、22:00 に 8 CU へスケールダウンする

- 週末は終日 8 CU を維持する

- 月末のプロモーション期間に向けて事前にスケールする

詳細については、[スケジュールスケーリング](./scheduled-scaling) を参照してください。

### 手動スケーリング\{#manual-scaling}

最もシンプルな選択肢を見落とさないでください。ワークロードが閑散期に入ったとき（例: プロジェクト間の期間やオフシーズン中）は、CU 構成を積極的に引き下げてください。多くのユーザーは PoC 後にスケールダウンするのを忘れ、不要なキャパシティに対して数週間、場合によっては数か月分の料金を支払うことになります。

詳細については、[手動スケーリング](./manual-scaling) を参照してください。

### スケーリングの制約\{#scaling-constraints}

- Query CU × Replica ≤ 10,240

- Replica > 1 の場合、クラスターは 12 CU 未満にはスケールできません

- スケールダウン時、データ量は新しい CU 容量の 80% 未満である必要があります

- 12 CU 未満では Query CU のみ調整可能で、12 CU を超えると Query CU と Replicas を個別に調整できます

**推奨:** 予測不能なトラフィックには動的スケーリングを使用し、規則的なトラフィックパターンにはスケジュールスケーリングを使用してください。両者は組み合わせて利用できます。

## より多くのクレジットと割引を取得する\{#get-more-credits-and-discounts}

技術的な最適化に加えて、Zilliz のプロモーションプログラムを十分に活用することも同様に重要です。

### クレジット\{#credits}

| チャネル | クレジット | 有効期間 | 備考 |
| --- | --- | --- | --- |
| 新規ユーザー登録 | &#36;100 クレジット | 30 日間 | すぐに利用可能、クレジットカード不要 |
| 支払い方法の追加 | — | 1 年に延長 | 支払い方法を追加すると、未使用のクレジットは自動的に延長されます |
| Recycle Bin | 無料 | — | 削除済みデータは Recycle Bin 内にある間は課金されません |

**推奨:** 初回登録後できるだけ早く支払い方法を追加し、&#36;100 クレジットの有効期間を 30 日から 1 年に延長してください。これにより、技術評価に十分な時間を確保できます。

### 専用プログラム\{#dedicated-programs}

| プログラム | 対象者 | 申し込み方法 |
| --- | --- | --- |
| Zilliz AI Startup Program | アーリーステージのスタートアップ | [公式サイト](https://zilliz.com/zilliz-for-startups) から申し込むと、追加のクレジットと技術サポートを受けられます |
| AI Agent Program | AI Agent 開発者 | AI Agent アプリケーションを構築する開発者向けの専用クレジット。近日公開予定です。 |

### エンタープライズのお客様\{#enterprise-customers}

- **カスタム見積もりについて営業に問い合わせる:** エンタープライズのお客様は年間サブスクリプションを通じて割引を受けられます。具体的な価格については、[営業にお問い合わせ](https://zilliz.com/contact-sales) ください。

- **Cloud Marketplace サブスクリプション:** [AWS](./subscribe-on-aws-marketplace)、[Google Cloud](./subscribe-on-gcp-marketplace)、[Azure](./subscribe-on-azure-marketplace) Marketplace 経由でサブスクライブすると、Zilliz Cloud の料金をクラウド請求書にまとめ、既存のエンタープライズ割引を適用できます。

- **前払い:** [advance pay](./advance-pay) を通じてアカウントに入金できます。控除の優先順位は、クレジット > advance pay > Cloud Marketplace サブスクリプション/クレジットカードです。予算管理要件のある組織に適しています。

## 使用状況ページを監視する\{#monitor-usage-page}

最適化は一度きりの取り組みではありません。Zilliz Cloud は多次元のコスト分析ツールを提供し、支出を継続的に追跡して最適化できるよう支援します。

### 視覚化されたコスト分析\{#visualized-cost-analysis}

**Billing > Usage** ページでは、請求を 5 つのディメンションで分類して確認できます。

| **ディメンション** | **目的** |
| --- | --- |
| Project | 異なる事業ラインや部門間で使用量を比較する |
| Cluster | どのクラスターが主要なコスト要因になっているかを特定する |
| Time Period | 日単位の傾向を確認し、異常な変動を検出する |
| Cost Type | 請求カテゴリ別に料金を内訳表示する |
| Cloud Region | 複数リージョン展開におけるリージョン間コストを比較する |

複数のディメンションはフィルターとして組み合わせることができます。たとえば、特定のプロジェクトにおける直近 7 日間の CU コストを選択すると、その事業ラインの計算コストの推移を正確に把握できます。

詳細については、[コストの分析](./analyze-cost) を参照してください。

### RESTful API\{#restful-api}

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API は、小数点以下最大 8 桁の精度で使用量データを提供し、内部の FinOps ワークフローにプログラム的に統合して以下を実現できます。

- コストレポートを自動生成する

- 社内の予算管理システムと統合する

- カスタムアラートルールを設定する

### 使用状況アラート\{#usage-alerts}

[コストメトリクス](./metrics-alerts-reference#organization-level-metrics) を監視し、異常な支出を早期に検知するためのアラートしきい値を設定することを推奨します。特に以下のシナリオでは重要です。

- 新たに起動したクラスターで、実際のコストが想定どおりかを確認する

- 動的スケーリングを構成した後に、スケーリングが正しく機能していることを確認する

- 新しいチームメンバーが不要なリソースを作成している可能性がある場合

## コスト最適化チェックリスト\{#cost-optimization-checklist}

そのまま実行できるチェックリスト:

**選定フェーズ**

**インデックス構成**

**クエリ最適化**

**運用フェーズ**

**請求最適化**

## まとめ\{#summary}

Zilliz Cloud におけるコスト最適化は、単一のパラメータを調整することではありません。選定、構成、クエリ、運用、請求にまたがるシステム全体での取り組みです。最も効果の高い最適化は次のとおりです。

1. **まず容量最適化クラスターを選択する** — これは「ダウングレード」ではありません。これはコスト効率のために特別に設計された階層型ストレージアーキテクチャであり、パフォーマンス最適化クラスターの 1/3 の単価で、90% 以上の本番ユースケースをカバーします。

1. **クエリパターンを最適化する** — スカラー フィールドにインデックスを作成し、TopK を制御し、返却フィールドを絞り、Partition Keys を使用します。これらはいずれもクエリごとのコストを大きく削減します。

1. **エラスティックスケーリングを活用する** — アイドルリソースへの支払いを止め、30～40% を節約できます。

1. **ビルドレベルを調整する** — 同じ CU に 40% 多くのデータを保存できます。

適切に実施すれば、ほとんどのユーザーはビジネス要件を満たしながらコストを十分に妥当な範囲内に抑えることができ、さらにストレージ階層化、インデックス最適化、エラスティックスケジューリングにおける Zilliz Cloud の技術的な利点も享受できます。
