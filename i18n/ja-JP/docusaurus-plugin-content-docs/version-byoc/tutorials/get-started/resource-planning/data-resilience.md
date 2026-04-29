---
title: "データレジリエンス | BYOC"
slug: /data-resilience
sidebar_key: data-resilience
sidebar_label: "データレジリエンス"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、フルマネージド型のベクトルデータベースサービスとして、エンタープライズグレードの高可用性（HA）とディザスタリカバリ（DR）機能を提供し、さまざまな障害シナリオにおいてもミッションクリティカルなデータとサービスの継続的な可用性を確保します。| BYOC"
type: origin
token: YBDGwmFYkiRmRIkKGsscRjDmnIb
sidebar_position: 7
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - データレジリエンス
  - ha
  - dr
  - rto
  - rpo
  - コスト最適化

---

import Admonition from '@theme/Admonition';


# データレジリエンス

Zilliz Cloud は、フルマネージド型の ベクトルデータベース サービスとして、さまざまな障害シナリオ下においてもミッションクリティカルなデータとサービスの継続的な可用性を確保するための、エンタープライズグレードの **High Availability (HA)** および **Disaster Recovery (DR)** 機能を提供します。

### Core Capabilities\{#core-capabilities}

- **High Availability (HA):** ノード、アベイラビリティゾーン (AZ)、またはリージョンレベルの停止時において、自動的な障害検出と迅速なフェイルオーバーメカニズムにより、サービスの中断を防ぎます。

- **Disaster Recovery (DR):** 包括的なバックアップおよびリストア戦略により、重大なインシデント発生後のビジネス復旧を迅速に行います。

- **Flexible Resilience Tiers:** 標準からエンタープライズグレードのクロスリージョン展開まで、ビジネスシナリオに応じた多様な RPO/RTO 要件に合わせて調整可能です。

- **コスト最適化:** ビジネス価値とリスク許容度に基づき、最も費用対効果の高いレジリエンス戦略を選択できます。

## キー Concepts\{#key-concepts}

### Core Metrics\{#core-metrics}

- **Recovery Point Objective (RPO):** 許容される最大のデータ損失量を時間で表した指標です。例えば、RPO が 5 分の場合、障害発生時に最大 5 分間の最新データが失われる可能性があることを意味します。

- **Recovery Time Objective (RTO):** 障害発生からサービス完全復旧までに許容される最大の時間であり、障害検出、フェイルオーバーの意思決定、実際の復旧作業を含みます。

- **Service Level Agreement (Uptime SLA):** Zilliz Cloud のサービス可用性に関するコミットメントは、通常パーセンテージで表されます（例：99.95% の稼働率は、月間のダウンタイムが 21.6 分以下であることを意味します）。

### Fault Tolerance Scope\{#fault-tolerance-scope}

- **Node-level fault tolerance:** 単一の計算ノードまたはストレージノードの障害

- **AZ-level fault tolerance:** AZ 全体の停止（例：データセンターの障害）

- **Region-level fault tolerance:** リージョン全体のサービス停止（例：自然災害）

- **Cloud provider-level fault tolerance:** 単一のクラウドベンダーに起因するリスクを軽減するためのマルチクラウド展開

## Resilience Architecture Tiers\{#resilience-architecture-tiers}

### High Availability (HA) Tiers\{#high-availability-ha-tiers}

<table>
   <tr>
     <th><p>Tier</p></th>
     <th><p>Description</p></th>
     <th><p>RPO</p></th>
     <th><p>RTO</p></th>
     <th><p>Write Latency / Replication Scheme</p></th>
     <th><p>Fault Tolerance</p></th>
     <th><p>SLA</p></th>
     <th><p>Relative Cost</p></th>
   </tr>
   <tr>
     <td><p><strong>Standard</strong></p></td>
     <td><p>マルチレプリカメカニズムを採用した単一リージョン・単一 AZ 展開</p></td>
     <td><p>0 秒</p></td>
     <td><p>≤1 分</p></td>
     <td><p>単一 AZ 内での書き込み；Quorum 経由で WAL をレプリケート</p></td>
     <td><p>ノードレベルの障害</p><p>AZs: 1</p><p>Regions: 1</p></td>
     <td><p>SLA 保証なし</p></td>
     <td><p>低</p></td>
   </tr>
   <tr>
     <td><p><strong>Enterprise</strong></p></td>
     <td><p>自動フェイルオーバー機能を備えた、3 AZ にまたがる単一リージョン展開</p></td>
     <td><p>0 秒</p></td>
     <td><p>≤1 分</p></td>
     <td><p>AZ 間書き込み；Quorum 経由で WAL をレプリケート</p></td>
     <td><p>AZ レベルの障害</p><p>AZs: 3</p><p>Regions: 1</p></td>
     <td><p>99.95%</p></td>
     <td><p>中</p></td>
   </tr>
   <tr>
     <td><p><strong>Enterprise Multi-Replica</strong></p></td>
     <td><p>リージョン内のアクティブ - アクティブ型マルチレプリカアーキテクチャ；読み書き分離による高速フェイルオーバー</p></td>
     <td><p>0 秒</p></td>
     <td><p>≤10 秒</p></td>
     <td><p>AZ 間書き込み；WAL 経由でレプリカ間同期</p></td>
     <td><p>AZ レベルの障害</p><p>AZs: 3</p><p>Regions: 1</p></td>
     <td><p>99.99%</p></td>
     <td><p>中～高</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-Region HA</strong></p></td>
     <td><p>グローバル負荷分散を備えたマルチリージョン/マルチクラウド展開</p></td>
     <td><p>≤10 秒</p></td>
     <td><p>手動または自動フェイルオーバー：</p><p>自動：≤3 分</p></td>
     <td><p>AZ 間での同期書き込み；他のリージョン/クラウドへの非同期レプリケーション</p></td>
     <td><p>リージョンレベルの障害</p><p>AZs: ≥3</p><p>Regions: ≥2</p></td>
     <td><p>99.99%</p></td>
     <td><p>高</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Cross-region HA は 2025 年 11 月に利用可能になる予定です。</p>

</Admonition>

### Disaster Recovery (DR) Tiers\{#disaster-recovery-dr-tiers}

<table>
   <tr>
     <th><p>Tier</p></th>
     <th><p>Description</p></th>
     <th><p>RPO</p></th>
     <th><p>Restore Speed</p></th>
     <th><p>Backup Strategy</p></th>
     <th><p>Use Case</p></th>
     <th><p>Additional Cost</p></th>
   </tr>
   <tr>
     <td><p><strong>Local Backup</strong></p></td>
     <td><p>同一リージョンのオブジェクトストレージ；定期的なフルバックアップ</p></td>
     <td><p>毎時</p></td>
     <td><p>数分～数時間</p></td>
     <td><p>フルバックアップ</p></td>
     <td><p>誤削除、論理エラーからの復旧</p></td>
     <td><p>低</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-Region Backup</strong></p></td>
     <td><p>異なるリージョンにバックアップデータを保存；地域的な災害から保護</p></td>
     <td><p>毎時</p></td>
     <td><p>数分～数時間</p></td>
     <td><p>リージョン/クラウド間でレプリケートされるフルバックアップ</p></td>
     <td><p>地域的な災害、コンプライアンス要件</p></td>
     <td><p>中</p></td>
   </tr>
</table>

## Quick Selection Guide\{#quick-selection-guide}

### Business Tiering & Resilience Recommendations\{#business-tiering-and-resilience-recommendations}

#### **Tier 1 – Mission-Critical Workloads**\{#tier-1-mission-critical-workloads}

- **Characteristics:** 24 時間 365 日稼働；数分のダウンタイムでも多大な損失が発生；極めて高いビジネス価値

- **Recommended:** Cross-region HA + Enterprise Multi-Replica + 継続的データ保護

- **Targets:** RPO = 0 秒、RTO < 30 秒、クロスクラウド/リージョン DR

- **Expected Cost:** 高

#### **Tier 2 – Important Business Systems**\{#tier-2-important-business-systems}

- **Characteristics:** 24 時間 365 日稼働；高い安定性が必要

- **Recommended:** Enterprise Multi-Replica + Cross-region Backup

- **Targets:** RPO = 0 秒、RTO < 30 秒

- **Expected Cost:** 中～高

#### **Tier 3 – 一般 アプリケーション**\{#tier-3-general-applications}

- **Characteristics:** 営業時間中に稼働；コスト重視；ある程度の復旧時間を許容

- **Recommended:** Enterprise + Local Backup

- **Targets:** RPO = 0 秒、RTO < 3 分

- **Expected Cost:** 低～中

#### **Tier 4 – Non-Critical Workloads**\{#tier-4-non-critical-workloads}

- **Characteristics:** 必須ではないシステム；コスト重視；計画されたメンテナンスウィンドウを許容

- **Recommended:** Standard + Local Backup

- **Targets:** RPO = 0 秒、RTO < 3 分

- **Expected Cost:** 低～中

### コスト最適化 Decision Matrix\{#cost-optimization-decision-matrix}

<table>
   <tr>
     <th><p>Business Impact</p></th>
     <th><p>データ Value</p></th>
     <th><p>Compliance Requirement</p></th>
     <th><p>Recommended ソリューション</p></th>
     <th><p>Cost Level</p></th>
   </tr>
   <tr>
     <td><p>極めて高い</p></td>
     <td><p>極めて高い</p></td>
     <td><p>厳格</p></td>
     <td><p>Cross-region HA + 完全な DR</p></td>
     <td><p>高</p></td>
   </tr>
   <tr>
     <td><p>高い</p></td>
     <td><p>高い</p></td>
     <td><p>適度</p></td>
     <td><p>Enterprise Multi-Replica + Cross-region Backup</p></td>
     <td><p>中～高</p></td>
   </tr>
   <tr>
     <td><p>中</p></td>
     <td><p>中</p></td>
     <td><p>基本</p></td>
     <td><p>Enterprise + Local Backup</p></td>
     <td><p>中</p></td>
   </tr>
   <tr>
     <td><p>低</p></td>
     <td><p>低</p></td>
     <td><p>なし</p></td>
     <td><p>Standard + 基本バックアップ</p></td>
     <td><p>低</p></td>
   </tr>
</table>

## Frequently Asked Questions (FAQ)\{#frequently-asked-questions-faq}

**Q1: Standard プランと Enterprise プランはどのようにして高可用性を実現していますか？**

**アーキテクチャ設計**  

Zilliz Cloud は、計算とストレージを分離したアーキテクチャを採用しており、以下の 3 つのデータタイプを扱います：  

- **Metadata:** etcd に保存（3 レプリカ、RAFT プロトコル）

- **Log データ:** 独自技術の Woodpecker に保存（Quorum プロトコル）

- **Raw & Index データ:** オブジェクトストレージに保存され、クラウドストレージ本来の HA を継承

**計算ノードのHA**  

- Kubernetes によって管理され、自動スケジューリングを実施

- 単一ノードまたは単一 AZ の障害发生时、Pod は自動的に再生成

- コーディネーター がセグメントを他の QueryNodes に再割り当て

- インデックスとデータはストレージから再読み込みされ、復旧時間は 1 分未満

**コスト最適化**  

- **複数の永続レプリカ** と **動的なインメモリ読み込み** を活用  

    - 複数のインメモリレプリカを維持することによるコスト急増を回避

    - DR アーキテクチャを簡素化

    - ログおよびオブジェクトストレージの帯域幅を活用し、より高速な復旧を実現

**Q2: マルチレプリカメカニズムはどのように動作しますか？**

**コアメカニズム**  

- **Shard Level:** 複数の StreamNodes が同じシャードをプライマリ/スタンバイ役割で読み込み

- **Segment Level:** 複数の QueryNodes が同じセグメントを読み込み；データは単一コピーとして永続化

**読み書き分離**  

- **Writes:** プライマリ StreamNode が処理

- **Reads:** いずれかのスタンバイ StreamNode または QueryNode が対応

**主な利点**  

- **Fast フェイルオーバー:** プロキシ がトラフィックを自動的にスタンバイノードへリダイレクト

- **Higher QPS:** 複数のインメモリレプリカにより読み込みスループットが向上

- **Smooth Upgrades:** ローリングアップデートによりサービスの揺らぎを軽減し、安定性を向上

**Q3: Global データベース はどのようにしてクロスリージョンの高可用性を実現しますか？**

**CDC同期**  

- Change データ Capture (CDC) により、DDL、DML、およびバルクインポート操作を同期

- 典型的な同期レイテンシは 10 秒未満

- 非常に低い RPO でクロスリージョン/クロスクラウド DR を実現

**データ書き込み戦略**  

- 同一リージョン内の複数の AZ にわたってデータを同期書き込み

- 書き込みレイテンシは AZ 間レベル

- 極端なフェイルオーバーシナリオでも、データ損失は 10 秒未満

<Admonition type="info" icon="📘" title="Notes">

<p><strong>2026 年のロードマップ：</strong> クロスリージョン Woodpecker により <strong>RPO = 0</strong> を実現</p>

</Admonition>

**フェイルオーバー Modes**  

- **Manual:** OpenAPI または Web コンソール経由

- **Automatic:** Zilliz ヘルスチェックサービスが障害を検出し、1～3 分でフェイルオーバーを完了

**Access Patterns**

<table>
   <tr>
     <th><p>Mode</p></th>
     <th><p>Characteristics</p></th>
     <th><p>Use Case</p></th>
   </tr>
   <tr>
     <td><p><strong>Active-Standby DR</strong></p></td>
     <td><p>プライマリが読み書きを担当；スタンバイはフェイルオーバー時のみ活性化</p></td>
     <td><p>標準的なディザスタリカバリ</p></td>
   </tr>
   <tr>
     <td><p><strong>Active-Active (Multi-Read)</strong></p></td>
     <td><p>プライマリが書き込み；複数のリージョンが読み込みを提供（最寄リージョン読み込み）</p></td>
     <td><p>グローバルな読み込み重視・書き込み少量のワークロード</p></td>
   </tr>
   <tr>
     <td><p><strong>Multi-Primary</strong> <em>(2026 年予定)</em></p></td>
     <td><p>両リージョンが書き込みを受け付け；ユーザーはデータ競合を回避する必要あり</p></td>
     <td><p>セルベースまたはシャード化された展開</p></td>
   </tr>
</table>

最新の機能アップデートや技術サポートについては、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us) までお問い合わせください。

