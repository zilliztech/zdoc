---
title: "データレジリエンス | BYOC"
slug: /data-resilience
sidebar_label: "データレジリエンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "フルマネージド vector database サービスである Zilliz Cloud は、さまざまな障害シナリオ下でもミッションクリティカルなデータとサービスの継続的な可用性を確保するために、エンタープライズグレードの High Availability (HA) および Disaster Recovery (DR) 機能を提供します。 | BYOC"
type: origin
token: YBDGwmFYkiRmRIkKGsscRjDmnIb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データレジリエンス

フルマネージド vector database サービスである Zilliz Cloud は、さまざまな障害シナリオ下でもミッションクリティカルなデータとサービスの継続的な可用性を確保するために、エンタープライズグレードの **High Availability (HA)** と **Disaster Recovery (DR)** 機能を提供します。

### コア機能\{#core-capabilities}

- **High Availability (HA):** 自動障害検知と迅速なフェイルオーバー機構により、ノード、availability zone (AZ)、またはリージョンレベルの障害時にも中断のないサービス運用を実現します。

- **Disaster Recovery (DR):** 包括的なバックアップおよび復元戦略により、大規模インシデント後の迅速な業務復旧を可能にします。

- **柔軟なレジリエンス階層:** Standard からエンタープライズグレードのクロスリージョンデプロイメントまで、さまざまな業務シナリオにおける多様な RPO/RTO 要件に対応するよう設計されています。

- **コスト最適化:** ビジネス価値とリスク許容度に基づいて、最も費用対効果の高いレジリエンス戦略を選択できます。

## 主要な概念\{#key-concepts}

### コア指標\{#core-metrics}

- **Recovery Point Objective (RPO):** 時間で測定される、許容可能な最大データ損失量です。たとえば、RPO が 5 分である場合、障害発生時に直近 5 分以内のデータが失われる可能性があることを意味します。

- **Recovery Time Objective (RTO):** 障害発生からサービスが完全に復旧するまでの最大許容時間であり、障害検知、フェイルオーバー判断、および実際の復旧を含みます。

- **Service Level Agreement (Uptime SLA):** サービス可用性に関する Zilliz Cloud のコミットメントは、通常パーセンテージで表されます（たとえば、99.95% の稼働率は、毎月のダウンタイムが 21.6 分以下であることを意味します）。

### フォールトトレランスの範囲\{#fault-tolerance-scope}

- **ノードレベルのフォールトトレランス:** 単一の compute または storage ノードの障害

- **AZ レベルのフォールトトレランス:** AZ 全体の障害（例: データセンター障害）

- **リージョンレベルのフォールトトレランス:** リージョン全体のサービス停止（例: 自然災害）

- **クラウドプロバイダーレベルのフォールトトレランス:** 単一クラウドベンダー由来のリスクを軽減するためのマルチクラウドデプロイメント

## レジリエンスアーキテクチャ階層\{#resilience-architecture-tiers}

### High Availability (HA) 階層\{#high-availability-ha-tiers}

| 階層 | 説明 | RPO | RTO | 書き込みレイテンシ / レプリケーション方式 | フォールトトレランス | SLA | 相対コスト |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Standard** | マルチレプリカ機構を備えた単一リージョン・単一 AZ デプロイメント | 0 秒 | ≤1 分 | 単一 AZ 内で書き込み、WAL は Quorum によりレプリケート | ノードレベル障害<br/>AZs: 1<br/>Regions: 1 | SLA 保証なし | 低 |
| **Enterprise** | 3 つの AZ にまたがる単一リージョンデプロイメントと自動フェイルオーバー | 0 秒 | ≤1 分 | AZ 間で書き込み、WAL は Quorum によりレプリケート | AZ レベル障害<br/>AZs: 3<br/>Regions: 1 | 99.95% | 中 |
| **Enterprise Multi-Replica** | リージョン内のアクティブ-アクティブなマルチレプリカアーキテクチャ。読み書き分離と高速フェイルオーバーを実現 | 0 秒 | ≤10 秒 | AZ 間で書き込み、レプリカ間同期は WAL により実施 | AZ レベル障害<br/>AZs: 3<br/>Regions: 1 | 99.99% | 中～高 |
| **Cross-Region HA** | グローバルロードバランシングを備えたマルチリージョン / マルチクラウドデプロイメント | ≤10 秒 | 手動または自動フェイルオーバー:<br/>自動: ≤3 分 | AZ 間では同期書き込み、他リージョン / クラウドへは非同期レプリケーション | リージョンレベル障害<br/>AZs: ≥3<br/>Regions: ≥2 | 99.99% | 高 |

<Admonition type="info" icon="📘" title="注意">

Cross-region HA は 2025 年 11 月に利用可能になる予定です。 

</Admonition>

### Disaster Recovery (DR) 階層\{#disaster-recovery-dr-tiers}

| 階層 | 説明 | RPO | 復元速度 | バックアップ戦略 | ユースケース | 追加コスト |
| --- | --- | --- | --- | --- | --- | --- |
| **Local Backup** | 同一リージョンの object storage。スケジュールされたフルバックアップ | 毎時 | 数分～数時間 | フルバックアップ | 誤削除、論理エラーからの復旧 | 低 |
| **Cross-Region Backup** | 別リージョンに保存されるバックアップデータ。リージョン災害から保護 | 毎時 | 数分～数時間 | リージョン / クラウド間でレプリケートされるフルバックアップ | リージョン災害、コンプライアンス要件 | 中 |

## クイック選定ガイド\{#quick-selection-guide}

### ビジネス階層別のレジリエンス推奨\{#business-tiering-and-resilience-recommendations}

#### **Tier 1 – ミッションクリティカルなワークロード**\{#tier-1-mission-critical-workloads}

- **特徴:** 24 時間 365 日稼働。数分のダウンタイムでも重大な損失につながる。非常に高いビジネス価値を持つ

- **推奨:** Cross-region HA + Enterprise Multi-Replica + Continuous Data Protection

- **目標:** RPO = 0s、RTO < 30s、クロスクラウド / クロスリージョン DR

- **想定コスト:** 高

#### **Tier 2 – 重要な業務システム**\{#tier-2-important-business-systems}

- **特徴:** 24 時間 365 日稼働。高い安定性要件がある

- **推奨:** Enterprise Multi-Replica + Cross-region Backup

- **目標:** RPO = 0s、RTO < 30s

- **想定コスト:** 中～高

#### **Tier 3 – 一般的なアプリケーション**\{#tier-3-general-applications}

- **特徴:** 営業時間内に稼働。コストに敏感。一部の復旧時間を許容できる

- **推奨:** Enterprise + Local Backup

- **目標:** RPO = 0s、RTO < 3 分

- **想定コスト:** 低～中

#### **Tier 4 – 非クリティカルなワークロード**\{#tier-4-non-critical-workloads}

- **特徴:** 必須ではないシステム。コストに敏感。計画メンテナンス時間帯を許容できる

- **推奨:** Standard + Local Backup

- **目標:** RPO = 0s、RTO < 3 分

- **想定コスト:** 低～中

### コスト最適化の判断マトリクス\{#cost-optimization-decision-matrix}

| ビジネス影響 | データ価値 | コンプライアンス要件 | 推奨ソリューション | コストレベル |
| --- | --- | --- | --- | --- |
| 非常に高い | 非常に高い | 厳格 | Cross-region HA + Full DR | 高 |
| 高い | 高い | 中程度 | Enterprise Multi-Replica + Cross-region Backup | 中～高 |
| 中程度 | 中程度 | 基本的 | Enterprise + Local Backup | 中 |
| 低い | 低い | なし | Standard + Basic Backup | 低 |

## よくある質問 (FAQ)\{#frequently-asked-questions-faq}

**Q1: Standard プランと Enterprise プランはどのように高可用性を実現していますか？**

**アーキテクチャ設計**  

Zilliz Cloud は、3 種類のデータを持つ compute-storage 分離アーキテクチャを採用しています。  

- **Metadata:** etcd に保存（3 レプリカ、RAFT プロトコル）

- **Log Data:** 独自の Woodpecker に保存（Quorum プロトコル）

- **Raw & Index Data:** object storage に保存され、クラウドストレージ本来の HA を継承

**Compute Node HA**  

- Kubernetes によって管理され、自動スケジューリングを実施

- 単一ノードまたは単一 AZ の障害時に Pod が自動的に再生成される

- Coordinator が segment を他の QueryNodes に再割り当てする

- index とデータは storage から再ロードされ、復旧時間は 1 分未満

**コスト最適化**  

- **複数の永続レプリカ** + **動的なインメモリロード** を使用  

    - 複数のインメモリレプリカを維持することによるコスト爆発を回避

    - DR アーキテクチャを簡素化

    - log と object storage の帯域幅を活用してより高速に復旧

**Q2: マルチレプリカ機構はどのように動作しますか？**

**コアメカニズム**  

- **Shard レベル:** 複数の StreamNodes が同じ shard を primary / standby の役割でロード

- **Segment レベル:** 複数の QueryNodes が同じ segment をロード。データ自体は単一コピーとして保持される

**読み書き分離**  

- **Writes:** primary StreamNode が処理

- **Reads:** 任意の standby StreamNode または QueryNode が処理

**主な利点**  

- **高速フェイルオーバー:** Proxy がトラフィックを standby ノードへ自動的にリダイレクト

- **より高い QPS:** 複数のインメモリレプリカが読み取りスループットを向上

- **スムーズなアップグレード:** ローリングアップデートによりサービスの揺らぎを減らし、安定性を向上

**Q3: Global Database はどのようにクロスリージョン高可用性を実現しますか？**

**CDC 同期**  

- Change Data Capture (CDC) は DDL、DML、および bulk import 操作を同期

- 一般的な同期レイテンシは 10 秒未満

- 非常に低い RPO でクロスリージョン / クロスクラウド DR を実現

**データ書き込み戦略**  

- 同一リージョン内の複数 AZ にまたがってデータを同期的に書き込み

- 書き込みレイテンシは AZ 間レベル

- 極端なフェイルオーバーシナリオでも、データ損失は 10 秒未満

<Admonition type="info" icon="📘" title="注意:">

**2026 年のロードマップ:** クロスリージョン Woodpecker により **RPO = 0** を実現

</Admonition>

**フェイルオーバーモード**  

- **手動:** OpenAPI または Web Console 経由

- **自動:** Zilliz のヘルスチェックサービスが障害を検知し、1～3 分でフェイルオーバーを完了

**アクセスパターン**

| モード | 特徴 | ユースケース |
| --- | --- | --- |
| **Active-Standby DR** | primary が読み書きを処理し、standby はフェイルオーバー時のみ有効化される | 標準的な disaster recovery |
| **Active-Active (Multi-Read)** | primary が書き込みを処理し、複数リージョンが読み取りを提供（最寄りリージョン読み取り） | グローバルな読み取り中心・低書き込みワークロード |
| **Multi-Primary** *(2026 年提供予定)* | 両リージョンで書き込みを受け付けるが、ユーザーはデータ競合を回避する必要がある | セルベースまたはシャーディングされたデプロイメント |

最新の機能アップデートまたは技術サポートについては、[Zilliz Cloud support](https://support.zilliz.com/hc/en-us) にお問い合わせください。

