---
title: "Global Cluster のスケール | BYOC"
slug: /scale-global-cluster
sidebar_label: "Global Cluster のスケール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Global Cluster のスケーリングは、通常の Dedicated cluster のスケーリングとは異なります。一部のリソース設定は primary cluster から一元的に制御され、その他は cluster ごとに個別に設定されます。 | BYOC"
type: origin
token: G6xpwyghRitwbqkwl86cpb3Gn2g
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Global Cluster のスケール

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) と BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンと、次の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

Global Cluster のスケーリングは、通常の Dedicated cluster のスケーリングとは異なります。一部のリソース設定は primary cluster から一元的に制御され、その他は cluster ごとに個別に設定されます。

このページでは、Global Cluster のスケーリング動作と、各リソースタイプをスケールする方法について説明します。 

## 開始前に\{#before-you-start}

- **Project Admin** であることを確認してください。

## スケーリング動作の概要\{#scaling-behavior-overview}

次の表は、Global Cluster でサポートされるスケーリング動作の概要を示しています。

| **Resource** | **Primary Cluster** | **Secondary cluster** |
| --- | --- | --- |
| Query CU | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）が利用可能です。 | primary に自動追従します。個別にスケールすることはできません。 |
| Replica | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）が利用可能です。 | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）が利用可能です。<br/>cluster ごとに個別に設定されます。 |

## Query CU のスケール\{#scale-query-cus}

Query CU のスケーリングは primary cluster レベルで制御されます。primary の query CU 数を変更すると、Zilliz Cloud は新しい query CU 数をすべての secondary cluster に自動的に適用します。secondary cluster の query CU を個別にスケールすることはできず、常に primary と一致します。

Primary cluster の query CU のスケーリングは、通常の Dedicated cluster と同じ手順に従います。詳細については、以下を参照してください。

- [Manual Scaling](./manual-scaling#scale-query-cu-manually) (web console)

- [Dynamic Scaling](./auto-scaling#via-web-console)(web console)

- [Scheduled Scaling](./scheduled-scaling#query-cu-scheduled-scaling)(web console)

-  [Modify Global Cluster CU](/reference/restful/modify-global-cluster-cu-v2) (RESTful API)

### 注意事項\{#considerations}

- 通常の Dedicated clusters と同じ [resource limits](./limits#cus) が適用されます（例: query CU × Replica ≤ 10,240）。

- Query CU のスケーリング中、cluster のステータスは Modifying に変わります。スケーリングの進行中は [Switchover](./switchover-and-failover#perform-a-switchover) はブロックされます。

- Query CU のスケーリング中でも、緊急オペレーションとして [Failover](./switchover-and-failover#perform-a-failover) をトリガーできますが、スケーリングタスクは失敗し、failover 完了後に再試行されます。

## Replica のスケール\{#scale-replicas}

Replica のスケーリングは cluster ごとに個別に制御されます。Global Cluster 内の各 cluster（primary と secondary）は、それぞれのリージョンのワークロードに合わせて異なる replica 数を設定できます。これにより、トラフィックの多いリージョンにより多くのリソースを割り当てつつ、他のリージョンで過剰にプロビジョニングすることを避けられます。 

以下は、各 cluster の replica 構成例です。

| **Cluster** | **Region** | **Replica** | **Reason** |
| --- | --- | --- | --- |
| Primary | us-west-2 | 2 | 中程度の読み取り + すべての書き込みトラフィック |
| Secondary_01 | eu-west-1 | 4 | ヨーロッパでの高い読み取りトラフィック |
| Secondary_02 | ap-southeast-1 | 1 | 低トラフィック、災害復旧のスタンバイ専用 |

Primary または secondary cluster の replica のスケーリングは、通常の Dedicated cluster と同じ手順に従います。詳細については、以下を参照してください。

- [Manual Scaling](./manual-scaling#scale-replica-manually) (web console)

- [Dynamic Scaling](./auto-scaling#via-web-console) (web console)

- [Scheduled Scaling](./scheduled-scaling#replica-scheduled-scaling) (web console)

- [Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2) (RESTful API)

### 注意事項\{#considerations}

- 通常の Dedicated clusters と同じ [replica limits](./limits#replicas) が適用されます。

    - マルチ replica を有効にするには最小 8 CUs が必要です

    - 最大 10 replicas

    - CU × Replica ≤ 10,240

- Replica のスケーリング中は、Global Cluster での [switchover](./switchover-and-failover#perform-a-switchover) はブロックされます。

- Replica のスケーリング中でも [Failover](./switchover-and-failover#perform-a-failover) をトリガーできますが、スケーリングタスクは失敗し、failover 完了後に再試行されます。

## FAQs\{#faqs}

1. **Primary と secondary clusters で異なる query CU 数を設定できますか？**

    いいえ。CU のスケーリングは常に primary で開始され、すべての secondary が自動的に追従します。これにより、Global Cluster 全体で一貫したキャパシティが確保されます。

1. **異なる cluster に異なる replica 数を設定できますか？**

    はい。Replica のスケーリングは cluster ごとに完全に独立しています。これは、リージョンごとにトラフィックパターンが異なる場合に便利です。たとえば、高トラフィックのリージョンでは replica を多くし、スタンバイ専用のリージョンでは少なくできます。

1. **Switchover 後、スケーリング設定はどうなりますか？**

    Switchover 後は、新しい primary cluster が query CU スケーリングの対象になります。各 cluster の replica 構成は変更されません。

