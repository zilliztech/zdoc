---
title: "データレジリエンス | BYOC"
slug: /data-resilience
sidebar_label: "データレジリエンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、フルマネージドのベクトルデータベースサービスとして、エンタープライズグレードの高可用性（HA）と災害復旧（DR）機能を提供し、さまざまな障害シナリオ下でもミッションクリティカルなデータとサービスの継続的な可用性を確保します。 | BYOC"
type: origin
token: YBDGwmFYkiRmRIkKGsscRjDmnIb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データレジリエンス

Zilliz Cloud は、フルマネージドのベクトルデータベースサービスとして、エンタープライズグレードの**高可用性（HA）**と**災害復旧（DR）**機能を提供し、さまざまな障害シナリオ下でもミッションクリティカルなデータとサービスの継続的な可用性を確保します。

### コア機能\{#core-capabilities}

- **高可用性（HA）：** 自動障害検知と迅速なフェイルオーバー機構により、ノード、アベイラビリティゾーン（AZ）、またはリージョンレベルの障害時でも中断のないサービス運用を実現します。

- **災害復旧（DR）：** 包括的なバックアップおよびリストア戦略により、重大なインシデント発生後の迅速な業務復旧を可能にします。

- **柔軟なレジリエンス階層：** Standard からエンタープライズグレードのクロスリージョンデプロイメントまで、さまざまな業務シナリオにおける多様な RPO/RTO 要件を満たすように調整されています。

- **コスト最適化：** ビジネス価値とリスク許容度に基づいて、最も費用対効果の高いレジリエンス戦略を選択できます。

## 主要な概念\{#key-concepts}

### コア指標\{#core-metrics}

- <strong>目標復旧時点（RPO）：</strong> 許容できる最大のデータ損失量を時間で表したものです。たとえば、RPO が 5 分の場合、障害発生時に直近最大 5 分間のデータが失われる可能性があることを意味します。

- <strong>目標復旧時間（RTO）：</strong> 障害発生からサービスが完全に復旧するまでの最大許容時間であり、障害検知、フェイルオーバーの判断、および実際の復旧を含みます。

- <strong>サービスレベル契約（Uptime SLA）：</strong> サービス可用性に関する Zilliz Cloud のコミットメントは、通常パーセンテージで表されます（たとえば、99.95% の稼働率は、毎月のダウンタイムが 21.6 分以下であることを意味します）。

### フォールトトレランスの範囲\{#fault-tolerance-scope}

- **ノードレベルのフォールトトレランス：** 単一のコンピューティングノードまたはストレージノードの障害

- **AZ レベルのフォールトトレランス：** AZ 全体の障害（データセンター障害など）

- **リージョンレベルのフォールトトレランス：** リージョン全体のサービス停止（自然災害など）

- **クラウドプロバイダーレベルのフォールトトレランス：** 単一のクラウドベンダーに起因するリスクを軽減するためのマルチクラウドデプロイメント

## レジリエンスアーキテクチャ階層\{#resilience-architecture-tiers}

### 高可用性（HA）階層\{#high-availability-ha-tiers}

| 階層 | 説明 | RPO | RTO | 書き込みレイテンシ / レプリケーション方式 | フォールトトレランス | SLA | 相対コスト |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Standard** | マルチレプリカ機構を備えた単一リージョン・単一 AZ デプロイメント | 0 秒 | ≤1 分 | 単一 AZ 内で書き込み、WAL は Quorum によりレプリケート | ノードレベルの障害<br/>AZs: 1<br/>Regions: 1 | SLA 保証なし | 低 |
| **Enterprise** | 3 つの AZ にまたがる単一リージョンデプロイメントと自動フェイルオーバー | 0 秒 | ≤1 分 | クロス AZ で書き込み、WAL は Quorum によりレプリケート | AZ レベルの障害<br/>AZs: 3<br/>Regions: 1 | 99.95% | 中 |
| **Enterprise Multi-Replica** | リージョン内のアクティブ-アクティブ型マルチレプリカアーキテクチャ。read/write 分離と高速フェイルオーバー | 0 秒 | ≤10 秒 | クロス AZ で書き込み、レプリカ間の同期は WAL 経由 | AZ レベルの障害<br/>AZs: 3<br/>Regions: 1 | 99.99% | 中～高 |
| **Cross-Region HA** | グローバルロードバランシングを備えた multi-region/multi-cloud デプロイメント | ≤10 秒 | 手動または自動フェイルオーバー：<br/>自動：≤3 分 | AZ 間の同期書き込み、他の regions/clouds への非同期レプリケーション | リージョンレベルの障害<br/>AZs: ≥3<br/>Regions: ≥2 | 99.99% | 高い |

<Admonition type="info" title="Notes">

Cross-region HA は 2025 年 11 月に利用可能になる予定です。 

</Admonition>

### 災害復旧（DR）階層\{#disaster-recovery-dr-tiers}

| 階層 | 説明 | RPO | 復元速度 | バックアップ戦略 | ユースケース | 追加コスト |
| --- | --- | --- | --- | --- | --- | --- |
| **Local Backup** | 同一リージョンのオブジェクトストレージ。定期的なフルバックアップ | 1 時間ごと | 数分～数時間 | フルバックアップ | 誤削除、論理エラーからの復旧 | 低 |
| **Cross-Region Backup** | 別のリージョンに保存されるバックアップデータ。リージョン災害に対する保護を提供 | 1 時間ごと | 数分～数時間 | regions/clouds 間でレプリケートされるフルバックアップ | リージョン災害、コンプライアンス要件 | 中 |

## クイック選定ガイド\{#quick-selection-guide}

### ビジネス階層別のレジリエンス推奨\{#business-tiering-and-resilience-recommendations}

#### Tier 1 – ミッションクリティカルなワークロード\{#tier-1-mission-critical-workloads}

- **特徴：** 24/7 運用。数分のダウンタイムでも重大な損失が発生。ビジネス価値が極めて高い

- **推奨：** Cross-region HA + Enterprise Multi-Replica + Continuous Data Protection

- **目標：** RPO = 0s、RTO < 30s、cross-cloud/region DR

- **想定コスト：** 高

#### Tier 2 – 重要な業務システム\{#tier-2-important-business-systems}

- **特徴：** 24/7 運用。高い安定性要件

- **推奨：** Enterprise Multi-Replica + Cross-region Backup

- **目標：** RPO = 0s、RTO < 30s

- **想定コスト：** 中～高

#### Tier 3 – 一般的なアプリケーション\{#tier-3-general-applications}

- **特徴：** 営業時間内に稼働。コストに敏感。ある程度の復旧時間を許容

- **推奨：** Enterprise + Local Backup

- **目標：** RPO = 0s、RTO < 3 分

- **想定コスト：** 低～中

#### Tier 4 – 非クリティカルなワークロード\{#tier-4-non-critical-workloads}

- **特徴：** 必須ではないシステム。コストに敏感。計画メンテナンス時間帯を許容

- **推奨：** Standard + Local Backup

- **目標：** RPO = 0s、RTO < 3 分

- **想定コスト：** 低～中

### コスト最適化の判断マトリクス\{#cost-optimization-decision-matrix}

| ビジネス影響 | データ価値 | コンプライアンス要件 | 推奨ソリューション | コストレベル |
| --- | --- | --- | --- | --- |
| 極めて高い | 極めて高い | 厳格 | Cross-region HA + Full DR | 高い |
| 高い | 高い | 中程度 | Enterprise Multi-Replica + Cross-region Backup | 中～高 |
| 中 | 中 | 基本 | Enterprise + Local Backup | 中 |
| 低 | 低 | なし | Standard + Basic Backup | 低 |

## よくある質問（FAQ）\{#frequently-asked-questions-faq}

**Q1: Standard プランと Enterprise プランはどのように高可用性を実現していますか？**

**アーキテクチャ設計**  

Zilliz Cloud は、3 種類のデータを扱うコンピューティングとストレージを分離したアーキテクチャを採用しています。  

- **メタデータ：** etcd に保存（3 レプリカ、RAFT プロトコル）

- **ログデータ：** 独自の Woodpecker に保存（Quorum プロトコル）

- **生データとインデックスデータ：** オブジェクトストレージに保存され、クラウドストレージネイティブの HA を継承

**Compute Node HA**  

- Kubernetes による自動スケジューリングで管理

- 単一ノードまたは単一 AZ の障害時に Pod が自動的に再起動

- Coordinator はセグメントを他の QueryNodes に再割り当て

- インデックスとデータはストレージから再ロードされ、復旧時間は 1 分未満

**コスト最適化**  

- **複数の永続レプリカ** + **動的なインメモリロード**を使用  

    - 複数のインメモリレプリカを維持することによるコストの急増を回避

    - DR アーキテクチャを簡素化

    - ログおよびオブジェクトストレージの帯域幅を活用して復旧を高速化

**Q2: マルチレプリカ機構はどのように動作しますか？**

**コアメカニズム**  

- **Shard レベル：** 複数の StreamNodes が primary/standby ロールで同じシャードをロード

- **Segment レベル：** 複数の QueryNodes が同じセグメントをロード。データは単一コピーとして保持

**Read/Write 分離**  

- **書き込み：** primary StreamNode が処理

- **読み取り：** 任意の standby StreamNode または QueryNode が処理

**主なメリット**  

- **高速フェイルオーバー：** Proxy がトラフィックを standby ノードへ自動的にリダイレクト

- **より高い QPS：** 複数のインメモリレプリカが読み取りスループットを向上

- **スムーズなアップグレード：** ローリングアップデートによりサービスの揺らぎを低減し、安定性を向上

**Q3: グローバルデータベースはどのようにクロスリージョン高可用性を実現しますか？**

**CDC 同期**  

- Change Data Capture (CDC) は DDL、DML、および bulk import 操作を同期

- 一般的な同期レイテンシは 10 秒未満

- 非常に低い RPO で cross-region/cross-cloud DR を実現

**データ書き込み戦略**  

- 同一リージョン内の複数の AZ にデータを同期的に書き込み

- 書き込みレイテンシは AZ 間レベル

- 極端なフェイルオーバーシナリオでは、データ損失は 10 秒未満

<Admonition type="info" title="Notes:">

**2026 年のロードマップ：** クロスリージョン Woodpecker により **RPO = 0** を実現

</Admonition>

**フェイルオーバーモード**  

- **手動：** OpenAPI または Web Console 経由

- **自動：** Zilliz のヘルスチェックサービスが障害を検知し、1～3 分でフェイルオーバーを完了

**アクセスパターン**

| モード | 特徴 | ユースケース |
| --- | --- | --- |
| **Active-Standby DR** | Primary が reads/writes; を処理し、standby はフェイルオーバー時のみアクティブ化されます。 | 標準的な災害復旧 |
| **Active-Active (Multi-Read)** | Primary が書き込みを処理し、複数のリージョンが読み取りを提供（最寄りリージョンでの読み取り） | グローバルな読み取り中心、低書き込みワークロード |
| **Multi-Primary** *(2026 年提供予定)* | 両方のリージョンが書き込みを受け付けますが、ユーザーはデータ競合を回避する必要があります。 | セルベースまたはシャーディングされたデプロイメント |

最新の機能アップデートまたは技術サポートについては、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。

