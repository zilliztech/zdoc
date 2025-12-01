---
title: "プラットフォーム監査ログの表示 | BYOC"
slug: /view-activities
sidebar_label: "プラットフォーム監査ログの表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudプラットフォーム監査ログ機能は、特定のZilliz Cloud組織に関連するログ、アクセスログを含む包括的なビューを提供します。 | BYOC"
type: origin
token: NeUWwqRl2iwn4HkZg3ocjLjmnth
sidebar_position: 3
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - アクティビティ
  - 表示
  - ベクトルデータベースの例
  - RAGベクトルデータベース
  - ベクトルDBとは
  - ベクトルデータベースとは

---

import Admonition from '@theme/Admonition';


# プラットフォーム監査ログの表示

Zilliz Cloudの**プラットフォーム監査ログ**機能は、特定のZilliz Cloud組織に関連するログ、アクセスログを含む包括的なビューを提供します。

## プラットフォーム監査ログの表示\{#view-platform-audit-logs}

組織ページで、左側のナビゲーションペインの**プラットフォーム監査ログ**をクリックします。ここでは、プラットフォームログの概要、各ログが記録された時刻、および関与したオペレーターの識別情報を表示できます。

![view-activities-saas](/img/view-activities-saas.png)

## プラットフォーム監査ログのフィルタリング\{#filter-platform-audit-logs}

プラットフォーム監査ログを移動する際の制御性と利便性を高めるために、種類および時間範囲でフィルターを適用できます。これらのフィルタリング条件を組み合わせて使用すると、より適切なビューが得られます。

- **時間範囲によるフィルタリング**

    特定の時間枠内で発生したログを表示するには、開始日と終了日を選択します。希望の時間範囲を設定したら、**適用**をクリックしてこの期間内のすべてのログを表示します。

    <Admonition type="info" icon="📘" title="注意">

    <p>選択した開始日と終了日の間の期間が30日を超えないようにしてください。</p>

    </Admonition>

    ![filter-by-time-range](/img/filter-by-time-range.png)

- **種類によるフィルタリング**

    リストから希望のログタイプを選択します。Zilliz Cloudはプラットフォーム監査ログを3つのタイプに分類します：**情報**、**警告**、および**エラー**。

    <table>
       <tr>
         <th><p><strong>アクティビティタイプ</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td><p>情報</p></td>
         <td><p>クラスター、アクセス、または請求に関する一般的な情報。</p><p>例：クラスター in01-xxxxxxxxxxxxxxx が作成されました。</p></td>
       </tr>
       <tr>
         <td><p>警告</p></td>
         <td><p>注意が必要なリソース状態に関する更新。</p><p>例：「クラスター in01-xxxxxxxxxxxxxxx が削除されました。」</p></td>
       </tr>
       <tr>
         <td><p>エラー</p></td>
         <td><p>即時の対応またはアクションが必要な支払い失敗またはその他のシステム障害に関する通知。</p><p>例：「請求書 invo-xxxxxxxxxxxxxxxxxxxxxxxx の支払いが失敗しました。」</p></td>
       </tr>
    </table>

    ![filter-by-activity-type](/img/filter-by-activity-type.png)

- **監査ログによるフィルタリング**

    ![filter-by-activity](/img/filter-by-activity.png)