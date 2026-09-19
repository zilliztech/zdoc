---
title: "コスト最適化 | Cloud"
slug: /cost-optimization
sidebar_label: "コスト最適化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ規模の拡大とクエリ量の増加に伴い、コスト管理が重要になります。このガイドでは、デプロイ方式の選択、インデックスの調整、弾性スケーリング、割引、請求分析という 5 つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。 | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コスト最適化

データ規模の拡大とクエリ量の増加に伴い、コスト管理が極めて重要になります。このガイドでは、デプロイ方式の選択、インデックスの調整、弾性スケーリング、割引、請求分析という 5 つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。

## 請求内容を理解する\{#understand-your-bill}

最適化を行う前に、コストがどこで発生しているかを特定します。Zilliz Cloud の料金は、次の 5 つの要素で構成されています。

| 項目 | 説明 | 最適化可能？ |
| --- | --- | --- |
| [Compute (CU)](./dedicated-cluster-cost) | Compute Unit に基づく Dedicated クラスターの時間課金。 | 選択 + スケーリング |
| [Read/Write Operations](./serverless-cluster-cost) | Serverless クラスターの従量課金。 | クエリ最適化 |
| [Storage](./storage-cost) | データとバックアップのストレージ（クラスターの状態に関係なく課金）。 | 構築レベル + データのクリーンアップ |
| [Data Transfer](./data-transfer-cost) | 受信、送信、およびリージョン間の転送。 | アーキテクチャ設計 |
| [Audit Logs](./audit-log-cost) | 監査ログ記録のためのリソース消費。 | 必要に応じて有効化 |

ほとんどのユーザーにおいて、コストの 70% 超は **Compute** に由来しており、ここが最も最適化の余地が大きい領域でもあります。

[料金計算ツール](https://zilliz.com/pricing#calculator) を使用すると、ベクトル次元数、データ量、QPS 要件に基づいた月額の見積もりを確認できます。実際のコストは見積もりより低くなることが多く、これは業務負荷が常にピーク容量に張り付き続けることはほとんどないためです。

## 適切なデプロイ方式を選ぶ\{#choose-the-right-deployment-method}

適切なデプロイ方式の選択は、最も影響の大きい意思決定です。誤った方式を選択すると、小さな最適化では埋め合わせられないコストにつながる可能性があります。

### デプロイ方式の一覧\{#deployment-methods-at-a-glance}

| 種類 | 価格目安（768 次元） | 容量/CU | 検索 QPS | レイテンシ | ユースケース |
| --- | --- | --- | --- | --- | --- |
| Free | 0 | 5 GB、コレクション 5 個以下 | — | — | 学習、プロトタイピング |
| Serverless | RU 従量課金 | 自動スケーリング | 自動 | 中 | 不安定なトラフィック、Dev/Test |
| Dedicated (Performance-optimized) | &#126;&#36;65/M ベクトル/mo | 2M/CU | 500–1,500 | 低（&lt;10ms p99） | レイテンシ重視の本番環境 |
| Dedicated (Capacity-optimized) | &#126;&#36;20/M ベクトル/mo | 8M/CU | 100–300 | 中 | 大規模、コスト重視 |
| Dedicated (Tiered-storage) | &#126;&#36;7/M ベクトル/mo | 40M/CU（≥8 CU） | 100–150（Hot） | 高 | 大量データ、cold/hot 分離 |
| BYOC | カスタム | カスタム | カスタム | カスタム | コンプライアンス、Cloud 割引 |

### 選択の意思決定ツリー\{#selection-decision-tree}

- **データが 100 万ベクトル未満、QPS が 50 未満？**<br/>
  → **Serverless** を使用します。アイドル時のコストがゼロで、操作した分だけを支払います。「将来的な」トラフィックのために Dedicated リソースをプロビジョニングしないでください。

- **データが 100 万–5,000 万ベクトルで、安定した低レイテンシが必要？**<br/>
  → **Capacity-optimized** クラスターが最も費用対効果の高いソリューションです。performance-optimized オプションと比べて 3 倍安く、100 ミリ秒未満のレイテンシを提供するため、ほとんどの RAG やレコメンデーションのシナリオには十分すぎるほどです。**performance-optimized** クラスターは、極端な要件（例: &lt;10 ms p99 のリアルタイム検索）にのみ使用してください。

- **データが 5,000 万ベクトル超で、アクセス頻度が低い？**<br/>
  → **Tiered-storage** クラスターを使用します。capacity-optimized オプションと比べて 3 倍安く、大量のデータのうち一部のみが頻繁にクエリされるシナリオ（例: 履歴ログの分析）に最適です。

- **コンプライアンス要件がある、または既存の Cloud Discounts (RI/SP) を利用している？**<br/>
  → **BYOC（Bring Your Own Cloud）**。クラスターはお客様の VPC 内で実行されるため、エンタープライズレベルの Cloud 割引を活用しながら、データ主権の要件も満たせます。

### 推奨: Capacity-optimized がほとんどのシナリオに最適\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

Capacity-optimized クラスターは、単に「低速な」バージョンだと誤解されることがよくあります。しかし実際には、Zilliz Cloud で最もアーキテクチャが洗練された製品です。

従来のベクトルデータベースがすべてのインデックスと生データをメモリに保持し、速度と引き換えにコストを犠牲にしているのに対し、Capacity-optimized クラスターは **階層型ストレージアーキテクチャ** を採用しています。

- **階層型ストレージ:** ベクトルインデックスは速度のためにメモリ内に保持され、スカラーデータと生ベクトルはインテリジェントキャッシュを備えた mmap によってディスクにマッピングされます。これにより、performance-optimized クラスターと比べて CU あたり 3 倍のデータ密度を実現できます。

- **DiskANN レベルの最適化:** IVF インデックスはディスクに優しいアクセスに合わせて調整されており、NVMe SSD でスループットを最大化しながら 10–50ms のレイテンシを維持します。これはほとんどの AI アプリケーションにとって無視できるレベルです。

- **高いリソース利用率:** performance-optimized クラスターはしばしば 30% の余裕を確保しますが、capacity-optimized クラスターは 90% 以上のデータ密度に達することができます。

**まとめ:** performance-optimized オプションはハードウェアで速度を買い、capacity-optimized オプションはテクノロジーで効率を買います。

### プロジェクトプラン: Standard vs. Enterprise vs. Business Critical\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud では、機能とスケーリングの上限に影響するいくつかのプランを提供しています。

| 機能 | Standard | Enterprise | Business Critical |
| --- | --- | --- | --- |
| 最大 CU | 32 CU | 256 CU | 512 CU |
| レプリカの上限 | Query CU × レプリカ ≤ 32 | Query CU × レプリカ ≤ 256 | Query CU × レプリカ ≤ 512 |
| SLA | 0.999 | 0.9995 | 0.9999 |
| マルチ AZ | シングル AZ | オプション | デフォルトで有効 |
| RBAC | 基本 | カスタムロール + 監査 | フル + SOC2/HIPAA |
| BYOC | 非対応 | 対応 | 対応 |
| サポート | チケット | SA + Slack | 24/7 + 15 分以内の応答 |

詳細については、[詳細なプラン比較](./select-zilliz-cloud-service-plans) を参照してください。

**アドバイス:** まずは **Standard** から始めてください。より高い SLA、マルチ AZ、またはより大規模な構成が必要な場合にのみ **Enterprise** にアップグレードします。アップグレードはシームレスで、データ移行は不要です。

### よくある落とし穴\{#common-pitfalls}

1. **デフォルトで Performance-optimized クラスターを選択してしまう:** 多くのユーザーは、PoC で使用した Performance-optimized クラスターを基準に予算を立てます。しかし capacity-optimized は「ダウングレード」されたバージョンではなく、コスト効率のために専用に設計されたアーキテクチャです。performance-optimized クラスターのわずか 1/3 のコストで、ほとんどのシナリオに十分な QPS を提供します。

1. **Tiered-storage オプションを見落とす:** Performance-optimized クラスターの 1/9 のコストで利用できる tiered-storage クラスターは、hot/cold のアクセスパターンが明確なデータに最適です。低レイテンシを必要とするデータがごく一部である場合、tiered-storage オプションはコストを桁単位で削減できます。

1. **小規模な用途で Dedicated を使用する:** 小規模なデータセットや不安定なトラフィックには、Serverless（従量課金）の方が Dedicated よりもはるかに費用対効果が高くなります。「エンタープライズ向け」という見た目だけでリソースを過剰にプロビジョニングすることは避けてください。

## インデックスとストレージの最適化\{#index-and-storage-optimization}

方式を選択したら、各 CU の利用率を最大化するようにパラメータを調整します。

### インデックスの構築レベル: 容量 vs. 再現率\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ パラメータ ](./tune-index-build-level) は、インデックスの精度とストレージ密度を制御します。極端な再現率を必要としないシナリオでは、これを下げることで各 CU のストレージ容量を大幅に増やすことができます。

- **Performance-optimized クラスター（768 次元、CU あたり）:**

    | 構築レベル | 容量 | 増加率 | 再現率 | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 2.1M | 0.4 | 90–95% | &#126;2,850 |
    | Balanced (1) Default | 1.5M | Baseline | 91–97% | &#126;3,500 |
    | Precision-first (2) | 1.0M | -0.33 | 92–98% | &#126;3,000 |

- **Capacity-optimized クラスター（768 次元、CU あたり）:**

    | 構築レベル | 容量 | 増加率 | 再現率 | QPS |
    | --- | --- | --- | --- | --- |
    | Capacity-first (0) | 7M | 0.4 | 89–97% | &#126;300 |
    | Balanced (1) Default | 5M | Baseline | 93–98% | &#126;350 |
    | Precision-first (2) | 3M | -0.4 | 94–98% | &#126;345 |

**ケーススタディ:** 16 CU の capacity-optimized クラスターは、デフォルトで 80M ベクトルを保持します。`Capacity-first` に切り替えると、これが 112M に増加し、あるいは同じ 80M ベクトルを 12 CU に収めることができるため、**CU コストを 25% 削減**できます。

<Admonition type="info" title="Note">

`build_level` パラメータは、一度設定すると変更できません。変更するにはインデックスを削除して再作成する必要があります。コレクションを作成する前に要件を評価することをお勧めします。このパラメータは浮動小数点ベクトル型（FLOAT_VECTOR、FLOAT16_VECTOR、BFLOAT16_VECTOR）のみをサポートします。

</Admonition>

### 検索レベル: パフォーマンス vs. コスト\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ パラメータ ](./tune-recall-rate)（1–10）は、検索精度を制御します。

- **Level 1–3:** ほとんどのシナリオに最適です（再現率 90–95%）。

- <strong>Level 4–7:</strong> 高精度が求められるシナリオ向けです。レイテンシが約 2–3 倍になる代わりに、再現率 95–98% を得られます。

- **Level 8–10:** 高リスクなシナリオ（例: 医療、不正検知）向けの極めて高い精度ですが、レイテンシと計算コストが大幅に増加します。

**アドバイス:** `enable_recall_calculation=true` を使用して再現率を測定し、ビジネス要件を満たす最も低いレベルを見つけてください。レベルを 1 つ上げるごとに、検索で消費される計算リソースが増加します。Serverless クラスターでは、これが直接 Read vCU コストの増加につながります。Dedicated クラスターでは、同じ CU 割り当てでサポートできる QPS が低下することを意味します。

### Mmap 設定: メモリとディスクのバランス\{#mmap-configuration-balancing-memory-and-disk}

[メモリマッピング（mmap）](./use-mmap) は、データをメモリからディスクへオフロードします。

| クラスターの種類 | デフォルトの MMAP ポリシー | 効果 |
| --- | --- | --- |
| Dedicated (Performance-optimized) | 生ベクトルデータのみが mmap を使用し、スカラーデータとすべてのインデックスはメモリ内に保持される | 低レイテンシを保証 |
| Dedicated (Capacity-optimized) | スカラーインデックス + すべての生データが mmap を使用し、ベクトルインデックスのみがメモリ内に保持される | 容量を最大化 |
| Free / Serverless | すべてのフィールドとインデックスが mmap を使用 | システムキャッシュに依存 |

**最適化の推奨事項:**

- Performance-optimized クラスターでは、スカラーフィルタリングがボトルネックになっていない場合は、ベクトルインデックス用のメモリを解放するために、スカラーフィールドで mmap を有効にすることを検討してください。

- Capacity-optimized クラスターでは、デフォルトのポリシーがすでにストレージ優先であるため、通常は追加の調整は不要です。

<Admonition type="info" title="Note">

mmap 設定を変更する前にコレクションを解放し、その後で再度ロードする必要があります。設定を誤るとパフォーマンスの低下や OOM エラーが発生する可能性があるため、まずテスト環境で検証してください。

</Admonition>

## クエリ最適化\{#query-optimization}

効率的なクエリは、Serverless ユーザーの Read Unit（RU）コストを削減し、Dedicated CU の QPS を向上させます。

### スカラーフィールドにインデックスを作成する\{#index-scalar-fields}

多くのユーザーは、[BITMAP](./bitmap-index-type) などのインデックスタイプを使用したスカラーインデックスの作成を怠っています。これがないと、フィルタ（例: `category == "electronics"` や `timestamp > 1700000000`）が **コレクション全体のスキャン** を引き起こし、非常に高コストになります。頻繁にフィルタリングされるスカラーフィールドにはインデックスを作成できます。

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

- `filter` 式に出現するすべてのスカラーフィールドにインデックスを作成します。Zilliz Cloud は適切なインデックスタイプ（文字列には inverted インデックス、数値には sorted インデックスなど）を自動的に選択します。

- スカラーインデックスのメモリオーバーヘッドは最小限ですが、フィルタリング性能を桁違いに向上させ、テーブル全体のスキャンをインデックス参照に変えます。

- **重要:** 特に capacity-optimized クラスターでのフィルタ付きベクトル検索では、スカラーインデックスの有無が、クエリのレイテンシがミリ秒単位になるか秒単位になるかを直接左右します。

### 適切な TopK の選択\{#select-appropriate-topk}

[TopK](./single-vector-search) は、計算とネットワークのオーバーヘッドに直接影響します。

| TopK | 相対レイテンシ | 相対 RU コスト（Serverless） | 一般的なユースケース |
| --- | --- | --- | --- |
| 1–10 | Baseline | 1x | RAG（通常 3–5 個のコンテキストチャンク） |
| 10–50 | 1.2–1.5x | 1.5–2x | レコメンデーションシステム、検索結果ページ |
| 50–200 | 1.5–3x | 2–4x | 候補セットの生成、リランキングの入力 |
| 200–1000 | 3–10x | 4–10x | バッチ分析、クラスタリング |

- **RAG:** TopK 3–10 を使用します。コンテキストを増やしても LLM の品質が向上することはほとんどなく、トークンと RU を無駄にします。

- **レコメンデーション:** リランキングモデルの上限（通常 20–50）を使用します。

- **大きな TopK:** 1 回のリクエストで大量の結果セットを返す代わりに、[ページネーション](./single-vector-search#use-limit-and-offset)（`offset` + `limit`）または [イテレーター](./with-iterators) を使用します。

### 出力フィールドの絞り込み\{#refine-output-fields}

デフォルトでは、以下に示すように、検索はすべてのスカラーフィールドを返します。

```python
results = collection.search(vectors, "embedding", search_params, limit=10)
```

ただし、クエリのたびに大きなテキストフィールド（例: ドキュメントの全文）を返すと、レイテンシと RU コストが増加します。そのため、必要な出力フィールドのみを指定できます。

```python
results = collection.search(
    vectors, "embedding", search_params, limit=10,
    output_fields=["id", "title", "category"]  # 不要返回 "content" 等大字段
)
```

詳細については、[出力フィールドの使用](./single-vector-search#use-output-fields) を参照してください。

**最適化の推奨事項:**

- 常に `output_fields` を明示的に指定し、ビジネスロジックで必要なフィールドのみを返します。

- RAG のシナリオで元のテキストが必要な場合は、まずベクトル検索で ID を取得し、その後 ID を使用して外部ストレージ（例: Redis、データベース）からソースコンテンツを取得することを検討してください。これにより、ベクトル検索を高速に保ちながら、外部ストレージ側ではキャッシュの利点を活用できます。

- Serverless モードでは、返されるデータ量が Read vCU の課金に直接影響します。不要なフィールドを減らすことが、コストを削減する最も簡単な方法です。

### Partition Key を活用する\{#utilize-partition-keys}

[Partition Key](./use-partition-key) は、スカラー値に基づいてデータを自動的にパーティションに分散し、検索が無関係なデータをスキップできるようにします。

次の例は、コレクションを作成するときにパーティションキーを指定する方法を示しています。

```python
schema.add_field("tenant_id", DataType.VARCHAR, max_length=128, is_partition_key=True)
```

**ユースケース:**

- **マルチテナント SaaS:** `tenant_id` をパーティションキーとして使用すると、各テナントのクエリが自分のデータパーティションのみをスキャンするようになり、QPS とレイテンシの両方が大幅に改善されます。

- **カテゴリのフィルタリング:** `category` をパーティションキーとして使用すると、特定のカテゴリ内で検索するときにデータセット全体をスキャンする必要がなくなります。

**パフォーマンスの向上:** データが均等に分散された 100 テナントを想定した場合、パーティションキーを使用することでクエリあたりのスキャン量を約 99% 削減できます。分布が均等でない場合でも、通常、スキャン量は 50–90% 削減されます。

## 弾性スケーリング\{#elastic-scaling}

Dedicated クラスターにおける最大のコストの罠は、「ピーク負荷に合わせてプロビジョニングし、24 時間 365 日稼働させ続けること」です。Zilliz Cloud は、このパターンを打破する 3 つのスケーリング戦略を提供しています。

### Auto-scaling\{#auto-scaling}

最小 CU 値と最大 CU 値を設定すると、システムがリアルタイムの負荷に基づいて自動的にスケールします。

- Query CU は CU Capacity メトリクスに基づいて自動的にスケールします（データ量に基づく）

- レプリカは CU Computation メトリクスに基づいて自動的にスケールします（QPS に基づく）

**典型的なシナリオ:** 日中のピーク時には 32 CU を必要とするものの、夜間は 8 CU しか必要としない E コマースの検索サービスを想定します。オートスケーリング構成で min=8、max=32 を設定すると、オフピーク時間帯にはシステムが自動的に 8 CU までスケールダウンします。1 日あたり 10 時間がオフピークであると仮定すると、月間の Compute コストを約 30–40% 削減できます。

詳細については、[Auto-scaling](./auto-scaling) を参照してください。

### スケジュールスケーリング\{#scheduled-scaling}

トラフィックパターンが予測可能なワークロードに適しています。Basic モード（単純なセレクター）と Advanced モード（Unix cron 式）をサポートします。

**典型的な構成:**

- 平日の 9:00 に 32 CU までスケールアップし、22:00 に 8 CU までスケールダウンします。

- 週末は終日 8 CU を維持します。

- 月末のプロモーション期間に向けて事前にスケールします。

詳細については、[スケジュールスケーリング](./scheduled-scaling) を参照してください。

### 手動スケーリング\{#manual-scaling}

最も単純な選択肢も見落とさないでください。ワークロードが閑散期（例: プロジェクトの合間やオフシーズン）に入ったら、CU 構成を積極的に縮小します。多くのユーザーは PoC の後にスケールダウンすることを忘れ、数週間、場合によっては数か月分の不要な容量に対して支払い続けてしまいます。

詳細については、[手動スケーリング](./manual-scaling) を参照してください。

### スケーリングの制約\{#scaling-constraints}

- Query CU × レプリカ ≤ 10,240

- レプリカが 1 より大きい場合、クラスターを 12 CU 未満にスケールすることはできません

- スケールダウンする場合、データ量は新しい CU 容量の 80% 未満である必要があります

- 12 CU 未満では Query CU のみを調整できます。12 CU 以上では Query CU とレプリカを個別に調整できます。

**推奨:** 予測できないトラフィックには動的スケーリングを、規則的なトラフィックパターンにはスケジュールスケーリングを使用します。この 2 つは組み合わせることができます。

## より多くのクレジットと割引を取得する\{#get-more-credits-and-discounts}

技術的な最適化に加えて、Zilliz のプロモーションプログラムを最大限に活用することも同様に重要です。

### クレジット\{#credits}

| チャネル | クレジット | 有効期間 | 備考 |
| --- | --- | --- | --- |
| 新規ユーザー登録 | &#36;100 クレジット | 30 日間 | すぐに利用可能、クレジットカードは不要 |
| 支払い方法の追加 | — | 1 年間に延長 | 支払い方法を追加すると、未使用のクレジットが自動的に延長されます |
| Recycle Bin | 無料 | — | 削除されたデータは、Recycle Bin にある間は課金されません |

**推奨:** 初回登録後はできるだけ早く支払い方法を追加して、&#36;100 クレジットの有効期間を 30 日間から 1 年間に延長してください。これにより、技術評価に十分な時間を確保できます。

### Dedicated プログラム\{#dedicated-programs}

| プログラム | 対象 | 申請方法 |
| --- | --- | --- |
| Zilliz AI Startup Program | アーリーステージのスタートアップ | [公式ウェブサイト](https://zilliz.com/zilliz-for-startups) から申請すると、追加のクレジットと技術サポートを受けられます |
| AI Agent Program | AI Agent の開発者 | AI Agent アプリケーションを開発する開発者向けの専用クレジット。近日公開予定。 |

### エンタープライズのお客様\{#enterprise-customers}

- <strong>カスタム見積もりについては営業にお問い合わせください:</strong> エンタープライズのお客様は、年間サブスクリプションを通じて割引を受けられます。具体的な価格については、[営業にお問い合わせ](https://zilliz.com/contact-sales) ください。

- **Cloud Marketplace のサブスクリプション:** [AWS](./subscribe-on-aws-marketplace)、[Google Cloud](./subscribe-on-gcp-marketplace)、[Azure](./subscribe-on-azure-marketplace) Marketplace 経由でサブスクライブすると、Zilliz Cloud の料金をクラウドの請求書にまとめ、既存のエンタープライズ割引を適用できます。

- **前払い:** [Advance Pay](./advance-pay) でアカウントに入金します。差し引きの優先順位は、クレジット > Advance Pay > cloud marketplace subscriptions/credit cards です。予算管理の要件がある組織に適しています。

## 使用状況ページの監視\{#monitor-usage-page}

最適化は一度きりの取り組みではありません。Zilliz Cloud は多次元のコスト分析ツールを提供し、支出を継続的に追跡して最適化できるようにします。

### 可視化されたコスト分析\{#visualized-cost-analysis}

**Billing > Usage** ページでは、請求内容を 5 つのディメンションで分類して確認できます。

| **ディメンション** | **目的** |
| --- | --- |
| Project | 異なる事業部門や部署間で使用量を比較する |
| クラスター | 主なコスト要因となっているクラスターを特定する |
| Time Period | 日単位の傾向を確認し、異常な変動を検出する |
| Cost Type | 請求カテゴリ別に料金を分類する |
| Cloud Region | マルチリージョン展開におけるリージョン間のコストを比較する |

複数のディメンションはフィルターとして組み合わせることができます。たとえば、特定のプロジェクトの直近 7 日間の CU コストを選択すると、その事業部門の Compute コストの推移を正確に把握できます。

詳細については、[コストの分析](./analyze-cost) を参照してください。

### RESTful API\{#restful-api}

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API は、小数点以下最大 8 桁の精度で使用状況データを提供し、社内の FinOps ワークフローにプログラムから統合して次のことを実現できます。

- コストレポートを自動的に生成できます。

- 社内の予算管理システムと統合できます。

- カスタムのアラートルールを設定できます。

### 使用状況アラート\{#usage-alerts}

[コストメトリクス](./metrics-alerts-reference#organization-level-metrics) を監視し、異常な支出を早期に検知できるようにアラートしきい値を設定することを推奨します。特に次のシナリオが重要です。

- 新しく起動したクラスターで、実際のコストが想定どおりであることを確認する場合。

- 動的スケーリングを構成した後に、スケーリングが正しく機能していることを確認する場合。

- 新しいチームメンバーが不要なリソースを作成した可能性がある場合。

## コスト最適化チェックリスト\{#cost-optimization-checklist}

そのまま実行できるチェックリストです。

**選定フェーズ**

**インデックス構成**

**クエリ最適化**

**運用フェーズ**

**請求の最適化**

## まとめ\{#summary}

Zilliz Cloud のコスト最適化は、単一のパラメータを調整することではありません。選定、構成、クエリ、運用、請求にまたがるシステム全体での取り組みです。最も効果の高い最適化は次のとおりです。

1. **まず Capacity-optimized クラスターを選択する** — これは「ダウングレード」ではありません。コスト効率のために特別に設計された階層型ストレージアーキテクチャであり、単価は performance-optimized クラスターの 1/3 で、本番ユースケースの 90% 以上をカバーします。

1. **クエリパターンを最適化する** — スカラーフィールドにインデックスを作成し、TopK を制御し、返されるフィールドを絞り、Partition Key を使用します。これらはいずれもクエリあたりのコストを大幅に削減します。

1. **弾性スケーリングを活用する** — アイドル状態のリソースへの支払いをなくし、30–40% を節約できます。

1. **構築レベルを調整する** — 同じ CU に 40% 多くのデータを保存できます。

適切に実施すれば、ほとんどのユーザーはビジネス要件を満たしながらコストを妥当な範囲に十分収められ、さらにストレージの階層化、インデックスの最適化、弾性スケジューリングという Zilliz Cloud の技術的な利点を活用できます。
