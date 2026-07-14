---
title: "Platform Audit Logs を表示する | Cloud"
slug: /view-activities
sidebar_label: "Platform Audit Logs を表示する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Platform Audit Logs 機能は、請求およびアクセスログを含む、特定の Zilliz Cloud 組織に関連するログの包括的なビューを提供します。 | Cloud"
type: origin
token: NeUWwqRl2iwn4HkZg3ocjLjmnth
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Platform Audit Logs を表示する

Zilliz Cloud の **Platform Audit Logs** 機能は、請求およびアクセスログを含む、特定の Zilliz Cloud 組織に関連するログの包括的なビューを提供します。

## Platform Audit Logs を表示する\{#view-platform-audit-logs}

組織ページで、左側のナビゲーションペインにある **Platform Audit Logs** をクリックします。ここでは、プラットフォームログの概要、各ログが記録された時刻、および関与した操作ユーザーの識別情報を確認できます。

![view-activities-saas](https://zdoc-images.s3.us-west-2.amazonaws.com/view-activities-saas.png "view-activities-saas")

## Platform Audit Logs をフィルタリングする\{#filter-platform-audit-logs}

Platform Audit Logs の操作性と閲覧のしやすさを高めるために、タイプと時間範囲でフィルタを適用できます。これらのフィルタ条件を組み合わせることで、より目的に合った表示が可能になります。

- **時間範囲でフィルタリング**

    開始日と終了日を選択して、特定の期間内に発生したログを表示します。希望する時間範囲を設定したら、**Apply** をクリックして、この期間内のすべてのログを表示します。

    <Admonition type="info" icon="📘" title="📘 注記">

    選択した開始日と終了日の間の期間が 30 日を超えないようにしてください。

    </Admonition>

    ![filter-by-time-range](https://zdoc-images.s3.us-west-2.amazonaws.com/filter-by-time-range.png "filter-by-time-range")

- **タイプでフィルタリング**

    リストから希望するログタイプを選択します。Zilliz Cloud では、Platform Audit Logs を **Info**、**Warning**、**Error** の 3 種類に分類しています。

    | **アクティビティタイプ** | **説明** |
    | --- | --- |
    | Info | クラスター、アクセス、または請求に関連する一般情報。<br/>例: Cluster inxx-xxxxxxxxxxxxxxx was created. |
    | Warning | 注意が必要なリソース状態に関する更新。<br/>例: "Cluster inxx-xxxxxxxxxxxxxxx was deleted." |
    | Error | 支払いの失敗や、即時の注意または対応が必要なその他のシステム障害に関する通知。<br/>例: "The payment for the invoice invo-xxxxxxxxxxxxxxxxxxxxxxxx has failed." |

    ![filter-by-activity-type](https://zdoc-images.s3.us-west-2.amazonaws.com/filter-by-activity-type.png "filter-by-activity-type")

- **監査ログでフィルタリング**

    ![filter-by-activity](https://zdoc-images.s3.us-west-2.amazonaws.com/filter-by-activity.png "filter-by-activity")

