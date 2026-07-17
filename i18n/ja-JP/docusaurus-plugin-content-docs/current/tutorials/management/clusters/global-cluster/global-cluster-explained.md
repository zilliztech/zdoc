---
title: "Global Cluster の説明 | Cloud"
slug: /global-cluster-explained
sidebar_label: "Global Cluster の説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud global cluster を使用すると、同じクラウドプロバイダー上の複数のリージョンに、primary cluster と複数の読み取り専用 secondary cluster をデプロイできます。 | Cloud"
type: origin
token: AICcwQ55yiNqEPkjdV6cb2i8nqe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Global Cluster の説明

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンと、以下の Google Cloud リージョンで利用できます：gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud **global cluster** を使用すると、同じクラウドプロバイダー上の複数のリージョンに、primary cluster と複数の読み取り専用 secondary cluster をデプロイできます。 

この機能は、グローバルに分散したミッションクリティカルなアプリケーション向けに設計されており、リージョン障害に対する耐障害性と、世界中のユーザー向けの低レイテンシなローカル読み取りを実現するのに役立ちます。

## 概要\{#overview}

Zilliz Cloud **global cluster** は、1 つの **primary cluster** と、同じクラウドプロバイダー上の異なるリージョンにデプロイされた最大 **5 つの読み取り専用** **secondary clusters** で構成されます。

- Primary cluster: システムの信頼できる中核です。すべての書き込み操作を処理します。また、読み取りリクエストを処理する能力は、すべての secondary cluster と同じです。

- Secondary clusters: 地理的に分散されたフォロワーです。これらは 2 つの重要な目的を果たします。1 つは災害復旧のための待機系として機能すること、もう 1 つはそのリージョンのユーザーに対してローカルな読み取り専用トラフィックを提供することです。

すべての書き込みは primary cluster に送られます。その後、Zilliz Cloud が primary cluster からすべての secondary cluster にデータ変更を自動的にレプリケートします。 

以下の図は、Zilliz Cloud における global cluster の動作を示しています。

![UZjtwUeaxh2lDsb9eeOclNZ6nae](https://zdoc-images.s3.us-west-2.amazonaws.com/UZjtwUeaxh2lDsb9eeOclNZ6nae.png)

このマルチリージョン構成には、次の利点があります。

- **リージョン障害に対する耐障害性**: primary cluster が障害または停止した場合、secondary cluster を primary cluster として昇格できます。

- **低レイテンシな読み取り**: 複数の地理的ロケーションにデータの完全なコピーがあるため、アプリケーションは最も近いリージョンから読み取り、レイテンシを最小化できます。

## 代表的なユースケース\{#typical-use-cases}

global cluster 機能には、代表的な 2 つのユースケースがあります。

- **災害復旧と高可用性:** フェイルオーバーのために複数リージョンに cluster をデプロイします。この場合は、**global** **endpoint**（単一の統一された、変更されることのない URL）経由で接続します。Zilliz Cloud は、書き込みリクエストを primary cluster に、読み取りリクエストをレイテンシに基づいて最も近い secondary に自動的にルーティングします。スイッチオーバーまたはフェイルオーバー中も、endpoint は自動的に再ルーティングされるため、コード変更は不要です。

- **環境間のデータレプリケーション:** 同じリージョンまたは異なるリージョンで複数の cluster（たとえば、本番環境とテスト環境）を実行し、それらの間でデータをレプリケートします。この場合は、各 cluster の **public** **endpoint** を使用して各 cluster に直接接続します。

詳細については、[Connect to Global Cluster](./connect-to-global-cluster) を参照してください。

## スイッチオーバーとフェイルオーバー\{#switchover-and-failover}

Zilliz Cloud global cluster は、スイッチオーバーとフェイルオーバーをサポートしています。どちらの操作でも、どのリージョンが primary cluster をホストするかが変更され、global endpoint は自動的に再ルーティングされます。

詳細については、[Switchover and Failover](./switchover-and-failover) を参照してください。

## 課金\{#billing}

global cluster では、primary cluster と secondary clusters の両方について、コンピュートおよびストレージ使用量に対して通常の Zilliz Cloud [Dedicated clusters](./dedicated-cluster-cost) として課金され、さらに cluster 間のデータレプリケーションに対する追加の [data transfer](./data-transfer-cost) 料金が発生します。 

global cluster の構成が次のとおりだとします。

- Region A にある primary cluster cluster_01

- 2 つの secondary clusters:

    - Region B の cluster_02

    - Region C の cluster_03

以下の合計に対して課金されます。

- cluster_01、cluster_02、cluster_03 の **Vector database (compute) costs**

- `cluster_01`、`cluster_02`、`cluster_03` の **Storage costs**

- `cluster_01` から `cluster_02` および `cluster_03` への **Data transfer costs**

詳細な定価については、[Zilliz Cloud List Price](https://zilliz.com/pricing/pricing-guide) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

[failover](./switchover-and-failover) 後に recycle bin にある破棄済み cluster には、**storage** のみ課金されます。

</Admonition>

## 考慮事項\{#considerations}

- **Project plan availability**: global cluster 機能にアクセスするには、Business Critical プランのマルチリージョナル project が必要です。さらに、Global Cluster 内の secondary cluster のリージョンは、[project](./manage-projects) でサポートされているリージョンに制限されます。

- **Access Control**: global cluster を構成するには Project Admin である必要があります

- **Cluster configuration**:

    - 追加できる secondary cluster は最大 5 つまでです。

    - Secondary clusters は、primary と同じクラウドプロバイダーおよび cluster type を使用する必要があります。

    - Query CU 数は primary によって制御され、secondary は自動的にそれに従います。

    - Replica 数は cluster ごとに個別に制御されます。Dynamic Scaling と Schedule Scaling も cluster ごとに独立しています。

- **Cluster operations:**

    すべての cluster 操作が primary と secondary の両方で利用できるわけではありません。次の表は、それぞれでサポートされる内容をまとめたものです。

    | **Operation** | **Primary** | **Secondary** | **Notes** |
    | --- | --- | --- | --- |
    | Read (search, query) | Yes | Yes | -- |
    | Write (insert, upsert, delete) | Yes | No | primary cluster のみが書き込み操作を受け付けます。secondary cluster への書き込みは失敗します。 |
    | Query CU scaling | Yes | No | Query CU の変更は primary に適用され、secondary は自動的にそれに従います。 |
    | Replica scaling | Yes | Yes | 各 cluster はそれぞれ独自の replica 数を制御します。Dynamic scaling と schedule scaling の構成も独立しています。 |
    | Import | No | No | まもなくサポート予定です。 |
    | Migration | Yes | No | Migration は primary cluster でのみサポートされます。primary cluster に移行されたすべてのデータは secondary clusters にレプリケートされます。 |
    | Backup | Yes | No | backup を作成できるのは primary cluster のみです。<br/>自動 backup ポリシーも primary でのみ実行されます。 |
    | Restore | No | No | まもなくサポート予定です。 |
    | Suspend / Resume | No | No | すべての primary cluster および secondary cluster は suspend できません。 |
    | Switchover | Yes | — | すべての primary cluster と secondary cluster が RUNNING 状態のときにのみ実行できます。 |
    | Failover | Yes | — | いつでも実行できます。これは高リスクの緊急操作です。 |

- **Unsupported features**

    - private global endpoint の設定はサポートされていません。global endpoint にはパブリックインターネットアクセスが必要です。

    - global cluster では Customer-managed encryption key（[CMEK](./cmek)）はサポートされていません。cluster で CMEK が有効になっている場合、その cluster を global cluster に変換することはできません。

