---
title: "Global Cluster の説明 | Cloud"
slug: /global-cluster-explained
sidebar_label: "Global Cluster の説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud global cluster では、同一クラウドプロバイダー上の複数リージョンに、primary cluster と複数の読み取り専用 secondary cluster をデプロイできます。 | Cloud"
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

この機能は、すべての AWS リージョンと、以下の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud **global cluster** では、同一クラウドプロバイダー上の複数リージョンに、primary cluster と複数の読み取り専用 secondary cluster をデプロイできます。 

この機能は、グローバルに分散されたミッションクリティカルなアプリケーション向けに設計されており、リージョン障害に対する耐障害性と、世界中のユーザーに対する低レイテンシのローカル読み取りを実現するのに役立ちます。

## Overview\{#overview}

Zilliz Cloud **global cluster** は、1 つの **primary cluster** と、同一クラウドプロバイダー上の異なるリージョンにデプロイされた、最大 **5 つの読み取り専用** **secondary clusters** で構成されます。

- Primary cluster: システムの信頼できる中核です。すべての書き込み操作を処理します。また、読み取りリクエストを処理する能力は、すべての secondary cluster と同じです。

- Secondary clusters: 地理的に分散されたフォロワーです。2 つの重要な目的を果たします。1 つは災害復旧のためのスタンバイとして機能すること、もう 1 つはそのリージョンのユーザーに対してローカルの読み取り専用トラフィックを提供することです。

すべての書き込みは primary cluster に送られます。その後、Zilliz Cloud は primary cluster からすべての secondary cluster へデータ変更を自動的にレプリケートします。 

次の図は、Zilliz Cloud における global cluster の動作を示しています。

![UZjtwUeaxh2lDsb9eeOclNZ6nae](https://zdoc-images.s3.us-west-2.amazonaws.com/UZjtwUeaxh2lDsb9eeOclNZ6nae.png)

このマルチリージョン構成には、次の利点があります。

- **リージョン障害に対する耐障害性**: primary cluster に障害が発生したり停止した場合、secondary cluster を primary cluster に昇格できます。

- **低レイテンシの読み取り**: データの完全なコピーが複数の地理的拠点に存在するため、アプリケーションは最も近いリージョンから読み取ることでレイテンシを最小化できます。

## Typical use cases\{#typical-use-cases}

global cluster 機能には、2 つの代表的なユースケースがあります。

- **災害復旧と高可用性:** フェイルオーバーのために複数リージョンに cluster をデプロイします。この場合は、**global** **endpoint**（変更されない単一の統一 URL）を通じて接続します。Zilliz Cloud は、書き込みリクエストを自動的に primary cluster にルーティングし、読み取りリクエストをレイテンシに基づいて最も近い secondary にルーティングします。スイッチオーバーまたはフェイルオーバー中も、endpoint は自動的に再ルーティングされるため、コード変更は不要です。

- **環境間のデータレプリケーション:** 複数の cluster（たとえば、本番環境とテスト環境）を同一または異なるリージョンで実行し、それらの間でデータをレプリケートします。この場合は、各 cluster の **public** **endpoint** を使用して各 cluster に直接接続します。

詳細については、[Connect to Global Cluster](./connect-to-global-cluster) を参照してください。

## Switchover and failover\{#switchover-and-failover}

Zilliz Cloud global clusters は switchover と failover をサポートしています。どちらの操作でも、どのリージョンが primary cluster をホストするかが変更され、global endpoint は自動的に再ルーティングされます。

詳細については、[Switchover and Failover](./switchover-and-failover) を参照してください。

## Billing\{#billing}

global cluster では、primary cluster と secondary cluster の両方について、コンピュートとストレージの使用量に対して通常の Zilliz Cloud の [Dedicated clusters](./dedicated-cluster-cost) として課金され、さらに cluster 間のデータレプリケーションに対して追加の [data transfer](./data-transfer-cost) 料金が発生します。 

global cluster の構成が次のとおりであるとします。

- Region A にある primary cluster cluster_01

- 2 つの secondary clusters:

    - Region B にある cluster_02

    - Region C にある cluster_03

次の合計額が課金されます。

- cluster_01、cluster_02、cluster_03 の **Vector database（コンピュート）コスト**

- `cluster_01`、`cluster_02`、`cluster_03` の **ストレージコスト**。

- `cluster_01` から `cluster_02` および `cluster_03` への **Data transfer コスト**

詳細な定価については、[Zilliz Cloud List Price](https://zilliz.com/pricing/pricing-guide) を参照してください。

<Admonition type="info" icon="📘" title="注意">

[failover](./switchover-and-failover#perform-a-failover) 後にごみ箱内へ破棄された cluster については、**ストレージ** のみが課金されます。

</Admonition>

## Considerations\{#considerations}

- **Project プランの利用可否**: global cluster 機能を利用するには、Business Critical プランのマルチリージョナル project が必要です。さらに、Global Cluster 内の secondary cluster リージョンは、[project](./manage-projects) でサポートされているリージョンに制限されます。

- **Access Control**: global cluster を設定するには Project Admin である必要があります

- **Cluster configuration**:

    - 追加できる secondary cluster は最大 5 つまでです。

    - Secondary cluster は、primary と同じクラウドプロバイダーおよび cluster タイプを使用する必要があります。

    - Query CU 数は primary によって制御され、secondary は自動的にそれに従います。

    - Replica 数は cluster ごとに個別に制御されます。Dynamic Scaling と Schedule Scaling も cluster ごとに独立しています。

- **Cluster operations:**

    すべての cluster 操作が primary cluster と secondary cluster の両方で利用できるわけではありません。次の表は、それぞれでサポートされている内容をまとめたものです。

    | **Operation** | **Primary** | **Secondary** | **Notes** |
    | --- | --- | --- | --- |
    | Read (search, query) | Yes | Yes | -- |
    | Write (insert, upsert, delete) | Yes | No | 書き込み操作を受け付けるのは primary cluster のみです。secondary cluster への書き込みは失敗します。 |
    | Query CU scaling | Yes | No | Query CU の変更は primary に適用され、secondary は自動的にそれに従います。 |
    | Replica scaling | Yes | Yes | 各 cluster は自身の replica 数を制御します。Dynamic scaling と schedule scaling の設定も独立しています。 |
    | Import | No | No | 近日サポート予定です。 |
    | Migration | Yes | No | Migration は primary cluster でのみサポートされています。primary cluster に移行されたすべてのデータは secondary cluster にレプリケートされます。 |
    | Backup | Yes | No | backup を作成できるのは primary cluster のみです。<br/>自動 backup ポリシーも primary でのみ実行されます。 |
    | Restore | No | No | 近日サポート予定です。 |
    | Suspend / Resume | No | No | すべての primary cluster と secondary cluster は suspend できません。 |
    | Switchover | Yes | — | primary cluster と secondary cluster のすべてが RUNNING の場合にのみトリガーできます。 |
    | Failover | Yes | — | いつでもトリガーできます。これは高リスクの緊急操作です。 |

- **Unsupported features**

    - private global endpoint の設定はサポートされていません。global endpoint にはパブリックインターネットアクセスが必要です。

    - global cluster では、カスタマー管理暗号化キー（[CMEK](./cmek)）はサポートされていません。cluster で CMEK が有効になっている場合、その cluster を global cluster に変換することはできません。

