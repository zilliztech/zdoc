---
title: "アクティビティを見る | BYOC"
slug: /view-activities
sidebar_label: "アクティビティを見る"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのアクティビティ機能は、のアクセスイベントなど、特定のZilliz Cloud組織に関連するイベントを包括的に表示します。 | BYOC"
type: origin
token: MqTVwHcERia7pIkfkg3c2syFnne
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - activities
  - view
  - RAG
  - NLP
  - Neural Network
  - Deep Learning

---

import Admonition from '@theme/Admonition';


# アクティビティを見る

Zilliz Cloudの**アクティビティ**機能は、のアクセスイベントなど、特定のZilliz Cloud組織に関連するイベントを包括的に表示します。

## アクティビティを見る{#view-activities}

組織ページで、左ナビゲーションウィンドウの&#91;**アクティビティ**&#93;をクリックします。ここでは、アクティビティの概要、各アクティビティが置かれた時間、および特定のアクティビティに関与したオペレーターのIDを閲覧できます。

![view-activities-byoc](/img/view-activities-byoc.png)

## フィルター活動{#filter-activities}

組織のアクティビティをコントロールしやすくナビゲートするために、タイプと時間範囲でフィルターを適用することができます。これらのフィルター条件を組み合わせることで、アクティビティリストのよりカスタマイズされたビューが提供されます。

- **時間範囲でフィルター**

    特定の期間内に発生したアクティビティを表示するには、開始時間と終了時間を選択します。希望の時間範囲を設定したら、&#91;**適用**&#93;をクリックして、この期間内のすべてのアクティビティを表示します。

    <Admonition type="info" icon="📘" title="ノート">

    <p>選択した開始時間から終了時間までの期間が30日を超えないようにしてください。</p>

    </Admonition>

    ![filter-by-time-range](/img/filter-by-time-range.png)

- **アクティビティタイプで絞り込む**

    アクティビティリストからお好みのアクティビティタイプを選択してください。Zilliz Cloudは、アクティビティを**情報**、**警告**、**エラー**の3つのタイプに分類します。

    <table>
       <tr>
         <th><p><strong>アクティビティタイプ</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
       </tr>
       <tr>
         <td><p>情報を</p></td>
         <td><p>クラスタ、アクセス、または請求に関する一般的な情報。</p><p>例:クラスタin01-xxxxxxxxxxxxxxxが作成されました。</p></td>
       </tr>
       <tr>
         <td><p>警告</p></td>
         <td><p>注意が必要なリソース状態に関する更新。</p><p>例:「クラスタin01-xxxxxxxxxxxxxxxが削除されました」。</p></td>
       </tr>
       <tr>
         <td><p>エラー</p></td>
         <td><p>支払いの失敗またはその他のシステムの誤動作の通知には、直ちに対応または対応が必要です。</p><p>例:「請求書invo-xxxxxxxxxxxxxxxxxxxxxxxxの支払いに失敗しました。」</p></td>
       </tr>
    </table>

    ![filter-by-activity-type](/img/filter-by-activity-type.png)

- **アクティビティでフィルター**

    ![filter-by-activity](/img/filter-by-activity.png)

