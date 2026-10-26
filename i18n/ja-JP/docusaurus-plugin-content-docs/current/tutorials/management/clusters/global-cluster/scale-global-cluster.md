---
title: "グローバルクラスターのスケーリング | Cloud"
slug: /scale-global-cluster
sidebar_label: "グローバルクラスターのスケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "グローバルクラスターのスケーリングは、通常の Dedicated クラスターのスケーリングとは異なります。一部のリソース設定はプライマリクラスターから一元的に制御され、その他の設定はクラスターごとに個別に構成されます。 | Cloud"
type: origin
token: G6xpwyghRitwbqkwl86cpb3Gn2g
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# グローバルクラスターのスケーリング

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、サポートされているすべての AWS リージョンで利用できます。また、リクエストに応じて Google Cloud の `us-central1` および `us-east4` リージョンでも利用できます。この機能は Microsoft Azure では利用できません。

</FeatureNote>

グローバルクラスターのスケーリングは、通常の Dedicated クラスターのスケーリングとは異なります。一部のリソース設定はプライマリクラスターから一元的に制御され、その他の設定はクラスターごとに個別に構成されます。

このページでは、グローバルクラスターのスケーリング動作と、各リソースタイプをスケールする方法について説明します。

## 始める前に\{#before-you-start}

- **Project Admin** であることを確認してください。

## スケーリング動作の概要\{#scaling-behavior-overview}

次の表は、グローバルクラスターでサポートされるスケーリング動作の概要を示しています。

| **Resource** | **プライマリクラスター** | **セカンダリクラスター** |
| --- | --- | --- |
| Query CU | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）を利用できます。 | primary に自動追従します。個別にスケールすることはできません。 |
| Replica | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）を利用できます。 | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）を利用できます。<br/>クラスターごとに個別に構成されます。 |

## Query CU のスケール\{#scale-query-cus}

Query CU のスケーリングは、プライマリクラスターのレベルで制御されます。プライマリの query CU 数を変更すると、Zilliz Cloud は新しい query CU 数をすべてのセカンダリクラスターに自動的に適用します。セカンダリクラスターの query CU を個別にスケールすることはできません。これは常にプライマリと一致します。

プライマリクラスターの query CU のスケーリングは、通常の Dedicated クラスターと同じ手順に従います。詳細については、以下を参照してください。

- [手動スケーリング](./manual-scaling#scale-query-cu-manually) (web コンソール)

- [動的スケーリング](./auto-scaling#via-web-console)(web コンソール)

- [スケジュールスケーリング](./scheduled-scaling#query-cu-scheduled-scaling)(web コンソール)

-  [Modify Global クラスター CU](/reference/restful/modify-global-cluster-cu-v2)（RESTful API）

### 考慮事項\{#considerations}

- 通常の Dedicated クラスターと同じ[リソース制限](./limits#cus)が適用されます（例：query CU × Replica ≤ 10,240）。

- query CU のスケーリング中、クラスターのステータスは Modifying に変わります。スケーリングの進行中は[スイッチオーバー](./switchover-and-failover#perform-a-switchover)がブロックされます。

- [フェイルオーバー](./switchover-and-failover#perform-a-failover)は、緊急操作として query CU のスケーリング中でも引き続きトリガーできますが、スケーリングタスクは失敗し、フェイルオーバー完了後に再試行されます。

## Replica のスケール\{#scale-replicas}

Replica のスケーリングは、クラスターごとに独立して制御されます。グローバルクラスター内の各クラスター（プライマリおよびセカンダリ）は、それぞれのリージョンのワークロードに合わせて異なる replica 数を設定できます。これにより、トラフィックの多いリージョンにより多くのリソースを割り当て、他のリージョンでは過剰なプロビジョニングを避けることができます。

以下は、各クラスターの replica を構成する例です。

| **クラスター** | **Region** | **Replica** | **Reason** |
| --- | --- | --- | --- |
| Primary | us-west-2 | 2 | 中程度の読み取り + すべての書き込みトラフィック |
| Secondary_01 | eu-west-1 | 4 | ヨーロッパでの高い読み取りトラフィック |
| Secondary_02 | ap-southeast-1 | 1 | 低トラフィック、災害復旧用スタンバイのみ |

プライマリまたはセカンダリクラスターの replica のスケーリングは、通常の Dedicated クラスターと同じ手順に従います。詳細については、以下を参照してください。

- [手動スケーリング](./manual-scaling#scale-replica-manually) (web コンソール)

- [動的スケーリング](./auto-scaling#via-web-console) (web コンソール)

- [スケジュールスケーリング](./scheduled-scaling#replica-scheduled-scaling) (web コンソール)

- [Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2)（RESTful API）

### 考慮事項\{#considerations}

- 通常の Dedicated クラスターと同じ[replica 制限](./limits#replicas)が適用されます。

    - マルチ replica を有効にするには最小 8 CUs が必要です

    - 最大 10 replicas

    - CU × Replica ≤ 10,240

- replica のスケーリング中は、グローバルクラスターで[スイッチオーバー](./switchover-and-failover#perform-a-switchover)がブロックされます。

- [フェイルオーバー](./switchover-and-failover#perform-a-failover)は replica のスケーリング中でも引き続きトリガーできますが、スケーリングタスクは失敗し、フェイルオーバー完了後に再試行されます。

## FAQs\{#faqs}

1. **プライマリクラスターとセカンダリクラスターで異なる数の query CU を設定できますか？**

    いいえ。CU のスケーリングは常にプライマリで開始され、すべてのセカンダリが自動的に追従します。これにより、グローバルクラスター全体で一貫した容量が確保されます。

1. **異なるクラスターで異なる replica 数を設定できますか？**

    はい。Replica のスケーリングはクラスターごとに完全に独立しています。これは、リージョンごとにトラフィックパターンが異なる場合に便利です。たとえば、トラフィックの多いリージョンでは replica を増やし、スタンバイ専用のリージョンでは減らします。

1. **スイッチオーバー後、スケーリング設定はどうなりますか？**

    スイッチオーバー後、query CU のスケーリングは新しいプライマリクラスターを対象とします。各クラスターの Replica 設定は変更されません。
