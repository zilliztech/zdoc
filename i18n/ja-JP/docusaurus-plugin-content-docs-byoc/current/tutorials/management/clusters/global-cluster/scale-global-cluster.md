---
title: "Global Cluster のスケール | BYOC"
slug: /scale-global-cluster
sidebar_label: "Global Cluster のスケール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "グローバル cluster のスケーリングは、通常の Dedicated cluster のスケーリングとは異なります。一部のリソース設定はプライマリ cluster から一元的に制御され、その他は cluster ごとに個別に設定されます。 | BYOC"
type: origin
token: G6xpwyghRitwbqkwl86cpb3Gn2g
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Global Cluster のスケール

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンと、以下の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

グローバル cluster のスケーリングは、通常の Dedicated cluster のスケーリングとは異なります。一部のリソース設定はプライマリ cluster から一元的に制御され、その他は cluster ごとに個別に設定されます。

このページでは、グローバル cluster のスケーリング動作と、各リソースタイプのスケーリング方法について説明します。 

## 開始する前に\{#before-you-start}

- **Project Admin** であることを確認してください。

## スケーリング動作の概要\{#scaling-behavior-overview}

次の表は、グローバル cluster でサポートされているスケーリング動作の概要を示しています。

| **Resource** | **Primary Cluster** | **Secondary cluster** |
| --- | --- | --- |
| Query CU | サポート対象。<br/>すべてのスケーリング方法（手動、動的、スケジュール）を利用可能。 | プライマリに自動追従します。個別にスケーリングすることはできません。 |
| Replica | サポート対象。<br/>すべてのスケーリング方法（手動、動的、スケジュール）を利用可能。 | サポート対象。<br/>すべてのスケーリング方法（手動、動的、スケジュール）を利用可能。<br/>cluster ごとに個別に設定されます。 |

## Query CU のスケール\{#scale-query-cus}

Query CU のスケーリングは、プライマリ cluster レベルで制御されます。プライマリの query CU 数を変更すると、Zilliz Cloud は新しい query CU 数をすべてのセカンダリ cluster に自動的に適用します。セカンダリ cluster の query CU を個別にスケーリングすることはできず、常にプライマリと同じになります。

プライマリ cluster の query CU のスケーリングは、通常の Dedicated cluster と同じ手順に従います。詳細については、以下を参照してください。

- [手動スケーリング](./manual-scaling#scale-query-cu-manually) (web console)

- [動的スケーリング](./auto-scaling#via-web-console)(web console)

- [スケジュールスケーリング](./scheduled-scaling#query-cu-scheduled-scaling)(web console)

-  [Global Cluster CU の変更](/reference/restful/modify-global-cluster-cu-v2) (RESTful API)

### 注意事項\{#considerations}

- 通常の Dedicated clusters と同じ [リソース制限](./limits#cus) が適用されます（例: query CU × Replica ≤ 10,240）。

- query CU のスケーリング中は、cluster ステータスが Modifying に変わります。スケーリングの進行中は [switchover](./switchover-and-failover#perform-a-switchover) はブロックされます。

- query CU のスケーリング中でも、緊急対応として [failover](./switchover-and-failover#perform-a-failover) を実行することは可能ですが、スケーリングタスクは失敗し、failover の完了後に再試行されます。

## Replica のスケール\{#scale-replicas}

Replica のスケーリングは、cluster ごとに個別に制御されます。グローバル cluster 内の各 cluster — プライマリおよびセカンダリ — は、それぞれのリージョンのワークロードに合わせて異なる replica 数を設定できます。これにより、トラフィックの多いリージョンにより多くのリソースを割り当てつつ、他のリージョンで過剰にプロビジョニングすることを避けられます。 

以下は、各 cluster の replica 設定例です。

| **Cluster** | **Region** | **Replica** | **Reason** |
| --- | --- | --- | --- |
| Primary | us-west-2 | 2 | 中程度の読み取り + すべての書き込みトラフィック |
| Secondary_01 | eu-west-1 | 4 | ヨーロッパでの高い読み取りトラフィック |
| Secondary_02 | ap-southeast-1 | 1 | 低トラフィック、災害復旧用の待機系のみ |

プライマリまたはセカンダリ cluster の replica のスケーリングは、通常の Dedicated cluster と同じ手順に従います。詳細については、以下を参照してください。

- [手動スケーリング](./manual-scaling#scale-replica-manually) (web console)

- [動的スケーリング](./auto-scaling#via-web-console) (web console)

- [スケジュールスケーリング](./scheduled-scaling#replica-scheduled-scaling) (web console)

- [Cluster Replica の変更](/reference/restful/modify-cluster-replica-v2) (RESTful API)

### 注意事項\{#considerations}

- 通常の Dedicated clusters と同じ [replica 制限](./limits#replicas) が適用されます。

    - マルチ replica を有効にするには、最小 8 CUs が必要です

    - 最大 10 replicas

    - CU × Replica ≤ 10,240

- replica のスケーリング中は、グローバル cluster での [switchover](./switchover-and-failover#perform-a-switchover) はブロックされます。

- replica のスケーリング中でも [failover](./switchover-and-failover#perform-a-failover) を実行することは可能ですが、スケーリングタスクは失敗し、failover の完了後に再試行されます。

## FAQs\{#faqs}

1. **プライマリ cluster とセカンダリ clusters で異なる数の query CUs を設定できますか？**

    いいえ。CU のスケーリングは常にプライマリで開始され、すべてのセカンダリが自動的に追従します。これにより、グローバル cluster 全体で一貫したキャパシティが確保されます。

1. **異なる clusters に異なる replica 数を設定できますか？**

    はい。replica のスケーリングは cluster ごとに完全に独立しています。これは、リージョンごとにトラフィックパターンが異なる場合に有用です。たとえば、トラフィックの多いリージョンでは replica を多くし、待機専用リージョンでは少なくできます。

1. **switchover の後、スケーリング設定はどうなりますか？**

    switchover の後、query CU のスケーリング対象は新しいプライマリ cluster になります。各 cluster の replica 設定は変更されません。

