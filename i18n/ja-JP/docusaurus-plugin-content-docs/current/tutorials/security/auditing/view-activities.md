---
title: "プラットフォーム監査ログの表示 | Cloud"
slug: /view-activities
sidebar_label: "プラットフォーム監査ログの表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudプラットフォーム監査ログ機能は、特定のZilliz Cloud組織に関連する料金およびアクセスログを含む、ログの包括的なビューを提供します。 | Cloud"
type: origin
token: NeUWwqRl2iwn4HkZg3ocjLjmnth
sidebar_position: 3
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - アクティビティ
  - 表示
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval

---

import Admonition from '@theme/Admonition';


# プラットフォーム監査ログの表示

Zilliz Cloud**プラットフォーム監査ログ**機能は、特定のZilliz Cloud組織に関連する料金およびアクセスログを含む、ログの包括的なビューを提供します。

## プラットフォーム監査ログを表示\{#view-platform-audit-logs}

組織ページで、左側のナビゲーションペインの**プラットフォーム監査ログ**をクリックします。ここでは、プラットフォームログの概要、各ログが記録された時刻、および関与した演算子の識別を表示できます。

![view-activities-saas](/img/view-activities-saas.png "view-activities-saas")

## プラットフォーム監査ログをフィルタ\{#filter-platform-audit-logs}

プラットフォーム監査ログのナビゲーションをコントロールしやすくするために、タイプおよび期間のフィルタを適用できます。これらのフィルタ条件を組み合わせて利用すると、よりカスタマイズされたビューが得られます。

- **期間でフィルタ**

    特定の期間内に発生したログを表示するために開始日と終了日を選択します。希望の期間を設定した後、**適用**をクリックしてこの期間内のすべてのログを表示します。

    <Admonition type="info" icon="📘" title="ノート">

    <p>選択した開始日から終了日までの期間が30日を超えないようにしてください。</p>

    </Admonition>

    ![filter-by-time-range](/img/filter-by-time-range.png "filter-by-time-range")

- **タイプでフィルタ**

    一覧から希望のログタイプを選択します。Zilliz Cloudはプラットフォーム監査ログを3つのタイプに分類します：**情報**、**警告**、および**エラー**。

    <table>
       <tr>
         <th><p><strong>アクティビティタイプ</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td><p>情報</p></td>
         <td><p>クラスター、アクセス、または料金に関連する一般情報。</p><p>例：クラスターin01-xxxxxxxxxxxxxxxが作成されました。</p></td>
       </tr>
       <tr>
         <td><p>警告</p></td>
         <td><p>注意が必要なリソース状態に関する更新。</p><p>例：「クラスターin01-xxxxxxxxxxxxxxxが削除されました。」</p></td>
       </tr>
       <tr>
         <td><p>エラー</p></td>
         <td><p>即時対応またはアクションが必要な支払い失敗やその他のシステム障害に関する通知。</p><p>例：「請求書invo-xxxxxxxxxxxxxxxxxxxxxxxxの支払いに失敗しました。」</p></td>
       </tr>
    </table>

    ![filter-by-activity-type](/img/filter-by-activity-type.png "filter-by-activity-type")

- **監査ログでフィルタ**

    ![filter-by-activity](/img/filter-by-activity.png "filter-by-activity")