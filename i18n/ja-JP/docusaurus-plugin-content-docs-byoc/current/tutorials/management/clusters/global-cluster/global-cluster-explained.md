---
title: "Global Cluster の説明 | BYOC"
slug: /global-cluster-explained
sidebar_label: "Global Cluster の説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud global cluster を使用すると、同じクラウドプロバイダー上の複数リージョンに、プライマリ cluster と複数の読み取り専用セカンダリ cluster をデプロイできます。 | BYOC"
type: origin
token: AICcwQ55yiNqEPkjdV6cb2i8nqe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Global Cluster の説明

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンと、次の Google Cloud リージョンで利用できます：gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud の **global cluster** を使用すると、同じクラウドプロバイダー上の複数リージョンに、プライマリ cluster と複数の読み取り専用セカンダリ cluster をデプロイできます。 

この機能は、グローバルに分散したミッションクリティカルなアプリケーション向けに設計されており、リージョン障害に対するレジリエンスと、世界中のユーザー向けの低レイテンシなローカル読み取りを実現します。

## 概要\{#overview}

Zilliz Cloud の **global cluster** は、1 つの **primary cluster** と、同じクラウドプロバイダー上の異なるリージョンにデプロイされた最大 **5 つの読み取り専用** **secondary clusters** で構成されます。

- Primary cluster: システムの信頼できる中核です。すべての書き込み操作を処理します。また、読み取りリクエストを処理する能力は、すべての secondary cluster と同じです。

- Secondary clusters: 地理的に分散したフォロワーです。これらは 2 つの重要な役割を担います。1 つは災害復旧のための待機系として機能すること、もう 1 つはそのリージョンのユーザーに対してローカルの読み取り専用トラフィックを処理することです。

すべての書き込みは primary cluster に送られます。その後、Zilliz Cloud は primary cluster からすべての secondary cluster へデータ変更を自動的にレプリケートします。 

次の図は、Zilliz Cloud における global cluster の動作を示しています。

![UZjtwUeaxh2lDsb9eeOclNZ6nae](https://zdoc-images.s3.us-west-2.amazonaws.com/UZjtwUeaxh2lDsb9eeOclNZ6nae.png)

このマルチリージョン構成には、次の利点があります。

- **リージョン障害に対するレジリエンス**: primary cluster に障害が発生したり停止したりした場合、secondary cluster を primary cluster に昇格できます。

- **低レイテンシな読み取り**: データの完全なコピーが複数の地理的ロケーションに存在するため、アプリケーションは最も近いリージョンから読み取ることでレイテンシを最小限に抑えられます。

## 代表的なユースケース\{#typical-use-cases}

global cluster 機能には、2 つの代表的なユースケースがあります。

- **災害復旧と高可用性:** フェイルオーバーのために複数リージョンに cluster をデプロイします。この場合は、**global** **endpoint**（単一で統一された、変更されない URL）を通じて接続します。Zilliz Cloud は、書き込みリクエストを自動的に primary cluster にルーティングし、読み取りリクエストをレイテンシに基づいて最も近い secondary cluster にルーティングします。切り替えやフェイルオーバーの際には、endpoint が自動的に再ルーティングするため、コード変更は不要です。

- **環境間のデータレプリケーション:** 複数の cluster（たとえば、本番環境とテスト環境）を同じまたは異なるリージョンで実行し、それらの間でデータをレプリケートします。この場合は、各 cluster の **public** **endpoint** を使用して各 cluster に直接接続します。

詳細については、[Global Cluster への接続](./connect-to-global-cluster)を参照してください。

## 切り替えとフェイルオーバー\{#switchover-and-failover}

Zilliz Cloud global cluster は、switchover と failover をサポートしています。どちらの操作でも、どのリージョンが primary cluster をホストするかが変更され、global endpoint は自動的に再ルーティングされます。

詳細については、[Switchover and Failover](./switchover-and-failover)を参照してください。

## 課金\{#billing}

global cluster では、primary cluster と secondary cluster の両方について、コンピュートおよびストレージ使用量に対して通常の Zilliz Cloud の [Dedicated clusters](./dedicated-cluster-cost) として課金され、さらに cluster 間のデータレプリケーションに対する追加の [data transfer](./data-transfer-cost) 料金が発生します。 

たとえば、global cluster の構成が次のとおりだとします。

- Region A にある primary cluster `cluster_01`

- 2 つの secondary clusters:

    - Region B にある `cluster_02`

    - Region C にある `cluster_03`

次の合計に対して課金されます。

- `cluster_01`、`cluster_02`、`cluster_03` の **ベクトルデータベース（コンピュート）コスト**

- `cluster_01`、`cluster_02`、`cluster_03` の **ストレージコスト**

- `cluster_01` から `cluster_02` および `cluster_03` への **データ転送料金**

詳細な定価については、[Zilliz Cloud List Price](https://zilliz.com/pricing/pricing-guide) を参照してください。

<Admonition type="info" icon="📘" title="注意">

[failover](./switchover-and-failover#perform-a-failover) 後にごみ箱内で破棄された cluster については、**ストレージ** のみ課金されます。

</Admonition>

## 注意事項\{#considerations}

- **プロジェクトプランの利用可否**: global cluster 機能を利用するには、Business Critical プランのマルチリージョナル project が必要です。さらに、Global Cluster 内の secondary cluster リージョンは、[project](./manage-projects) でサポートされるリージョンに限定されます。

- **アクセス制御**: global cluster を設定するには Project Admin である必要があります

- **Cluster 構成**:

    - 追加できる secondary cluster は最大 5 つまでです。

    - Secondary cluster は、primary と同じクラウドプロバイダーおよび cluster タイプを使用する必要があります。

    - Query CU 数は primary によって制御され、secondary は自動的に追従します。

    - Replica 数は cluster ごとに個別に制御されます。Dynamic Scaling と Schedule Scaling も cluster ごとに独立しています。

- **Cluster 操作:**

    すべての cluster 操作が primary と secondary の両方で利用できるわけではありません。次の表は、それぞれでサポートされる内容をまとめたものです。

    | **Operation** | **Primary** | **Secondary** | **Notes** |
    | --- | --- | --- | --- |
    | Read (search, query) | Yes | Yes | -- |
    | Write (insert, upsert, delete) | Yes | No | primary cluster のみが書き込み操作を受け付けます。secondary cluster への書き込みは失敗します。 |
    | Query CU scaling | Yes | No | Query CU の変更は primary に適用され、secondary は自動的に追従します。 |
    | Replica scaling | Yes | Yes | 各 cluster は独自の replica 数を制御します。Dynamic scaling および schedule scaling の設定もそれぞれ独立しています。 |
    | Import | No | No | 近日中にサポート予定です。 |
    | Migration | Yes | No | Migration は primary cluster でのみサポートされます。primary cluster に移行されたすべてのデータは secondary cluster にレプリケートされます。 |
    | Backup | Yes | No | backup は primary cluster に対してのみ作成できます。<br/>自動 backup ポリシーも primary でのみ実行されます。 |
    | Restore | No | No | 近日中にサポート予定です。 |
    | Suspend / Resume | No | No | すべての primary および secondary cluster は一時停止できません。 |
    | Switchover | Yes | — | primary および secondary のすべての cluster が RUNNING のときにのみ実行できます。 |
    | Failover | Yes | — | いつでも実行できます。これは高リスクの緊急操作です。 |

- **未サポート機能**

    - プライベート global endpoint の設定はサポートされていません。global endpoint にはパブリックインターネットアクセスが必要です。

    - global cluster では Customer-managed encryption key（[CMEK](./cmek)）はサポートされていません。cluster で CMEK が有効になっている場合、その cluster を global cluster に変換することはできません。

