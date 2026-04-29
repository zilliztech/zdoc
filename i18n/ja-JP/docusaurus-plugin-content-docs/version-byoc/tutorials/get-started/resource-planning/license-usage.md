---
title: "ライセンス使用状況 | BYOC"
slug: /license-usage
sidebar_key: license-usage
sidebar_label: "ライセンス使用状況"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Bring Your Own Cloud (BYOC) オーガニゼーション向けのライセンスを提供します。ライセンスが有効な間、Zilliz Cloud はオーガニゼーションで使用されている vCPU の数に基づいて課金し、その量をライセンス容量から差し引きます。| BYOC"
type: origin
token: OWt8wevY8id5APkmzNPcsHxwnyc
sidebar_position: 8
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - ライセンス使用状況

---

import Admonition from '@theme/Admonition';


# ライセンスの使用状況

Zilliz Cloud は、Bring Your Own Cloud (BYOC) 組織向けにライセンスを提供します。ライセンスが有効である間、Zilliz Cloud は組織内で使用されている vCPU の数に基づいて課金し、その量をライセンス容量から差し引きます。

## 使用状況ダッシュボード\{#usage-dashboard}

Zilliz Cloud は、ライセンスの使用状況に関する詳細情報を提供する**使用状況**ダッシュボードを提供しています。

![Group 427326000](https://zdoc-images.s3.us-west-2.amazonaws.com/Group 427326000.png "Group 427326000")

ダッシュボードでは、以下を確認できます。

- [組織内の現在の使用状況を示す合計ライセンス容量と進行状況バー](./license-usage#total-capacity)、

- [ライセンスのステータス](./license-usage#license-status)、および

- [組織内の各プロジェクトの使用状況](./license-usage#usage-by-projects)。

## 合計容量\{#total-capacity}

合計容量とは、ライセンスが有効である間にプロジェクトで使用できる vCPU の最大数です。

Zilliz Cloud は、組織内のプロジェクト全体でいくつかのリソースグループを提供します。**Query Nodes**、**Milvus Components**、**Index Nodes**、および**Dependencies**です。

現在の使用状況を算出するため、Zilliz Cloud は各プロジェクトにおいて**Query Nodes**、**Milvus Components**、および**Index Nodes**に割り当てられた vCPU の数のみを合計します。**Dependencies**に割り当てられた vCPU の数は、現在の使用状況には含まれません。

その後、Zilliz Cloud はこの合計値を**合計容量**から差し引き、現在の使用量がライセンス容量を超えているかどうかを判断します。

- 現在の使用量が**合計容量**を下回っている場合、進行状況バーは緑色のままです。

- 現在の使用量が**合計容量**を超えた場合、進行状況バーは赤色に変わり、**使用状況**ダッシュボードの上部にアラートが表示されます。また、ライセンス容量を超えたことを示すメールも受信します。その場合は、ライセンス容量を増やすために[お問い合わせください](https://zilliz.com/contact-sales)。

    ![Group 427326002](https://zdoc-images.s3.us-west-2.amazonaws.com/Group 427326002.png "Group 427326002")

## ライセンスステータス\{#license-status}

ライセンスは特定の期間のみ有効です。**使用状況**ダッシュボードでは、ライセンスは以下の状態になっている可能性があります。

![VkmlwQeIFhqYTVbcSzscnlHnnZc](https://zdoc-images.s3.us-west-2.amazonaws.com/VkmlwQeIFhqYTVbcSzscnlHnnZc.png)

- **Active**

    このステータスバッジは、有効なライセンスの通常状態を示しており、有効期限はステータスバッジの右側に表示されます。

- **Expiring soon**

    ライセンスが**30 日**以内に失効しようとしている場合、このステータスバッジが表示されます。また、**使用状況**ダッシュボードの上部にアラートが表示され、ライセンス失効の**30 日前**および**7 日前**に通知メールが届きます。その場合は、ライセンスを更新するために[お問い合わせください](https://zilliz.com/contact-sales)。

- **Expired**

    有効期限以降は、このステータスバッジが表示されます。また、**使用状況**ダッシュボードの上部にアラートが表示され、毎日通知メールが届きます。その場合は、できるだけ早く[お問い合わせいただき](https://zilliz.com/contact-sales)、ライセンスを更新してください。

## プロジェクト別の使用状況\{#usage-by-projects}

**使用状況**ダッシュボードでは、組織内のプロジェクトごとの使用状況の内訳も確認できます。

![EjcKbOknXoAfegxflkWcfC62nJh](https://zdoc-images.s3.us-west-2.amazonaws.com/ejckboknxoafegxflkwcfc62njh.png "EjcKbOknXoAfegxflkWcfC62nJh")

内訳では、各プロジェクトの vCPU 使用量と実行中の CU が表示されます。

- **vCPU 使用量 (vCPU)**

    各プロジェクトのクラスターをサポートするために使用される**Query Nodes**、**Milvus Components**、および**Index Nodes**によって使用される vCPU の総数を示します。**Dependencies**は除外され、Zilliz Cloud によって無料で提供されます。

- **Running CU**

    各プロジェクトのクラスターによってリアルタイムで使用されている CU の総数を示します。

