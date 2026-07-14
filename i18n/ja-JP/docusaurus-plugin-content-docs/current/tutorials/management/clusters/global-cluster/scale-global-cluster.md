---
title: "Global Cluster のスケール | Cloud"
slug: /scale-global-cluster
sidebar_label: "Global Cluster のスケール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "global cluster のスケーリングは、通常の Dedicated cluster のスケーリングとは異なります。一部のリソース設定は primary cluster から一元的に制御され、その他は cluster ごとに個別に設定されます。 | Cloud"
type: origin
token: G6xpwyghRitwbqkwl86cpb3Gn2g
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Global Cluster のスケール

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョン、および次の Google Cloud リージョンで利用できます: gcp-us-central1 と gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

global cluster のスケーリングは、通常の Dedicated cluster のスケーリングとは異なります。一部のリソース設定は primary cluster から一元的に制御され、その他は cluster ごとに個別に設定されます。

このページでは、global cluster のスケーリング動作と、各リソースタイプをスケールする方法について説明します。 

## 始める前に\{#before-you-start}

- **Project Admin** であることを確認してください。

## スケーリング動作の概要\{#scaling-behavior-overview}

次の表は、global cluster でサポートされるスケーリング動作の概要を示しています。

| **Resource** | **Primary Cluster** | **Secondary cluster** |
| --- | --- | --- |
| Query CU | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）を利用できます。 | primary に自動追従します。個別にスケールすることはできません。 |
| Replica | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）を利用できます。 | サポートされています。<br/>すべてのスケーリング方法（手動、動的、スケジュール）を利用できます。<br/>cluster ごとに個別に設定されます。 |

## Query CU のスケール\{#scale-query-cus}

Query CU のスケーリングは、primary cluster レベルで制御されます。primary の query CU 数を変更すると、Zilliz Cloud は新しい query CU 数をすべての secondary cluster に自動的に適用します。secondary cluster の query CU を個別にスケールすることはできません。常に primary と一致します。

primary cluster の query CU のスケーリングは、通常の Dedicated cluster と同じ手順に従います。詳細は次を参照してください。

- [手動スケーリング](./manual-scaling#scale-query-cu-manually) (web コンソール)

- [動的スケーリング](./auto-scaling#via-web-console)(web コンソール)

- [スケジュールスケーリング](./scheduled-scaling#query-cu-scheduled-scaling)(web コンソール)

-  [Global Cluster CU の変更](/reference/restful/modify-global-cluster-cu-v2) (RESTful API)

### 考慮事項\{#considerations}

- 通常の Dedicated clusters と同じ[リソース制限](./limits#cus)が適用されます（例: query CU × Replica ≤ 10,240）。

- query CU のスケーリング中は、cluster のステータスが Modifying に変わります。スケーリングの進行中は[スイッチオーバー](./switchover-and-failover#perform-a-switchover)はブロックされます。

- [フェイルオーバー](./switchover-and-failover#perform-a-failover)は、緊急操作として query CU のスケーリング中でも引き続きトリガーできますが、スケーリングタスクは失敗し、フェイルオーバー完了後に再試行されます。

## Replica のスケール\{#scale-replicas}

Replica のスケーリングは、cluster ごとに個別に制御されます。global cluster 内の各 cluster（primary と secondary）は、そのリージョンのワークロードに合わせて異なる replica 数を設定できます。これにより、高トラフィックのリージョンにはより多くのリソースを割り当てつつ、他のリージョンでの過剰プロビジョニングを避けることができます。 

以下は、各 cluster に対する replica 構成の例です。

| **Cluster** | **Region** | **Replica** | **Reason** |
| --- | --- | --- | --- |
| Primary | us-west-2 | 2 | 中程度の読み取り + すべての書き込みトラフィック |
| Secondary_01 | eu-west-1 | 4 | ヨーロッパでの高い読み取りトラフィック |
| Secondary_02 | ap-southeast-1 | 1 | 低トラフィック、災害復旧用スタンバイのみ |

primary または secondary cluster の replica のスケーリングは、通常の Dedicated cluster と同じ手順に従います。詳細は次を参照してください。

- [手動スケーリング](./manual-scaling#scale-replica-manually) (web コンソール)

- [動的スケーリング](./auto-scaling#via-web-console) (web コンソール)

- [スケジュールスケーリング](./scheduled-scaling#replica-scheduled-scaling) (web コンソール)

- [Cluster Replica の変更](/reference/restful/modify-cluster-replica-v2) (RESTful API)

### 考慮事項\{#considerations}

- 通常の Dedicated clusters と同じ[replica 制限](./limits#replicas)が適用されます。

    - マルチ replica を有効にするには最小 8 CUs が必要です

    - 最大 10 replicas

    - CU × Replica ≤ 10,240

- replica のスケーリング中は、global cluster 上の[スイッチオーバー](./switchover-and-failover#perform-a-switchover)がブロックされます。

- [フェイルオーバー](./switchover-and-failover#perform-a-failover)は replica のスケーリング中でも引き続きトリガーできますが、スケーリングタスクは失敗し、フェイルオーバー完了後に再試行されます。

## FAQs\{#faqs}

1. **primary cluster と secondary cluster で異なる数の query CUs を設定できますか？**

    いいえ。CU のスケーリングは常に primary で開始され、すべての secondary が自動的に追従します。これにより、global cluster 全体で一貫した容量が確保されます。

1. **異なる cluster ごとに異なる replica 数を設定できますか？**

    はい。replica のスケーリングは cluster ごとに完全に独立しています。これは、リージョンごとにトラフィックパターンが異なる場合に便利です。たとえば、高トラフィックのリージョンではより多くの replicas を、スタンバイ専用リージョンではより少ない replicas を設定できます。

1. **スイッチオーバー後、スケーリング設定はどうなりますか？**

    スイッチオーバー後、query CU のスケーリング対象は新しい primary cluster になります。各 cluster の replica 構成は変更されません。

