---
title: "データレジリエンス | Cloud"
slug: /data-resilience
sidebar_label: "データレジリエンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、フルマネージドのベクトルデータベースサービスとして、エンタープライズグレードの高可用性（HA）と災害復旧（DR）機能を提供し、さまざまな障害シナリオ下でミッションクリティカルなデータとサービスの継続的な可用性を確保します。 | Cloud"
type: origin
token: YBDGwmFYkiRmRIkKGsscRjDmnIb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データレジリエンス

Zilliz Cloud は、フルマネージドのベクトルデータベースサービスとして、エンタープライズグレードの**高可用性（HA）**と**災害復旧（DR）**機能を提供し、さまざまな障害シナリオ下でミッションクリティカルなデータとサービスの継続的な可用性を確保します。

### コア機能\{#core-capabilities}

- **高可用性（HA）:** 自動障害検出と迅速なフェイルオーバーの仕組みにより、ノード、アベイラビリティゾーン（AZ）、またはリージョンレベルの停止時でも中断なくサービスを運用できます。

- **災害復旧（DR）:** 包括的なバックアップおよびリストア戦略により、重大なインシデント発生後もビジネスを迅速に復旧できます。

- **柔軟なレジリエンス階層:** Standard からエンタープライズグレードのクロスリージョンデプロイメントまで、ビジネスシナリオごとに異なる RPO/RTO 要件を満たすように調整できます。

- **コスト最適化:** ビジネス価値とリスク許容度に基づいて、最も費用対効果の高いレジリエンス戦略を選択できます。

## 主要概念\{#key-concepts}

### コア指標\{#core-metrics}

- <strong>目標復旧時点（RPO）:</strong> 許容可能な最大データ損失量を時間で表したものです。たとえば、RPO が 5 分である場合、障害の発生時に直近最大 5 分間のデータが失われる可能性があることを意味します。

- <strong>目標復旧時間（RTO）:</strong> 障害の発生からサービスが完全に復旧するまでの最大許容時間です。障害の検出、フェイルオーバーの判断、実際の復旧が含まれます。

- <strong>サービスレベル契約（Uptime SLA）:</strong> Zilliz Cloud のサービス可用性に関するコミットメントは通常、割合で表されます（たとえば、99.95% の稼働率は、毎月のダウンタイムが 21.6 分以下であることを意味します）。

### 耐障害性の範囲\{#fault-tolerance-scope}

- **ノードレベルの耐障害性:** 単一のコンピューティングノードまたはストレージノードの障害

- **AZ レベルの耐障害性:** AZ 全体の停止（例: データセンターの障害）

- **リージョンレベルの耐障害性:** リージョン全体のサービス停止（例: 自然災害）

- **クラウドプロバイダーレベルの耐障害性:** 単一のクラウドベンダーに起因するリスクを軽減するマルチクラウドデプロイメント

## レジリエンスアーキテクチャ階層\{#resilience-architecture-tiers}

### 高可用性（HA）階層\{#high-availability-ha-tiers}

| 階層 | 説明 | RPO | RTO | 書き込みレイテンシ / レプリケーション方式 | 耐障害性 | SLA | 相対コスト |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Standard** | マルチレプリカメカニズムを備えた単一リージョン・単一 AZ のデプロイメント | 0 秒 | ≤1 分 | 単一 AZ 内で書き込み。WAL は Quorum によりレプリケート | ノードレベルの障害<br/>AZ 数: 1<br/>リージョン数: 1 | SLA 保証なし | 低 |
| **Enterprise** | 自動フェイルオーバーを備え、3 つの AZ にまたがる単一リージョンのデプロイメント | 0 秒 | ≤1 分 | クロス AZ で書き込み。WAL は Quorum によりレプリケート | AZ レベルの障害<br/>AZ 数: 3<br/>リージョン数: 1 | 99.95% | 中 |
| **Enterprise Multi-Replica** | リージョン内のアクティブ-アクティブなマルチレプリカアーキテクチャ。read/write 分離と高速なフェイルオーバー | 0 秒 | ≤10 秒 | クロス AZ で書き込み。レプリカ間の同期は WAL 経由 | AZ レベルの障害<br/>AZ 数: 3<br/>リージョン数: 1 | 99.99% | 中〜高 |
| **Cross-Region HA** | グローバルロードバランシングを備えた Multi-region/multi-cloud デプロイメント | ≤10 秒 | 手動または自動フェイルオーバー:<br/>自動: ≤3 分 | AZ 間の同期書き込み。他の regions/clouds への非同期レプリケーション | リージョンレベルの障害<br/>AZ 数: ≥3<br/>リージョン数: ≥2 | 99.99% | 高い |

<Admonition type="info" title="Notes">

Cross-region HA は 2025 年 11 月に利用可能になる予定です。 

</Admonition>

### 災害復旧（DR）階層\{#disaster-recovery-dr-tiers}

| 階層 | 説明 | RPO | リストア速度 | バックアップ戦略 | ユースケース | 追加コスト |
| --- | --- | --- | --- | --- | --- | --- |
| **Local Backup** | 同一リージョンのオブジェクトストレージ。スケジュールされたフルバックアップ | 1 時間ごと | 数分〜数時間 | フルバックアップ | 誤削除、論理エラーからの復旧 | 低 |
| **Cross-Region Backup** | 別のリージョンに保存されたバックアップデータ。リージョン単位の災害から保護 | 1 時間ごと | 数分〜数時間 | regions/clouds 間でレプリケートされたフルバックアップ | リージョン災害、コンプライアンス要件 | 中 |

## クイック選択ガイド\{#quick-selection-guide}

### ビジネス階層化とレジリエンスの推奨事項\{#business-tiering-and-resilience-recommendations}

#### Tier 1 – ミッションクリティカルなワークロード\{#tier-1-mission-critical-workloads}

- **特徴:** 24/7 の運用。数分のダウンタイムでも大きな損失が発生し、ビジネス価値が極めて高い

- **推奨:** Cross-region HA + Enterprise Multi-Replica + Continuous Data Protection

- **目標:** RPO = 0s、RTO < 30s、cross-cloud/region DR

- **想定コスト:** 高

#### Tier 2 – 重要なビジネスシステム\{#tier-2-important-business-systems}

- **特徴:** 24/7 の運用。高い安定性が求められる

- **推奨:** Enterprise Multi-Replica + Cross-region Backup

- **目標:** RPO = 0s、RTO < 30s

- **想定コスト:** 中〜高

#### Tier 3 – 一般的なアプリケーション\{#tier-3-general-applications}

- **特徴:** 営業時間中に稼働。コスト重視。ある程度の復旧時間を許容

- **推奨:** Enterprise + Local Backup

- **目標:** RPO = 0s、RTO < 3 分

- **想定コスト:** 低〜中

#### Tier 4 – 非クリティカルなワークロード\{#tier-4-non-critical-workloads}

- **特徴:** 必須ではないシステム。コスト重視。計画されたメンテナンスウィンドウを許容

- **推奨:** Standard + Local Backup

- **目標:** RPO = 0s、RTO < 3 分

- **想定コスト:** 低〜中

### コスト最適化の判断マトリクス\{#cost-optimization-decision-matrix}

| ビジネスへの影響 | データ価値 | コンプライアンス要件 | 推奨ソリューション | コストレベル |
| --- | --- | --- | --- | --- |
| 極めて高い | 極めて高い | 厳格 | Cross-region HA + Full DR | 高い |
| 高い | 高い | 中程度 | Enterprise Multi-Replica + Cross-region Backup | 中〜高 |
| 中 | 中 | 基本的 | Enterprise + Local Backup | 中 |
| 低 | 低 | なし | Standard + Basic Backup | 低 |

## よくある質問（FAQ）\{#frequently-asked-questions-faq}

**Q1: Standard および Enterprise プランはどのように高可用性を実現しますか？**

**アーキテクチャ設計**  

Zilliz Cloud は、コンピューティングとストレージを分離したアーキテクチャを採用し、3 つのデータタイプを使用します。  

- **Metadata:** etcd に保存（3 レプリカ、RAFT プロトコル）

- **Log Data:** 独自開発の Woodpecker に保存（Quorum プロトコル）

- **Raw & インデックスデータ:** オブジェクトストレージに保存され、クラウドストレージのネイティブ HA を継承

**コンピューティングノードの HA**  

- Kubernetes によって管理され、自動スケジューリングされます

- 単一ノードまたは単一 AZ の障害時に Pod が自動的に再起動されます

- Coordinator がセグメントを他の QueryNodes に再割り当てします

- インデックスとデータはストレージから再ロードされ、復旧時間は 1 分未満です

**コスト最適化**  

- **複数の永続レプリカ** + **動的なインメモリロード**を使用します  

    - 複数のインメモリレプリカを維持することによるコストの急増を回避します

    - DR アーキテクチャを簡素化します

    - ログおよびオブジェクトストレージの帯域幅を活用して復旧を高速化します

**Q2: マルチレプリカメカニズムはどのように機能しますか？**

**コアメカニズム**  

- **Shard レベル:** 複数の StreamNodes が primary/standby ロールで同じシャードをロードします

- **Segment レベル:** 複数の QueryNodes が同じセグメントをロードします。データは単一のコピーとして保持されます

**Read/Write 分離**  

- **書き込み:** primary の StreamNode が処理します

- **読み取り:** 任意の standby StreamNode または QueryNode が処理します

**主なメリット**  

- **高速フェイルオーバー:** Proxy がトラフィックを standby ノードに自動的にリダイレクトします

- **より高い QPS:** 複数のインメモリレプリカにより読み取りスループットが向上します

- **スムーズなアップグレード:** ローリングアップデートによりサービスのジッターが低減し、安定性が向上します

**Q3: Global データベースはどのようにクロスリージョンの高可用性を実現しますか？**

**CDC 同期**  

- Change Data Capture（CDC）は、DDL、DML、および一括インポート操作を同期します

- 一般的な同期レイテンシは 10 秒未満です

- 非常に低い RPO で cross-region/cross-cloud の DR を実現します

**データ書き込み戦略**  

- データは同一リージョン内の複数の AZ に同期的に書き込まれます

- 書き込みレイテンシは AZ 間のレベルです

- 極端なフェイルオーバーシナリオでは、データ損失は 10 秒未満です

<Admonition type="info" title="Notes:">

**2026 年のロードマップ:** cross-region Woodpecker により **RPO = 0** を実現

</Admonition>

**フェイルオーバーモード**  

- **手動:** OpenAPI または Web Console 経由

- **自動:** Zilliz のヘルスチェックサービスが障害を検出し、1〜3 分でフェイルオーバーを完了します

**アクセスパターン**

| モード | 特徴 | ユースケース |
| --- | --- | --- |
| **Active-Standby DR** | Primary が reads/writes; を処理し、standby はフェイルオーバー時のみアクティブになります | 標準的な災害復旧 |
| **Active-Active (Multi-Read)** | Primary が書き込みを行い、複数のリージョンが読み取りを提供します（最寄りリージョンからの読み取り） | グローバルな読み取り中心・低書き込みのワークロード |
| **Multi-Primary** *（2026 年提供予定）* | 両方のリージョンが書き込みを受け付けます。ユーザーはデータ競合を回避する必要があります | セルベースまたはシャーディングされたデプロイメント |

最新の機能アップデートまたは技術サポートについては、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。

