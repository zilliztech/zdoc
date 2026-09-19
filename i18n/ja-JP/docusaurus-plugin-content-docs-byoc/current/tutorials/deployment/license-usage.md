---
title: "ライセンス使用量 | BYOC"
slug: /license-usage
sidebar_label: "ライセンス使用量"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Bring Your Own Cloud（BYOC）組織向けのライセンスを提供します。ライセンスが有効な間、Zilliz Cloud は組織で使用された vCPU の数に基づいて課金し、その金額をライセンス済み容量から差し引きます。 | BYOC"
type: origin
token: OWt8wevY8id5APkmzNPcsHxwnyc
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ライセンス使用量

Zilliz Cloud は、Bring Your Own Cloud（BYOC）組織向けのライセンスを提供します。ライセンスが有効な間、Zilliz Cloud は組織で使用された vCPU の数に基づいて課金し、その金額をライセンス済み容量から差し引きます。

## Usage ダッシュボード\{#usage-dashboard}

Zilliz Cloud は、ライセンスの使用状況に関する詳細情報を提供する **Usage** ダッシュボードを提供します。

![Group 427326000](https://zdoc-images.s3.us-west-2.amazonaws.com/group-427326000.png "Group 427326000")

ダッシュボードでは、以下を確認できます。

- [組織のライセンス済み容量の合計と、現在の使用量を示すプログレスバー](./license-usage#total-capacity)、

- [ライセンスのステータス](./license-usage#license-status)、

- [組織内の各プロジェクトの使用量](./license-usage#usage-by-projects)。

## 合計容量\{#total-capacity}

合計容量は、ライセンスが有効な間にプロジェクトで使用できる vCPU の最大数です。

Zilliz Cloud は、組織内のプロジェクトにまたがって、いくつかのリソースグループ（**クエリノード**、**Milvus コンポーネント**、**インデックスノード**、**依存関係**）を提供しています。

現在の使用量を判定するために、Zilliz Cloud は各プロジェクトで **クエリノード**、**Milvus コンポーネント**、**インデックスノード** にのみ割り当てられた vCPU の数を合計します。**依存関係** に割り当てられた vCPU の数は、現在の使用量には含まれません。

次に Zilliz Cloud は、現在の使用量がライセンス済み容量を超えているかどうかを判定するために、合計した数値を **合計容量** から差し引きます。

- 現在の使用量が **合計容量** を下回っている場合、プログレスバーは緑色のままです。

- 現在の使用量が **合計容量** を超えると、プログレスバーが赤色になり、**Usage** ダッシュボードの上部にアラートが表示されます。ライセンス済み容量を超えたことを通知するメールも届きます。その場合は、ライセンス済み容量を増やすために [お問い合わせください](https://zilliz.com/contact-sales)。

    ![Group 427326002](https://zdoc-images.s3.us-west-2.amazonaws.com/group-427326002.png "Group 427326002")

## ライセンスのステータス\{#license-status}

ライセンスは特定の期間にのみ有効です。**Usage** ダッシュボードでは、ライセンスが次のいずれかの状態になる場合があります。

![VkmlwQeIFhqYTVbcSzscnlHnnZc](https://zdoc-images.s3.us-west-2.amazonaws.com/VkmlwQeIFhqYTVbcSzscnlHnnZc.png)

- **Active**

    このステータスバッジは、有効なライセンスの通常の状態を示しており、有効期限はステータスバッジの右側に表示されます。

- **Expiring soon**

    ライセンスが **30 日**以内に期限切れになる場合、このステータスバッジが表示されます。**Usage** ダッシュボードの上部にもアラートが表示され、ライセンスの有効期限前の **30 日目** と **7 日目** に通知メールが届きます。その場合は、ライセンスを更新するために [お問い合わせください](https://zilliz.com/contact-sales)。

- **Expired**

    有効期限の日付以降、このステータスバッジが表示されます。**Usage** ダッシュボードの上部にもアラートが表示され、毎日通知メールが届きます。その場合は、ライセンスを更新するために、できるだけ早く [お問い合わせください](https://zilliz.com/contact-sales)。

## プロジェクト別の使用量\{#usage-by-projects}

**Usage** ダッシュボードでは、組織内のプロジェクトごとの使用量の内訳も確認できます。

![EjcKbOknXoAfegxflkWcfC62nJh](https://zdoc-images.s3.us-west-2.amazonaws.com/ejckboknxoafegxflkwcfc62njh.png "EjcKbOknXoAfegxflkWcfC62nJh")

内訳では、各プロジェクトの vCPU 使用量と Running CU を確認できます。

- **vCPU Usage (vCPU)**

    各プロジェクトのクラスターをサポートするために **クエリノード**、**Milvus コンポーネント**、**インデックスノード** が使用する vCPU の合計数を示します。**依存関係** は除外され、Zilliz Cloud によって無償で提供されます。

- **Running CU**

    各プロジェクトのクラスターがリアルタイムで使用する CU の合計数を示します。

