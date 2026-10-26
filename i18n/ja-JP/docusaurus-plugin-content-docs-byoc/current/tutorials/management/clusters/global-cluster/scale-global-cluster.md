---
title: "グローバルクラスターのスケーリング | BYOC"
slug: /scale-global-cluster
sidebar_label: "グローバルクラスターのスケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "グローバルクラスターのスケーリングは、通常の Dedicated クラスターのスケーリングとは異なります。一部のリソース設定はプライマリクラスターから一元的に制御され、その他の設定はクラスターごとに個別に構成されます。 | BYOC"
type: origin
token: G6xpwyghRitwbqkwl86cpb3Gn2g
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# グローバルクラスターのスケーリング

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) と BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、サポートされているすべての AWS リージョンで利用できます。また、リクエストに応じて Google Cloud の `us-central1` および `us-east4` リージョンでも利用できます。この機能は Microsoft Azure では利用できません。

</FeatureNote>

グローバルクラスターのスケーリングは、通常の Dedicated クラスターのスケーリングとは異なります。一部のリソース設定はプライマリクラスターから一元的に制御され、その他の設定はクラスターごとに個別に構成されます。

このページでは、グローバルクラスターのスケーリング動作と、各リソースタイプをスケールする方法について説明します。 

## 開始前に\{#before-you-start}

- **Project Admin** であることを確認してください。

## スケーリング動作の概要\{#scaling-behavior-overview}

次の表では、グローバルクラスターでサポートされているスケーリング動作の概要を示します。

| **Resource** | **プライマリクラスター** | **セカンダリクラスター** |
| --- | --- | --- |
| Query CU | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）が利用可能です。 | primary に自動追従します。個別にスケールすることはできません。 |
| Replica | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）が利用可能です。 | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）が利用可能です。<br/>クラスターごとに個別に構成されます。 |

## Query CU のスケール\{#scale-query-cus}

Query CU のスケーリングは、プライマリクラスターレベルで制御されます。プライマリの Query CU 数を変更すると、Zilliz Cloud によって新しい Query CU 数がすべてのセカンダリクラスターに自動的に適用されます。セカンダリクラスターの Query CU を個別にスケールすることはできません。常にプライマリと一致します。

プライマリクラスターの Query CU のスケーリングは、通常の Dedicated クラスターと同じ手順に従います。詳細は、以下を参照してください。

- [Manual Scaling](./manual-scaling#scale-query-cu-manually) (web console)

- [Dynamic Scaling](./auto-scaling#via-web-console)(web console)

- [Scheduled Scaling](./scheduled-scaling#query-cu-scheduled-scaling)(web console)

-  [Modify Global クラスター CU](/reference/restful/modify-global-cluster-cu-v2)（RESTful API）

### 注意事項\{#considerations}

- 通常の Dedicated クラスターと同じ[リソース制限](./limits#cus)が適用されます（例：Query CU × Replica ≤ 10,240）。

- Query CU のスケーリング中は、クラスターのステータスが Modifying に変わります。スケーリングの進行中は、[スイッチオーバー](./switchover-and-failover#perform-a-switchover) がブロックされます。

- Query CU のスケーリング中でも、緊急オペレーションとして [Failover](./switchover-and-failover#perform-a-failover) をトリガーできますが、スケーリングタスクは失敗し、failover 完了後に再試行されます。

## Replica のスケール\{#scale-replicas}

レプリカのスケーリングは、クラスターごとに個別に制御されます。グローバルクラスター内の各クラスター（プライマリおよびセカンダリ）は、リージョンのワークロードに合わせて異なるレプリカ数を設定できます。これにより、トラフィックの多いリージョンにより多くのリソースを割り当てながら、他のリージョンでは過剰にプロビジョニングせずに済みます。 

以下は、クラスターごとにレプリカを構成する例です。

| **クラスター** | **Region** | **Replica** | **Reason** |
| --- | --- | --- | --- |
| Primary | us-west-2 | 2 | 中程度の読み取り + すべての書き込みトラフィック |
| Secondary_01 | eu-west-1 | 4 | ヨーロッパでの高い読み取りトラフィック |
| Secondary_02 | ap-southeast-1 | 1 | 低トラフィック、災害復旧のスタンバイ専用 |

プライマリまたはセカンダリクラスターのレプリカのスケーリングは、通常の Dedicated クラスターと同じ手順に従います。詳細は、以下を参照してください。

- [Manual Scaling](./manual-scaling#scale-replica-manually) (web console)

- [Dynamic Scaling](./auto-scaling#via-web-console) (web console)

- [Scheduled Scaling](./scheduled-scaling#replica-scheduled-scaling) (web console)

- [Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2)（RESTful API）

### 注意事項\{#considerations}

- 通常の Dedicated クラスターと同じ[レプリカの制限](./limits#replicas)が適用されます。

    - マルチ replica を有効にするには最小 8 CUs が必要です

    - 最大 10 replicas

    - CU × Replica ≤ 10,240

- レプリカのスケーリング中は、グローバルクラスターで[スイッチオーバー](./switchover-and-failover#perform-a-switchover) がブロックされます。

- Replica のスケーリング中でも [Failover](./switchover-and-failover#perform-a-failover) をトリガーできますが、スケーリングタスクは失敗し、failover 完了後に再試行されます。

## FAQs\{#faqs}

1. **プライマリクラスターとセカンダリクラスターで異なる Query CU 数を設定できますか？**

    いいえ。CU のスケーリングは常にプライマリで開始され、すべてのセカンダリが自動的に追従します。これにより、グローバルクラスター全体で一貫した容量が確保されます。

1. **クラスターごとに異なるレプリカ数を設定できますか？**

    はい。レプリカのスケーリングはクラスターごとに完全に独立しています。これは、リージョンごとにトラフィックパターンが異なる場合に便利です。たとえば、トラフィックの多いリージョンではレプリカを増やし、スタンバイ専用のリージョンでは減らすことができます。

1. **Switchover 後、スケーリング設定はどうなりますか？**

    スイッチオーバー後、Query CU のスケーリングは新しいプライマリクラスターを対象とします。各クラスターのレプリカ構成は変更されません。
