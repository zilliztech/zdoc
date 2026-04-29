---
title: "プラットフォーム監査ログの表示 | Cloud"
slug: /view-activities
sidebar_key: view-activities
sidebar_label: "プラットフォーム監査ログの表示"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のプラットフォーム監査ログ機能は、特定の Zilliz Cloud 組織に関連する請求およびアクセスログを含む包括的なログビューを提供します。| Cloud"
type: origin
token: NeUWwqRl2iwn4HkZg3ocjLjmnth
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - アクティビティ
  - 表示

---

import Admonition from '@theme/Admonition';


# プラットフォーム監査ログの表示

Zilliz Cloud の**プラットフォーム監査ログ**機能は、特定の Zilliz Cloud 組織に関連するログ（課金およびアクセスログを含む）を包括的に表示します。

## プラットフォーム監査ログの表示\{#view-platform-audit-logs}

組織ページで、左側のナビゲーションペインにある**プラットフォーム監査ログ**をクリックします。ここでは、プラットフォームログの概要、各ログが記録された時刻、および関与したオペレーターの ID を確認できます。

![view-activities-saas](https://zdoc-images.s3.us-west-2.amazonaws.com/view-activities-saas.png "view-activities-saas")

## プラットフォーム監査ログのフィルタリング\{#filter-platform-audit-logs}

プラットフォーム監査ログの制御とナビゲーションを容易にするために、タイプと期間でフィルタを適用できます。これらのフィルタ条件を組み合わせることで、よりカスタマイズされたビューを得ることができます。

- **期間によるフィルタリング**

    開始日と終了日を選択して、特定の時間枠内で発生したログを表示します。希望の期間を設定した後、**適用**をクリックして、その期間内のすべてのログを表示します。

    <Admonition type="info" icon="📘" title="Notes">

    <p>選択した開始日と終了日の間隔が 30 日を超えないようにしてください。</p>

    </Admonition>

    ![filter-by-time-range](https://zdoc-images.s3.us-west-2.amazonaws.com/filter-by-time-range.png "filter-by-time-range")

- **タイプによるフィルタリング**

    リストから希望のログタイプを選択します。Zilliz Cloud では、プラットフォーム監査ログを**Info**、**Warning**、**Error**の 3 つのタイプに分類しています。

    <table>
       <tr>
         <th><p><strong>アクティビティタイプ</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td><p>Info</p></td>
         <td><p>クラスター、アクセス、または課金に関する一般情報です。</p><p>例：クラスター in01-xxxxxxxxxxxxxxx が作成されました。</p></td>
       </tr>
       <tr>
         <td><p>Warning</p></td>
         <td><p>注意が必要なリソース状態に関する更新情報です。</p><p>例：「クラスター in01-xxxxxxxxxxxxxxx が削除されました。」</p></td>
       </tr>
       <tr>
         <td><p>Error</p></td>
         <td><p>支払いの失敗や、即時の対応または処置を要するその他のシステム障害に関する通知です。</p><p>例：「請求書 invo-xxxxxxxxxxxxxxxxxxxxxxxx の支払いに失敗しました。」</p></td>
       </tr>
    </table>

    ![filter-by-activity-type](https://zdoc-images.s3.us-west-2.amazonaws.com/filter-by-activity-type.png "filter-by-activity-type")

- **監査ログによるフィルタリング**

    ![filter-by-activity](https://zdoc-images.s3.us-west-2.amazonaws.com/filter-by-activity.png "filter-by-activity")

