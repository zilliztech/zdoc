---
title: "コスト最適化 | Cloud"
slug: /cost-optimization
sidebar_key: cost-optimization
sidebar_label: "コスト最適化"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "データ規模とクエリ量が増えるにつれて、コスト管理は重要になります。このガイドでは、デプロイ方法の選択、インデックス調整、エラスティックスケーリング、割引、請求分析という5つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。 | Cloud"
type: origin
token: MYHwwhKtri4MMJku6BbcMjF4n1d
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - milvus
  - コスト最適化

---

import Admonition from '@theme/Admonition';


# コスト最適化

データ規模とクエリ量が増えるにつれて、コスト管理は重要になります。このガイドでは、デプロイ方法の選択、インデックス調整、エラスティックスケーリング、割引、請求分析という5つの観点から、Zilliz Cloud のコスト最適化戦略を体系的に説明します。

## 請求内容を理解する\{#understand-your-bill}

最適化を始める前に、コストがどこから発生しているかを把握してください。Zilliz Cloud の料金は、次の5つの要素で構成されます。

<table>
    <tr>
        <th><p>項目</p></th>
        <th><p>説明</p></th>
        <th><p>最適化可能か</p></th>
    </tr>
    <tr>
        <td><p><a href="./dedicated-cluster-cost">Compute (CU)</a></p></td>
        <td><p>Compute Units に基づく Dedicated クラスターの時間単位課金。</p></td>
        <td><p>選択 + スケーリング</p></td>
    </tr>
    <tr>
        <td><p><a href="./serverless-cluster-cost">Read/Write Operations</a></p></td>
        <td><p>Serverless クラスターの従量課金。</p></td>
        <td><p>クエリ最適化</p></td>
    </tr>
    <tr>
        <td><p><a href="./storage-cost">Storage</a></p></td>
        <td><p>データとバックアップのストレージ（クラスターの状態に関係なく発生）。</p></td>
        <td><p>Build Level + データクリーンアップ</p></td>
    </tr>
    <tr>
        <td><p><a href="./data-transfer-cost">Data Transfer</a></p></td>
        <td><p>受信、送信、リージョン間転送。</p></td>
        <td><p>アーキテクチャ計画</p></td>
    </tr>
    <tr>
        <td><p><a href="./audit-log-cost">Audit Logs</a></p></td>
        <td><p>監査ログ記録によるリソース消費。</p></td>
        <td><p>必要に応じて有効化</p></td>
    </tr>
</table>

ほとんどのユーザーでは、コストの70%以上が **Compute** に由来し、最適化の余地も最も大きくなります。

[料金計算ツール](https://zilliz.com/pricing#calculator)を使用すると、ベクトル次元数、データ量、QPS 要件に基づいて月額見積もりを取得できます。実際のコストは見積もりより低くなることが多く、これはビジネス負荷が常にピーク容量に張り付くことはまれだからです。

## 適切なデプロイ方法を選択する\{#choose-the-right-deployment-method}

適切なデプロイ方法の選択は、最も大きな影響を持つ意思決定です。誤った方法を選ぶと、小さな最適化では埋められないコスト差が生じる可能性があります。

### デプロイ方法の概要\{#deployment-methods-at-a-glance}

<table>
    <tr>
        <th><p>タイプ</p></th>
        <th><p>価格目安 (768-dim)</p></th>
        <th><p>容量/CU</p></th>
        <th><p>検索 QPS</p></th>
        <th><p>レイテンシ</p></th>
        <th><p>ユースケース</p></th>
    </tr>
    <tr>
        <td><p>Free</p></td>
        <td><p>0</p></td>
        <td><p>5 GB, ≤5 colls</p></td>
        <td><p>—</p></td>
        <td><p>—</p></td>
        <td><p>学習、プロトタイピング</p></td>
    </tr>
    <tr>
        <td><p>Serverless</p></td>
        <td><p>Pay-per-RU</p></td>
        <td><p>Auto-scaling</p></td>
        <td><p>Auto</p></td>
        <td><p>中程度</p></td>
        <td><p>不安定なトラフィック、開発/テスト</p></td>
    </tr>
    <tr>
        <td><p>Dedicated (Performance-optimized)</p></td>
        <td><p>~&#36;65/M vectors/mo</p></td>
        <td><p>2M/CU</p></td>
        <td><p>500–1,500</p></td>
        <td><p>低 (&lt;10ms p99)</p></td>
        <td><p>レイテンシ重視の本番環境</p></td>
    </tr>
    <tr>
        <td><p>Dedicated (Capacity-optimized)</p></td>
        <td><p>~&#36;20/M vectors/mo</p></td>
        <td><p>8M/CU</p></td>
        <td><p>100–300</p></td>
        <td><p>中程度</p></td>
        <td><p>大規模、コスト重視</p></td>
    </tr>
    <tr>
        <td><p>Dedicated (Tiered-storage)</p></td>
        <td><p>~&#36;7/M vectors/mo</p></td>
        <td><p>40M/CU (≥8 CU)</p></td>
        <td><p>100–150 (Hot)</p></td>
        <td><p>高め</p></td>
        <td><p>大量データ、コールド/ホット分離</p></td>
    </tr>
    <tr>
        <td><p>BYOC</p></td>
        <td><p>Custom</p></td>
        <td><p>Custom</p></td>
        <td><p>Custom</p></td>
        <td><p>Custom</p></td>
        <td><p>コンプライアンス、Cloud discounts</p></td>
    </tr>
</table>

### 選択の判断ツリー\{#selection-decision-tree}

- **データ < 1M vectors、QPS < 50?**
→ **Serverless** を使用します。アイドル時のコストはゼロで、操作分だけ支払います。「将来の」トラフィックのために Dedicated リソースをプロビジョニングしないでください。

- **データ 1M–50M vectors、安定した低レイテンシが必要?**
→ **Capacity-optimized** クラスターが最も費用対効果の高いソリューションです。Performance-optimized オプションより3倍安く、ほとんどの RAG やレコメンデーションのシナリオに十分なサブ100ミリ秒のレイテンシを提供します。**Performance-optimized** クラスターは、極端な要件（例: &lt;10 ms p99 のリアルタイム検索）の場合にのみ使用してください。

- **データ > 50M vectors、アクセス頻度が低い?**
→ **Tiered-storage** クラスターを使用します。Capacity-optimized オプションより3倍安く、データは大量でも頻繁にクエリされるのは一部だけというシナリオ（例: 履歴ログ分析）に適しています。

- **コンプライアンス要件または既存の Cloud Discounts (RI/SP) がある?**
→ **BYOC (Bring Your Own Cloud)**。クラスターはお客様の VPC 内で稼働するため、エンタープライズレベルのクラウド割引を活用し、データ主権要件を満たせます。

### 推奨: Capacity-optimized はほとんどのシナリオに最適\{#recommendation-capacity-optimizedthe-best-fit-for-most-scenarios}

Capacity-optimized クラスターは、単に「遅い」バージョンだと誤解されがちです。実際には、Zilliz Cloud の中で最もアーキテクチャ的に洗練された製品です。

従来のベクトルデータベースは、すべてのインデックスと生データをメモリに保持し、速度のためにコストを犠牲にします。一方、Capacity-optimized クラスターは **階層型ストレージアーキテクチャ** を使用します。

- **階層型ストレージ:** 速度を確保するためベクトルインデックスはメモリに保持し、スカラーデータと生ベクトルはインテリジェントなキャッシュを伴う mmap によってディスクへマップします。これにより、Performance-optimized クラスターと比べて CU あたり3倍のデータ密度を実現します。

- **DiskANN レベルの最適化:** IVF インデックスはディスクフレンドリーなアクセス向けに調整され、NVMe SSD でスループットを最大化しながら 10–50ms のレイテンシを維持します。これはほとんどの AI アプリケーションでは無視できる程度です。

- **高いリソース利用率:** Performance-optimized クラスターは30%のヘッドルームを維持することが多い一方、Capacity-optimized クラスターは90%以上のデータ密度に到達できます。

**まとめ:** Performance-optimized オプションはハードウェアで速度を買うものであり、Capacity-optimized オプションは技術で効率を買うものです。

### プロジェクトプラン: Standard vs. Enterprise vs. Business Critical\{#project-plans-standard-vs-enterprise-vs-business-critical}

Zilliz Cloud には、機能とスケーリング上限に影響する複数のプランがあります。

<table>
    <tr>
        <th><p>機能</p></th>
        <th><p>Standard</p></th>
        <th><p>Enterprise</p></th>
        <th><p>Business Critical</p></th>
    </tr>
    <tr>
        <td><p>最大 CU</p></td>
        <td><p>32 CU</p></td>
        <td><p>256 CU</p></td>
        <td><p>512 CU</p></td>
    </tr>
    <tr>
        <td><p>Replica 上限</p></td>
        <td><p>Query CU × Repl ≤ 32</p></td>
        <td><p>Query CU × Repl ≤ 256</p></td>
        <td><p>Query CU × Repl ≤ 512</p></td>
    </tr>
    <tr>
        <td><p>SLA</p></td>
        <td><p>0.999</p></td>
        <td><p>0.9995</p></td>
        <td><p>0.9999</p></td>
    </tr>
    <tr>
        <td><p>Multi-AZ</p></td>
        <td><p>Single AZ</p></td>
        <td><p>任意</p></td>
        <td><p>デフォルトで有効</p></td>
    </tr>
    <tr>
        <td><p>RBAC</p></td>
        <td><p>基本</p></td>
        <td><p>Custom Roles + Audit</p></td>
        <td><p>Full + SOC2/HIPAA</p></td>
    </tr>
    <tr>
        <td><p>BYOC</p></td>
        <td><p>非対応</p></td>
        <td><p>対応</p></td>
        <td><p>対応</p></td>
    </tr>
    <tr>
        <td><p>サポート</p></td>
        <td><p>Ticket</p></td>
        <td><p>SA + Slack</p></td>
        <td><p>24/7 + 15m Response</p></td>
    </tr>
</table>

詳細については、[プランの詳細比較](./select-zilliz-cloud-service-plans)を参照してください。

**アドバイス:** まずは **Standard** から始めてください。より高い SLA、Multi-AZ、またはより大きなスケールが必要になった場合にのみ、**Enterprise** へアップグレードします。アップグレードはシームレスで、データ移行は不要です。

### よくある落とし穴\{#common-pitfalls}

1. **Performance-optimized クラスターを既定として選ぶ:** 多くのユーザーは、PoC 中に使用した Performance-optimized クラスターを基準に予算を見積もります。しかし、Capacity-optimized は「ダウングレード版」ではなく、コスト効率のために専用設計されたアーキテクチャです。Performance-optimized クラスターのわずか1/3のコストで、ほとんどのシナリオに十分な QPS を提供します。

1. **Tiered-storage オプションを見落とす:** Performance-optimized クラスターの1/9のコストで利用できる Tiered-storage クラスターは、明確なホット/コールドのアクセスパターンを持つデータに最適です。低レイテンシが必要なのがデータのごく一部だけであれば、Tiered-storage オプションによってコストを一桁削減できます。

1. **小規模で Dedicated を使用する:** 小規模なデータセットや不安定なトラフィックでは、Serverless（従量課金）の方が Dedicated よりはるかに費用対効果に優れます。「エンタープライズらしく見せる」ためだけにリソースを過剰プロビジョニングすることは避けてください。

## インデックスとストレージの最適化\{#index-and-storage-optimization}

モードを選択したら、各 CU の有用性を最大化するためにパラメータを調整します。

### インデックスの Build Level: 容量 vs. リコール\{#index-build-level-capacity-vs-recall}

[`build_level`](./tune-index-build-level)[ パラメータ ](./tune-index-build-level)は、インデックスの精度とストレージ密度を制御します。極端に高いリコールを必要としないシナリオでは、これを下げることで各 CU のストレージ容量を大幅に増やせます。

- **Performance-optimized クラスター (768-dim、CU あたり):**

    <table>
        <tr>
            <th><p>Build Level</p></th>
            <th><p>容量</p></th>
            <th><p>増加</p></th>
            <th><p>リコール</p></th>
            <th><p>QPS</p></th>
        </tr>
        <tr>
            <td><p>Capacity-first (0)</p></td>
            <td><p>2.1M</p></td>
            <td><p>0.4</p></td>
            <td><p>90–95%</p></td>
            <td><p>~2,850</p></td>
        </tr>
        <tr>
            <td><p>Balanced (1) Default</p></td>
            <td><p>1.5M</p></td>
            <td><p>Baseline</p></td>
            <td><p>91–97%</p></td>
            <td><p>~3,500</p></td>
        </tr>
        <tr>
            <td><p>Precision-first (2)</p></td>
            <td><p>1.0M</p></td>
            <td><p>-0.33</p></td>
            <td><p>92–98%</p></td>
            <td><p>~3,000</p></td>
        </tr>
    </table>

- **Capacity-optimized クラスター (768-dim、CU あたり):**

    <table>
        <tr>
            <th><p>Build Level</p></th>
            <th><p>容量</p></th>
            <th><p>増加</p></th>
            <th><p>リコール</p></th>
            <th><p>QPS</p></th>
        </tr>
        <tr>
            <td><p>Capacity-first (0)</p></td>
            <td><p>7M</p></td>
            <td><p>0.4</p></td>
            <td><p>89–97%</p></td>
            <td><p>~300</p></td>
        </tr>
        <tr>
            <td><p>Balanced (1) Default</p></td>
            <td><p>5M</p></td>
            <td><p>Baseline</p></td>
            <td><p>93–98%</p></td>
            <td><p>~350</p></td>
        </tr>
        <tr>
            <td><p>Precision-first (2)</p></td>
            <td><p>3M</p></td>
            <td><p>-0.4</p></td>
            <td><p>94–98%</p></td>
            <td><p>~345</p></td>
        </tr>
    </table>

**ケーススタディ:** 16 CU の Capacity-optimized クラスターは、デフォルトで 80M vectors を保持できます。`Capacity-first` に切り替えると 112M まで増やせる、または同じ 80M vectors を 12 CU に収められるため、**CU コストを25%削減**できます。

<Admonition type="info" icon="📘" title="**注記**">

`build_level` パラメータは、一度設定すると変更できません。変更するには、インデックスを削除して再作成する必要があります。コレクションを作成する前に要件を評価することを推奨します。このパラメータは浮動小数点ベクトル型（FLOAT_VECTOR、FLOAT16_VECTOR、BFLOAT16_VECTOR）のみをサポートします。

</Admonition>

### Search Level: パフォーマンス vs. コスト\{#search-level-performance-vs-cost}

[`level`](./tune-recall-rate)[ パラメータ](./tune-recall-rate)（1–10）は検索精度を制御します。

- **Level 1–3:** ほとんどのシナリオに最適です（90–95% リコール）。

- **Level 4–7:** 高精度が必要なシナリオ向けです。95–98% リコールのために、おおよそ 2–3× のレイテンシと引き換えになります。

- **Level 8–10:** 医療や不正検知など、影響の大きいシナリオ向けの極めて高い精度です。ただし、レイテンシとコンピューティングコストが大幅に増加します。

**アドバイス:** `enable_recall_calculation=true` を使用してリコールを測定し、ビジネス要件を満たす最も低いレベルを見つけてください。レベルを上げるたびに検索で消費される計算リソースが増えます。Serverless クラスターでは Read vCU コストの上昇に直結し、Dedicated クラスターでは同じ CU 割り当てでサポート可能な QPS が低下します。

### Mmap 設定: メモリとディスクのバランス\{#mmap-configuration-balancing-memory-and-disk}

[Memory Mapping (mmap)](./use-mmap) は、データをメモリからディスクへオフロードします。

<table>
    <tr>
        <th><p>クラスタータイプ</p></th>
        <th><p>デフォルトの MMAP ポリシー</p></th>
        <th><p>効果</p></th>
    </tr>
    <tr>
        <td><p>Dedicated (Performance-optimized)</p></td>
        <td><p>生ベクトルデータのみ mmap を使用。スカラーデータとすべてのインデックスはメモリに保持</p></td>
        <td><p>低レイテンシを保証</p></td>
    </tr>
    <tr>
        <td><p>Dedicated (Capacity-optimized)</p></td>
        <td><p>スカラーインデックス + すべての生データが mmap を使用。ベクトルインデックスのみメモリに保持</p></td>
        <td><p>容量を最大化</p></td>
    </tr>
    <tr>
        <td><p>Free / Serverless</p></td>
        <td><p>すべてのフィールドとインデックスが mmap を使用</p></td>
        <td><p>システムキャッシュに依存</p></td>
    </tr>
</table>

**最適化の推奨事項:**

- Performance-optimized クラスターでは、スカラーフィルタリングがボトルネックでない場合、スカラーフィールドで mmap を有効にして、ベクトルインデックス用のメモリを解放することを検討してください。

- Capacity-optimized クラスターでは、デフォルトポリシーがすでにストレージ優先であるため、通常は追加の調整は不要です。

<Admonition type="info" icon="📘" title="**注記**">

mmap 設定を変更する前に Collection を release し、変更後に reload する必要があります。設定を誤るとパフォーマンス低下や OOM エラーが発生する可能性があるため、まずテスト環境で検証してください。

</Admonition>

## クエリ最適化\{#query-optimization}

効率的なクエリは、Serverless ユーザーの Read Unit (RU) コストを削減し、Dedicated CU の QPS を高めます。

### スカラーフィールドにインデックスを作成する\{#index-scalar-fields}

多くのユーザーは[スカラーインデックス](./index-scalar-fields)を見落としています。これがないと、フィルター（例: `category == "electronics"` または `timestamp > 1700000000`）によって **コレクション全体のスキャン** が発生し、非常に高コストになります。頻繁にフィルタリングされるスカラーフィールドにはインデックスを作成できます。

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

- `filter` 式に現れるすべてのスカラーフィールドにインデックスを作成してください。Zilliz Cloud は適切なインデックスタイプ（文字列には転置インデックス、数値にはソート済みインデックスなど）を自動的に選択します。

- スカラーインデックスのメモリオーバーヘッドは最小限ですが、フィルタリング性能を桁違いに改善します。フルテーブルスキャンをインデックスルックアップに変えられます。

- **重要:** 特に Capacity-optimized クラスターでフィルター付きベクトル検索を行う場合、スカラーインデックスの有無が、クエリレイテンシがミリ秒単位になるか秒単位になるかを直接左右します。

### 適切な TopK を選択する\{#select-appropriate-topk}

[TopK](./single-vector-search) は、計算とネットワークのオーバーヘッドに直接影響します。

<table>
    <tr>
        <th><p>TopK</p></th>
        <th><p>相対レイテンシ</p></th>
        <th><p>相対 RU コスト (Serverless)</p></th>
        <th><p>典型的なユースケース</p></th>
    </tr>
    <tr>
        <td><p>1–10</p></td>
        <td><p>Baseline</p></td>
        <td><p>1x</p></td>
        <td><p>RAG（通常 3–5 個のコンテキストチャンク）</p></td>
    </tr>
    <tr>
        <td><p>10–50</p></td>
        <td><p>1.2–1.5x</p></td>
        <td><p>1.5–2x</p></td>
        <td><p>レコメンデーションシステム、検索結果ページ</p></td>
    </tr>
    <tr>
        <td><p>50–200</p></td>
        <td><p>1.5–3x</p></td>
        <td><p>2–4x</p></td>
        <td><p>候補セット生成、リランキング入力</p></td>
    </tr>
    <tr>
        <td><p>200–1000</p></td>
        <td><p>3–10x</p></td>
        <td><p>4–10x</p></td>
        <td><p>バッチ分析、クラスタリング</p></td>
    </tr>
</table>

- **RAG:** TopK 3–10 を使用します。コンテキストを増やしても LLM の品質が改善することはまれで、トークンと RU を無駄にします。

- **レコメンデーション:** リランキングモデルの上限（通常は 20–50）を使用します。

- **大きな TopK:** 1回のリクエストで大量の結果セットを返すのではなく、[ページネーション](./single-vector-search#use-limit-and-offset)（`offset` + `limit`）または[イテレーター](./with-iterators)を使用します。

### 出力フィールドを絞り込む\{#refine-output-fields}

デフォルトでは、検索は以下のようにすべてのスカラーフィールドを返します。

```python
results = collection.search(vectors, "embedding", search_params, limit=10)
```

しかし、すべてのクエリで大きなテキストフィールド（例: ドキュメント全文）を返すと、レイテンシと RU コストが増加します。そのため、必要な出力フィールドのみを指定できます。

```python
results = collection.search(
    vectors, "embedding", search_params, limit=10,
    output_fields=["id", "title", "category"]  # 不要返回 "content" 等大字段
)
```

詳細については、[出力フィールドを使用する](./single-vector-search#use-output-fields)を参照してください。

**最適化の推奨事項:**

- 常に `output_fields` を明示的に指定し、ビジネスロジックで必要なフィールドのみを返してください。

- RAG シナリオで元のテキストが必要な場合は、まずベクトル検索で ID を取得し、その ID を使って外部ストレージ（Redis やデータベースなど）からソースコンテンツを取得することを検討してください。これにより、ベクトル検索を高速に保ちつつ、外部ストレージ側でキャッシュの恩恵を受けられます。

- Serverless モードでは、返されるデータ量が Read vCU の請求に直接影響します。不要なフィールドを減らすことが、コスト削減の最も簡単な方法です。

### Partition Key を活用する\{#utilize-partition-keys}

[Partition keys](./use-partition-key) は、スカラー値に基づいてデータを自動的にパーティションへ分散し、検索時に無関係なデータをスキップできるようにします。

次の例は、コレクション作成時に Partition Key を指定する方法を示しています。

```python
schema.add_field("tenant_id", DataType.VARCHAR, max_length=128, is_partition_key=True)
```

**ユースケース:**

- **マルチテナント SaaS:** `tenant_id` を Partition Key として使用すると、各テナントのクエリは自分のデータパーティションのみをスキャンするため、QPS とレイテンシの両方が大幅に改善します。

- **カテゴリフィルタリング:** `category` を Partition Key として使用すると、特定カテゴリ内を検索するときにデータセット全体をスキャンする必要がなくなります。

**パフォーマンス向上:** データが均等に分散した100テナントを想定すると、Partition Key を使用することでクエリあたりのスキャン量は約99%削減されます。分布に偏りがある場合でも、通常はスキャン量を50–90%削減できます。

## エラスティックスケーリング\{#elastic-scaling}

Dedicated クラスターにおける最大のコストの落とし穴は、「ピーク負荷に合わせてプロビジョニングし、それを24時間稼働し続ける」ことです。Zilliz Cloud は、このパターンを打破するために3つのスケーリング戦略を提供しています。

### 動的スケーリング\{#dynamic-scaling}

最小 CU 値と最大 CU 値を設定すると、システムがリアルタイム負荷に基づいて自動的にスケールします。

- Query CU は CU Capacity メトリクス（データ量に基づく）に応じて自動的にスケールします。

- Replicas は CU Computation メトリクス（QPS に基づく）に応じて自動的にスケールします。

**典型的なシナリオ:** 日中のピーク時には 32 CU が必要だが、夜間は 8 CU で足りる e コマース検索サービス。動的スケーリング設定で min=8、max=32 を設定すると、オフピーク時間帯にはシステムが自動的に 8 CU までスケールダウンします。1日あたり10時間のオフピーク時間を想定すると、月間のコンピュートコストを約30–40%削減できます。

詳細については、[動的スケーリング](./scale-query-cu#dynamic-scaling)を参照してください。

### スケジュールスケーリング\{#scheduled-scaling}

予測可能なトラフィックパターンを持つワークロードに適しています。Basic モード（簡単なセレクター）と Advanced モード（Unix cron 式）をサポートします。

**典型的な設定:**

- 平日の 9:00 に 32 CU へスケールアップし、22:00 に 8 CU へスケールダウン

- 週末は終日 8 CU を維持

- 月末のプロモーション期間に備えて事前にスケール

詳細については、[スケジュールスケーリング](./scale-query-cu#scheduled-scaling)を参照してください。

### 手動スケーリング\{#manual-scaling}

最もシンプルな選択肢を見落とさないでください。ワークロードが静かな期間（例: プロジェクト間やオフシーズン）に入ったら、CU 設定を積極的に減らしてください。多くのユーザーは PoC 後にスケールダウンを忘れ、不要な容量に対して何週間、場合によっては何か月も支払い続けています。

詳細については、[手動スケーリング](./scale-query-cu#manual-scaling)を参照してください。

### スケーリング制約\{#scaling-constraints}

- Query CU × Replica ≤ 10,240

- Replica > 1 の場合、クラスターは 12 CU 未満にスケールできません。

- スケールダウン時には、データ量が新しい CU 容量の80%未満である必要があります。

- 12 CU 未満では Query CU のみ調整できます。12 CU 以上では Query CU と Replicas を個別に調整できます。

**推奨:** 予測しにくいトラフィックには動的スケーリングを使用し、規則的なトラフィックパターンにはスケジュールスケーリングを使用してください。両方を組み合わせることもできます。

## Credits と割引をさらに活用する\{#get-more-credits-and-discounts}

技術的な最適化に加えて、Zilliz のプロモーションプログラムを最大限に活用することも同じくらい重要です。

### Credits\{#credits}

<table>
    <tr>
        <th><p>チャネル</p></th>
        <th><p>Credits</p></th>
        <th><p>有効期間</p></th>
        <th><p>備考</p></th>
    </tr>
    <tr>
        <td><p>新規ユーザー登録</p></td>
        <td><p>&#36;100 credits</p></td>
        <td><p>30日</p></td>
        <td><p>すぐに利用可能、クレジットカード不要</p></td>
    </tr>
    <tr>
        <td><p>支払い方法を追加</p></td>
        <td><p>—</p></td>
        <td><p>1年に延長</p></td>
        <td><p>支払い方法を追加すると、未使用の Credits は自動的に延長されます</p></td>
    </tr>
    <tr>
        <td><p>Recycle Bin</p></td>
        <td><p>Free</p></td>
        <td><p>—</p></td>
        <td><p>削除済みデータが Recycle Bin 内にある間は料金が発生しません</p></td>
    </tr>
</table>

**推奨:** 初回登録後、できるだけ早く支払い方法を追加し、&#36;100 credits の有効期間を30日から1年に延長してください。これにより、技術評価に十分な時間を確保できます。

### Dedicated プログラム\{#dedicated-programs}

<table>
    <tr>
        <th><p>プログラム</p></th>
        <th><p>対象ユーザー</p></th>
        <th><p>申請方法</p></th>
    </tr>
    <tr>
        <td><p>Zilliz AI Startup Program</p></td>
        <td><p>アーリーステージのスタートアップ</p></td>
        <td><p><a href="https://zilliz.com/zilliz-for-startups">公式ウェブサイト</a>から申請し、追加 Credits と技術サポートを受け取ります</p></td>
    </tr>
    <tr>
        <td><p>AI Agent Program</p></td>
        <td><p>AI Agent 開発者</p></td>
        <td><p>AI Agent アプリケーションを構築する開発者向けの専用 Credits。近日公開。</p></td>
    </tr>
</table>

### エンタープライズ顧客\{#enterprise-customers}

- **カスタム見積もりについて営業に問い合わせる:** エンタープライズ顧客は年間サブスクリプションを通じて割引を受けられます。具体的な料金については[営業にお問い合わせ](https://zilliz.com/contact-sales)ください。

- **Cloud Marketplace サブスクリプション:** [AWS](./subscribe-on-aws-marketplace)、[Google Cloud](./subscribe-on-gcp-marketplace)、[Azure](./subscribe-on-azure-marketplace) Marketplace 経由でサブスクライブすると、Zilliz Cloud の料金をクラウド請求に統合し、既存のエンタープライズ割引を適用できます。

- **Advance pay:** [advance pay](./advance-pay) でアカウントに入金します。控除の優先順位は、credits > advance pay > cloud marketplace subscriptions/credit cards です。予算管理要件がある組織に適しています。

## 使用状況ページを監視する\{#monitor-usage-page}

最適化は一度限りの作業ではありません。Zilliz Cloud は、支出を継続的に追跡して最適化するための多次元コスト分析ツールを提供しています。

### 可視化されたコスト分析\{#visualized-cost-analysis}

**Billing > Usage** ページでは、請求を5つのディメンションに分解できます。

<table>
   <tr>
     <th><p><strong>ディメンション</strong></p></th>
     <th><p><strong>目的</strong></p></th>
   </tr>
   <tr>
     <td><p>Project</p></td>
     <td><p>異なる事業ラインや部門間の使用量を比較</p></td>
   </tr>
   <tr>
     <td><p>Cluster</p></td>
     <td><p>どのクラスターが主なコスト要因かを特定</p></td>
   </tr>
   <tr>
     <td><p>Time Period</p></td>
     <td><p>日単位の傾向を表示し、異常な変動を検出</p></td>
   </tr>
   <tr>
     <td><p>Cost Type</p></td>
     <td><p>請求カテゴリ別に料金を分解</p></td>
   </tr>
   <tr>
     <td><p>Cloud Region</p></td>
     <td><p>マルチリージョンデプロイでリージョン間のコストを比較</p></td>
   </tr>
</table>

複数のディメンションをフィルターとして組み合わせることもできます。たとえば、特定プロジェクトの過去7日間の CU コストを選択すると、その事業ラインのコンピュートコストの推移を正確に把握できます。

詳細については、[コストを分析する](./analyze-cost)を参照してください。

### RESTful API\{#restful-api}

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API は、最大8桁の小数精度で使用状況データを提供し、社内の FinOps ワークフローにプログラムで統合して、次のことを実現できます。

- コストレポートを自動生成する

- 社内の予算管理システムと統合する

- カスタムアラートルールを設定する

### 使用状況アラート\{#usage-alerts}

[コストメトリクス](./metrics-alerts-reference#organization-level-metrics)を監視し、アラートしきい値を設定して異常な支出を早期に検出することを推奨します。特に次のシナリオで有効です。

- 新しく起動したクラスターで、実際のコストが想定と一致していることを確認する

- 動的スケーリングを設定した後、スケーリングが正しく機能していることを確認する

- 新しいチームメンバーが不要なリソースを作成した可能性がある場合

## コスト最適化チェックリスト\{#cost-optimization-checklist}

すぐに実行できるチェックリストです。

**選択フェーズ**

**インデックス設定**

**クエリ最適化**

**運用フェーズ**

**請求最適化**

## まとめ\{#summary}

Zilliz Cloud のコスト最適化は、単一のパラメータ調整ではありません。選択、設定、クエリ、運用、請求にまたがるシステム全体の取り組みです。最も効果の高い最適化は次のとおりです。

1. **まず Capacity-optimized クラスターを選ぶ** — これは「ダウングレード」ではありません。コスト効率のために特別に設計された階層型ストレージアーキテクチャであり、Performance-optimized クラスターの1/3の単価で、90%以上の本番ユースケースをカバーします。

1. **クエリパターンを最適化する** — スカラーフィールドにインデックスを作成し、TopK を制御し、返却フィールドを削減し、Partition Keys を使用します。これらはそれぞれ、クエリあたりのコストを大きく削減します。

1. **エラスティックスケーリングを使用する** — アイドルリソースへの支払いをやめ、30–40%節約します。

1. **Build Level を調整する** — 同じ CU に40%多くのデータを保存します。

適切に実施すれば、ほとんどのユーザーはビジネス要件を満たしながらコストを妥当な範囲内に維持できます。同時に、Zilliz Cloud が提供するストレージ階層化、インデックス最適化、エラスティックスケジューリングの技術的利点も活用できます。
